import { useState, useMemo } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { calculateFIFOSale } from '@/utils/fifo';
import { formatCurrency } from '@/utils/format';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

type SaleEntryModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SaleEntryModal({ open, onClose }: SaleEntryModalProps) {
  const { stores, products, batches, storeStocks, recordSale } = useInventory();

  const [storeId, setStoreId] = useState('');
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const availableProducts = useMemo(() => {
    if (!storeId) return products.filter((p) => p.isActive);
    return products.filter((p) => {
      if (!p.isActive) return false;
      const productBatchIds = batches
        .filter((b) => b.productId === p.id)
        .map((b) => b.id);
      const totalQty = storeStocks
        .filter(
          (ss) =>
            ss.storeId === storeId && productBatchIds.includes(ss.batchId)
        )
        .reduce((sum, ss) => sum + ss.currentQty, 0);
      return totalQty > 0;
    });
  }, [storeId, products, batches, storeStocks]);

  const preview = useMemo(() => {
    if (!storeId || !productId || qty <= 0) return null;
    return calculateFIFOSale(storeId, productId, qty, storeStocks, batches);
  }, [storeId, productId, qty, storeStocks, batches]);

  const selectedProduct = products.find((p) => p.id === productId);
  const projectedRevenue = selectedProduct
    ? selectedProduct.currentSellingPrice * qty
    : 0;
  const projectedMargin =
    preview && projectedRevenue > 0
      ? ((projectedRevenue - preview.totalCOGS) / projectedRevenue) * 100
      : 0;

  const handleSubmit = () => {
    if (!storeId || !productId || qty <= 0) return;
    const result = recordSale(storeId, productId, qty, 'cash');
    if (result.success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setStoreId('');
        setProductId('');
        setQty(1);
        onClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    setStoreId('');
    setProductId('');
    setQty(1);
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Record Sale">
      {submitted ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          <p className="text-lg font-medium text-slate-900">Sale Recorded!</p>
          <p className="text-sm text-slate-500">
            Inventory updated using FIFO allocation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Store
            </label>
            <select
              value={storeId}
              onChange={(e) => {
                setStoreId(e.target.value);
                setProductId('');
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a store...</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Product
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled={!storeId}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">Select a product...</option>
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatCurrency(p.currentSellingPrice)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {selectedProduct && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm">
              <p className="text-slate-500">
                Selling Price:{' '}
                <span className="font-medium text-slate-900">
                  {formatCurrency(selectedProduct.currentSellingPrice)}
                </span>{' '}
                per {selectedProduct.unit}
              </p>
            </div>
          )}

          {preview && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-700">
                FIFO Allocation Preview
              </h4>
              {preview.success ? (
                <>
                  <div className="space-y-2">
                    {preview.allocations.map((alloc) => (
                      <div
                        key={alloc.batchId}
                        className="flex items-center justify-between p-2 rounded bg-white border border-slate-200 text-sm"
                      >
                        <span className="font-mono text-slate-600">
                          {alloc.batchId}
                        </span>
                        <span>
                          {alloc.qtyAllocated} units @{' '}
                          {formatCurrency(alloc.purchasePricePerUnit)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                    <div>
                      <p className="text-xs text-indigo-600">Revenue</p>
                      <p className="text-sm font-semibold text-indigo-900">
                        {formatCurrency(projectedRevenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-600">COGS</p>
                      <p className="text-sm font-semibold text-indigo-900">
                        {formatCurrency(preview.totalCOGS)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-600">Margin</p>
                      <p className="text-sm font-semibold text-indigo-900">
                        {projectedMargin.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {preview.error}
                  {preview.totalAllocated > 0 && (
                    <Badge variant="warning">
                      Only {preview.totalAllocated} available
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!preview?.success}
            >
              Confirm Sale
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
