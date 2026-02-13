import { useState, useMemo } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/utils/format';

export function InventoryPage() {
  const { stores, batches, storeStocks, products } = useInventory();
  const [selectedStore, setSelectedStore] = useState<string>('all');

  const filteredData = useMemo(() => {
    const relevantStocks =
      selectedStore === 'all'
        ? storeStocks.filter((ss) => ss.currentQty > 0)
        : storeStocks.filter(
            (ss) => ss.storeId === selectedStore && ss.currentQty > 0
          );

    const batchRows = relevantStocks
      .map((ss) => {
        const batch = batches.find((b) => b.id === ss.batchId);
        const product = batch
          ? products.find((p) => p.id === batch.productId)
          : undefined;
        const store = stores.find((s) => s.id === ss.storeId);
        return { ss, batch, product, store };
      })
      .filter(
        (
          row
        ): row is {
          ss: (typeof storeStocks)[0];
          batch: (typeof batches)[0];
          product: (typeof products)[0];
          store: (typeof stores)[0];
        } => !!row.batch && !!row.product && !!row.store
      )
      .sort(
        (a, b) =>
          new Date(a.batch.receivedDate).getTime() -
          new Date(b.batch.receivedDate).getTime()
      );

    return batchRows;
  }, [selectedStore, storeStocks, batches, products, stores]);

  const getDaysOld = (dateStr: string) => {
    const now = new Date();
    const received = new Date(dateStr);
    return Math.floor((now.getTime() - received.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label className="text-sm font-medium text-slate-700">Filter by Store:</label>
        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Stores</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Batch Inventory (FIFO Order)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Batches sorted by received date — oldest first (consumed first in FIFO)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                  Batch
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Product
                </th>
                {selectedStore === 'all' && (
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    Store
                  </th>
                )}
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                  Received
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                  Cost/Unit
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Qty Here
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Age
                </th>
                {filteredData.some((r) => r.batch.expiryDate) && (
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    Expiry
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((row) => {
                const daysOld = getDaysOld(row.batch.receivedDate);
                return (
                  <tr key={`${row.ss.storeId}-${row.ss.batchId}`} className="hover:bg-slate-50">
                    <td className="px-3 sm:px-6 py-3 text-sm font-mono text-slate-600 hidden sm:table-cell">
                      {row.batch.id}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-slate-900">
                      {row.product.name}
                    </td>
                    {selectedStore === 'all' && (
                      <td className="px-3 sm:px-6 py-3 text-sm text-slate-600 hidden md:table-cell">
                        {row.store.name}
                      </td>
                    )}
                    <td className="px-3 sm:px-6 py-3 text-sm text-slate-600 hidden md:table-cell">
                      {formatDate(row.batch.receivedDate)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 text-right hidden sm:table-cell">
                      {formatCurrency(row.batch.purchasePrice)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 text-right font-medium">
                      {row.ss.currentQty}
                    </td>
                    <td className="px-3 sm:px-6 py-3">
                      <Badge
                        variant={
                          daysOld > 90
                            ? 'danger'
                            : daysOld > 60
                              ? 'warning'
                              : 'success'
                        }
                      >
                        {daysOld}d
                      </Badge>
                    </td>
                    {filteredData.some((r) => r.batch.expiryDate) && (
                      <td className="px-3 sm:px-6 py-3 text-sm text-slate-500 hidden md:table-cell">
                        {row.batch.expiryDate
                          ? formatDate(row.batch.expiryDate)
                          : '—'}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
