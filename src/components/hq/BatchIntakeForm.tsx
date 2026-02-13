import { useState } from 'react';
import { PackagePlus, CheckCircle2 } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/format';

export function BatchIntakeForm() {
  const { products, stores, addBatch } = useInventory();

  const [productId, setProductId] = useState('');
  const [targetStoreId, setTargetStoreId] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [qty, setQty] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [supplierNote, setSupplierNote] = useState('');
  const [success, setSuccess] = useState(false);

  const activeProducts = products.filter((p) => p.isActive);
  const warehouses = stores.filter((s) => s.isWarehouse);
  const selectedProduct = products.find((p) => p.id === productId);
  const totalCost =
    purchasePrice && qty ? parseFloat(purchasePrice) * parseInt(qty) : 0;

  const canSubmit =
    productId && purchasePrice && parseFloat(purchasePrice) > 0 && qty && parseInt(qty) > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    addBatch(
      productId,
      parseFloat(purchasePrice),
      parseInt(qty),
      targetStoreId || undefined,
      expiryDate || undefined,
      supplierNote || undefined
    );

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setProductId('');
      setTargetStoreId('');
      setPurchasePrice('');
      setQty('');
      setExpiryDate('');
      setSupplierNote('');
    }, 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
          <PackagePlus className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            New Purchase Order
          </h2>
          <p className="text-sm text-slate-500">
            Receive a new batch into a warehouse
          </p>
        </div>
      </div>

      {success ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          <p className="text-lg font-medium text-slate-900">
            Batch Received!
          </p>
          <p className="text-sm text-slate-500">
            Stock added to warehouse.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Product
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select product...</option>
                {activeProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Destination Warehouse
              </label>
              <select
                value={targetStoreId}
                onChange={(e) => setTargetStoreId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Kathmandu HQ (default)</option>
                {warehouses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Purchase Price per {selectedProduct?.unit ?? 'unit'} (Rs.)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Expiry Date{' '}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Supplier Note{' '}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={supplierNote}
              onChange={(e) => setSupplierNote(e.target.value)}
              placeholder="e.g., Invoice #1234, Vendor: ABC Traders"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {totalCost > 0 && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Purchase Cost</span>
              <span className="text-base font-semibold text-slate-900">
                {formatCurrency(totalCost)}
              </span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={!canSubmit}>
              <PackagePlus className="h-4 w-4" />
              Receive Batch
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
