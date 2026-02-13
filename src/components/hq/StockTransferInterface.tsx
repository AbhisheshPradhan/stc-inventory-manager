import { useState, useMemo } from 'react';
import { ArrowRightLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/utils/format';

export function StockTransferInterface() {
  const { products, stores, batches, storeStocks, transferStock } = useInventory();

  const [fromStoreId, setFromStoreId] = useState('');
  const [productId, setProductId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [toStoreId, setToStoreId] = useState('');
  const [qty, setQty] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const warehouses = stores.filter((s) => s.isWarehouse);
  const allDestinations = stores.filter((s) => s.id !== fromStoreId);
  const activeProducts = products.filter((p) => p.isActive);
  const selectedWarehouse = stores.find((s) => s.id === fromStoreId);

  const warehouseBatches = useMemo(() => {
    if (!productId || !fromStoreId) return [];
    return storeStocks
      .filter((ss) => ss.storeId === fromStoreId && ss.currentQty > 0)
      .map((ss) => {
        const batch = batches.find((b) => b.id === ss.batchId && b.productId === productId);
        if (!batch) return null;
        return { ss, batch };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(a!.batch.receivedDate).getTime() -
          new Date(b!.batch.receivedDate).getTime()
      ) as { ss: (typeof storeStocks)[0]; batch: (typeof batches)[0] }[];
  }, [productId, fromStoreId, storeStocks, batches]);

  const selectedBatch = warehouseBatches.find((wb) => wb.batch.id === selectedBatchId);
  const maxQty = selectedBatch?.ss.currentQty ?? 0;

  const canSubmit =
    selectedBatchId && toStoreId && qty && parseInt(qty) > 0 && parseInt(qty) <= maxQty;

  const handleTransfer = () => {
    if (!canSubmit || !fromStoreId) return;
    const result = transferStock(fromStoreId, toStoreId, selectedBatchId, parseInt(qty));

    if (result.success) {
      setFeedback({ type: 'success', message: `Transferred ${qty} units successfully.` });
      setSelectedBatchId('');
      setToStoreId('');
      setQty('');
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', message: result.error ?? 'Transfer failed.' });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
          <ArrowRightLeft className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Stock Transfer</h2>
          <p className="text-sm text-slate-500">
            Move stock from a warehouse to any store
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {feedback && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                : 'bg-red-50 border border-red-100 text-red-700'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {feedback.message}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Source Warehouse
          </label>
          <select
            value={fromStoreId}
            onChange={(e) => {
              setFromStoreId(e.target.value);
              setProductId('');
              setSelectedBatchId('');
              setToStoreId('');
              setQty('');
            }}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select warehouse...</option>
            {warehouses.map((s) => (
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
            onChange={(e) => {
              setProductId(e.target.value);
              setSelectedBatchId('');
              setQty('');
            }}
            disabled={!fromStoreId}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <option value="">Select product...</option>
            {activeProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {productId && warehouseBatches.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Batch from {selectedWarehouse?.name ?? 'Warehouse'}
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {warehouseBatches.map(({ ss, batch }) => (
                <label
                  key={batch.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedBatchId === batch.id
                      ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="batch"
                    value={batch.id}
                    checked={selectedBatchId === batch.id}
                    onChange={() => {
                      setSelectedBatchId(batch.id);
                      setQty('');
                    }}
                    className="accent-indigo-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-slate-700">
                        {batch.id}
                      </span>
                      <Badge variant="info">
                        {formatDate(batch.receivedDate)}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Cost: {formatCurrency(batch.purchasePrice)} per unit
                      {batch.expiryDate && (
                        <span className="ml-2">
                          Expires: {formatDate(batch.expiryDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={ss.currentQty < 10 ? 'warning' : 'success'}>
                    {ss.currentQty} available
                  </Badge>
                </label>
              ))}
            </div>
          </div>
        )}

        {productId && warehouseBatches.length === 0 && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 text-sm text-amber-700">
            No batches available at this location for this product.
          </div>
        )}

        {selectedBatchId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Destination Store
              </label>
              <select
                value={toStoreId}
                onChange={(e) => setToStoreId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select store...</option>
                {allDestinations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.isWarehouse ? ' (HQ)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Quantity{' '}
                <span className="text-slate-400 font-normal">
                  (max {maxQty})
                </span>
              </label>
              <input
                type="number"
                min="1"
                max={maxQty}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {selectedBatchId && (
          <div className="flex justify-end pt-2">
            <Button onClick={handleTransfer} disabled={!canSubmit}>
              <ArrowRightLeft className="h-4 w-4" />
              Transfer Stock
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
