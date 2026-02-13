import { useState, useMemo } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { calculateFIFOSale } from '@/utils/fifo';
import { formatCurrency } from '@/utils/format';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Search,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Minus,
  Plus,
  Trash2,
  Receipt,
  XCircle,
  ArrowRightLeft,
  Wallet,
  Banknote,
  Smartphone,
  Send,
} from 'lucide-react';
import type { Product, PaymentMethod } from '@/types';

type CartItem = {
  productId: string;
  qty: number;
};

export function SellerPOSDashboard() {
  const {
    stores,
    products,
    batches,
    storeStocks,
    priceHistories,
    cashHoldings,
    recordSale,
    transferStock,
    transferCash,
  } = useInventory();

  const [storeId, setStoreId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [saleResult, setSaleResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Stock transfer state
  const [transferBatchId, setTransferBatchId] = useState('');
  const [transferToStoreId, setTransferToStoreId] = useState('');
  const [transferQty, setTransferQty] = useState('');
  const [transferFeedback, setTransferFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Cash transfer state
  const [cashTransferAmount, setCashTransferAmount] = useState('');
  const [cashTransferFeedback, setCashTransferFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const retailStores = stores.filter((s) => !s.isWarehouse);
  const selectedStore = stores.find((s) => s.id === storeId);
  const mainHQId = stores.find((s) => s.storeType === 'mainHQ')?.id ?? 'hq-ktm';

  const storeCashBalance = useMemo(() => {
    return cashHoldings.find((ch) => ch.storeId === storeId)?.balance ?? 0;
  }, [cashHoldings, storeId]);

  // Get the most recent selling price from PriceHistory for a product
  const getLatestPrice = (productId: string): number => {
    const history = priceHistories
      .filter((ph) => ph.productId === productId)
      .sort(
        (a, b) =>
          new Date(b.effectiveDate).getTime() -
          new Date(a.effectiveDate).getTime()
      );
    if (history.length > 0) return history[0].sellingPrice;
    const product = products.find((p) => p.id === productId);
    return product?.currentSellingPrice ?? 0;
  };

  // Calculate total stock at selected store for a product
  const getStoreProductQty = (productId: string): number => {
    if (!storeId) return 0;
    const productBatchIds = batches
      .filter((b) => b.productId === productId)
      .map((b) => b.id);
    return storeStocks
      .filter(
        (ss) =>
          ss.storeId === storeId && productBatchIds.includes(ss.batchId)
      )
      .reduce((sum, ss) => sum + ss.currentQty, 0);
  };

  // Filter products: active, matching search
  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      if (!p.isActive) return false;
      if (
        query &&
        !p.name.toLowerCase().includes(query) &&
        !p.sku.toLowerCase().includes(query) &&
        !p.category.toLowerCase().includes(query)
      )
        return false;
      return true;
    });
  }, [products, searchQuery]);

  const addToCart = (product: Product) => {
    const available = getStoreProductQty(product.id);
    if (available <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.qty >= available) return prev;
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, { productId: product.id, qty: 1 }];
    });
  };

  const updateCartQty = (productId: string, newQty: number) => {
    const available = getStoreProductQty(productId);
    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }
    if (newQty > available) return;
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, qty: newQty } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  // FIFO preview for all cart items
  const cartPreviews = useMemo(() => {
    if (!storeId || cart.length === 0) return [];
    return cart.map((item) => ({
      ...item,
      fifo: calculateFIFOSale(
        storeId,
        item.productId,
        item.qty,
        storeStocks,
        batches
      ),
      sellingPrice: getLatestPrice(item.productId),
    }));
  }, [storeId, cart, storeStocks, batches, priceHistories]);

  const allValid = cartPreviews.length > 0 && cartPreviews.every((p) => p.fifo.success);

  const cartTotals = useMemo(() => {
    let revenue = 0;
    let cogs = 0;
    for (const p of cartPreviews) {
      revenue += p.sellingPrice * p.qty;
      cogs += p.fifo.totalCOGS;
    }
    const margin = revenue > 0 ? ((revenue - cogs) / revenue) * 100 : 0;
    return { revenue, cogs, margin, itemCount: cart.reduce((s, i) => s + i.qty, 0) };
  }, [cartPreviews, cart]);

  const handleCheckout = () => {
    if (!allValid) return;

    const errors: string[] = [];
    for (const item of cart) {
      const result = recordSale(storeId, item.productId, item.qty, paymentMethod);
      if (!result.success) {
        const product = products.find((p) => p.id === item.productId);
        errors.push(`${product?.name ?? item.productId}: ${result.error}`);
      }
    }

    if (errors.length === 0) {
      const methodLabel = paymentMethod === 'fonepay' ? 'Fonepay' : 'Cash';
      setSaleResult({
        success: true,
        message: `${cart.length} item(s) sold via ${methodLabel}!`,
      });
      setCart([]);
      setTimeout(() => setSaleResult(null), 3000);
    } else {
      setSaleResult({
        success: false,
        message: errors.join('; '),
      });
      setCart([]);
      setTimeout(() => setSaleResult(null), 5000);
    }
  };

  const handleStoreChange = (newStoreId: string) => {
    setStoreId(newStoreId);
    setCart([]);
    setSaleResult(null);
    setTransferBatchId('');
    setTransferToStoreId('');
    setTransferQty('');
    setTransferFeedback(null);
    setCashTransferAmount('');
    setCashTransferFeedback(null);
  };

  // Stock at this store for transfer section
  const localStockBatches = useMemo(() => {
    if (!storeId) return [];
    return storeStocks
      .filter((ss) => ss.storeId === storeId && ss.currentQty > 0)
      .map((ss) => {
        const batch = batches.find((b) => b.id === ss.batchId);
        const product = batch ? products.find((p) => p.id === batch.productId) : null;
        return { ss, batch, product };
      })
      .filter((x) => x.batch && x.product)
      .sort(
        (a, b) =>
          new Date(a.batch!.receivedDate).getTime() -
          new Date(b.batch!.receivedDate).getTime()
      );
  }, [storeId, storeStocks, batches, products]);

  const transferMaxQty = localStockBatches.find((x) => x.batch?.id === transferBatchId)?.ss.currentQty ?? 0;

  const handleStockTransfer = () => {
    if (!storeId || !transferBatchId || !transferToStoreId || !transferQty) return;
    const qty = parseInt(transferQty);
    if (qty <= 0) return;

    const result = transferStock(storeId, transferToStoreId, transferBatchId, qty);
    if (result.success) {
      setTransferFeedback({ type: 'success', message: `Transferred ${qty} units successfully.` });
      setTransferBatchId('');
      setTransferToStoreId('');
      setTransferQty('');
      setTimeout(() => setTransferFeedback(null), 3000);
    } else {
      setTransferFeedback({ type: 'error', message: result.error ?? 'Transfer failed.' });
      setTimeout(() => setTransferFeedback(null), 4000);
    }
  };

  const handleCashTransfer = () => {
    if (!storeId) return;
    const amount = parseFloat(cashTransferAmount);
    if (!amount || amount <= 0) return;

    const result = transferCash(storeId, mainHQId, amount);
    if (result.success) {
      setCashTransferFeedback({ type: 'success', message: `Rs. ${amount.toLocaleString()} sent to Kathmandu HQ.` });
      setCashTransferAmount('');
      setTimeout(() => setCashTransferFeedback(null), 3000);
    } else {
      setCashTransferFeedback({ type: 'error', message: result.error ?? 'Transfer failed.' });
      setTimeout(() => setCashTransferFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main POS Area */}
      <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-10rem)] gap-4 lg:gap-6">
        {/* Left: Product Search & Grid */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Store Selector & Search */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
            <select
              value={storeId}
              onChange={(e) => handleStoreChange(e.target.value)}
              className="px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
            >
              <option value="">Select store...</option>
              {retailStores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {storeId && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                <Wallet className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">
                  {formatCurrency(storeCashBalance)}
                </span>
              </div>
            )}

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by name, SKU, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {!storeId ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">Select a store to begin</p>
                <p className="text-sm">Choose a retail location to start selling</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredProducts.map((product) => {
                  const stock = getStoreProductQty(product.id);
                  const price = getLatestPrice(product.id);
                  const inCart = cart.find((i) => i.productId === product.id);
                  const outOfStock = stock <= 0;

                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={outOfStock}
                      className={`text-left p-4 rounded-lg border transition-all ${
                        outOfStock
                          ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                          : inCart
                            ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 text-sm truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {product.sku} &middot; {product.category}
                          </p>
                        </div>
                        {inCart && (
                          <Badge variant="info">{inCart.qty} in cart</Badge>
                        )}
                      </div>
                      <div className="flex items-end justify-between mt-3">
                        <p className="text-lg font-bold text-indigo-600">
                          {formatCurrency(price)}
                        </p>
                        <div className="text-right">
                          {outOfStock ? (
                            <Badge variant="danger">Out of stock</Badge>
                          ) : (
                            <span className="text-xs text-slate-500">
                              {stock} {product.unit} available
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredProducts.length === 0 && (
                <div className="flex items-center justify-center py-16 text-slate-400">
                  <div className="text-center">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No products found</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Cart & Checkout */}
        <div className="w-full lg:w-96 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm">
          {/* Cart Header */}
          <div className="px-5 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-600" />
                <h2 className="font-semibold text-slate-900">Current Sale</h2>
              </div>
              {cart.length > 0 && (
                <Badge variant="info">{cartTotals.itemCount} units</Badge>
              )}
            </div>
          </div>

          {/* Sale Result Banner */}
          {saleResult && (
            <div
              className={`px-5 py-3 flex items-center gap-2 text-sm ${
                saleResult.success
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {saleResult.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0" />
              )}
              {saleResult.message}
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-5 py-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ShoppingCart className="h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm">Cart is empty</p>
                <p className="text-xs">Click a product to add it</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => {
                  const product = products.find(
                    (p) => p.id === item.productId
                  );
                  if (!product) return null;
                  const price = getLatestPrice(item.productId);
                  const available = getStoreProductQty(item.productId);
                  const preview = cartPreviews.find(
                    (p) => p.productId === item.productId
                  );

                  return (
                    <div
                      key={item.productId}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatCurrency(price)} per {product.unit}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateCartQty(item.productId, item.qty - 1)
                            }
                            className="p-1 rounded bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-10 text-center text-sm font-medium">
                            {item.qty}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQty(item.productId, item.qty + 1)
                            }
                            disabled={item.qty >= available}
                            className="p-1 rounded bg-white border border-slate-300 hover:bg-slate-100 transition-colors disabled:opacity-50"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <span className="text-xs text-slate-400">
                            / {available}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(price * item.qty)}
                        </p>
                      </div>

                      {/* FIFO allocation preview */}
                      {preview && preview.fifo.success && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <p className="text-[11px] text-slate-500 mb-1">
                            FIFO Allocation:
                          </p>
                          {preview.fifo.allocations.map((alloc) => (
                            <div
                              key={alloc.batchId}
                              className="flex justify-between text-[11px] text-slate-500"
                            >
                              <span className="font-mono">
                                {alloc.batchId}
                              </span>
                              <span>
                                {alloc.qtyAllocated} @ {formatCurrency(alloc.purchasePricePerUnit)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {preview && !preview.fifo.success && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {preview.fifo.error}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment Method & Checkout Summary */}
          <div className="border-t border-slate-200 px-5 py-4 space-y-3">
            {cart.length > 0 && (
              <>
                {/* Payment Method Toggle */}
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">Payment Method</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        paymentMethod === 'cash'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 ring-1 ring-emerald-200'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Banknote className="h-4 w-4" />
                      Cash
                    </button>
                    <button
                      onClick={() => setPaymentMethod('fonepay')}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        paymentMethod === 'fonepay'
                          ? 'bg-purple-50 border-purple-300 text-purple-700 ring-1 ring-purple-200'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Smartphone className="h-4 w-4" />
                      Fonepay
                    </button>
                  </div>
                  {paymentMethod === 'fonepay' && (
                    <p className="text-[11px] text-purple-600 mt-1.5">
                      Fonepay payments go directly to Kathmandu HQ
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Revenue</span>
                    <span>{formatCurrency(cartTotals.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>COGS</span>
                    <span>{formatCurrency(cartTotals.cogs)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-900">
                    <span>Margin</span>
                    <span
                      className={
                        cartTotals.margin >= 30
                          ? 'text-emerald-600'
                          : cartTotals.margin >= 15
                            ? 'text-amber-600'
                            : 'text-red-600'
                      }
                    >
                      {cartTotals.margin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg text-slate-900 pt-1.5 border-t border-slate-200">
                    <span>Total</span>
                    <span>{formatCurrency(cartTotals.revenue)}</span>
                  </div>
                </div>
              </>
            )}

            <Button
              onClick={handleCheckout}
              disabled={!allValid}
              className="w-full py-3 text-base"
            >
              <ShoppingCart className="h-5 w-5" />
              Sell {cart.length > 0 ? `(${cartTotals.itemCount} units)` : ''}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Sections: Stock Transfer & Cash Transfer */}
      {storeId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Transfer */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                <ArrowRightLeft className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Transfer Stock</h2>
                <p className="text-sm text-slate-500">
                  Move stock from {selectedStore?.name} to another location
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {transferFeedback && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                    transferFeedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                      : 'bg-red-50 border border-red-100 text-red-700'
                  }`}
                >
                  {transferFeedback.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  {transferFeedback.message}
                </div>
              )}

              {localStockBatches.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <ArrowRightLeft className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No stock available at this location</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Batch to Transfer
                    </label>
                    <select
                      value={transferBatchId}
                      onChange={(e) => {
                        setTransferBatchId(e.target.value);
                        setTransferQty('');
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select batch...</option>
                      {localStockBatches.map(({ ss, batch, product }) => (
                        <option key={batch!.id} value={batch!.id}>
                          {product!.name} - {batch!.id} ({ss.currentQty} avail, cost {formatCurrency(batch!.purchasePrice)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Destination
                      </label>
                      <select
                        value={transferToStoreId}
                        onChange={(e) => setTransferToStoreId(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select location...</option>
                        {stores
                          .filter((s) => s.id !== storeId)
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}{s.isWarehouse ? ' (HQ)' : ''}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Quantity{' '}
                        {transferBatchId && (
                          <span className="text-slate-400 font-normal">(max {transferMaxQty})</span>
                        )}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={transferMaxQty}
                        value={transferQty}
                        onChange={(e) => setTransferQty(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleStockTransfer}
                      disabled={
                        !transferBatchId ||
                        !transferToStoreId ||
                        !transferQty ||
                        parseInt(transferQty) <= 0 ||
                        parseInt(transferQty) > transferMaxQty
                      }
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      Transfer Stock
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Cash Transfer to HQ */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Send className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Cash Remittance</h2>
                <p className="text-sm text-slate-500">
                  Send cash holdings to Kathmandu HQ
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {cashTransferFeedback && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                    cashTransferFeedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                      : 'bg-red-50 border border-red-100 text-red-700'
                  }`}
                >
                  {cashTransferFeedback.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  {cashTransferFeedback.message}
                </div>
              )}

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm text-slate-600">Cash on Hand</span>
                  </div>
                  <span className="text-xl font-bold text-slate-900">
                    {formatCurrency(storeCashBalance)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Amount to Send (Rs.)
                </label>
                <input
                  type="number"
                  min="1"
                  max={storeCashBalance}
                  value={cashTransferAmount}
                  onChange={(e) => setCashTransferAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCashTransferAmount(String(storeCashBalance))}
                  disabled={storeCashBalance <= 0}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
                >
                  Send All
                </button>
                <Button
                  onClick={handleCashTransfer}
                  disabled={
                    !cashTransferAmount ||
                    parseFloat(cashTransferAmount) <= 0 ||
                    parseFloat(cashTransferAmount) > storeCashBalance
                  }
                >
                  <Send className="h-4 w-4" />
                  Send to Kathmandu HQ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
