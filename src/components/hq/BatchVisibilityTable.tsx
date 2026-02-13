import { useMemo, useState } from 'react';
import { Layers, ChevronDown, ChevronRight } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/utils/format';

export function BatchVisibilityTable() {
  const { batches, storeStocks, stores, products, transactions } = useInventory();
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [filterProduct, setFilterProduct] = useState<string>('all');

  const batchData = useMemo(() => {
    const filtered =
      filterProduct === 'all'
        ? batches
        : batches.filter((b) => b.productId === filterProduct);

    return filtered.map((batch) => {
      const product = products.find((p) => p.id === batch.productId);

      const distribution = stores.map((store) => {
        const stock = storeStocks.find(
          (ss) => ss.storeId === store.id && ss.batchId === batch.id
        );
        return { store, qty: stock?.currentQty ?? 0 };
      }).filter((d) => d.qty > 0);

      const totalInStores = distribution.reduce((sum, d) => sum + d.qty, 0);

      const totalSold = transactions.reduce((sum, txn) => {
        const batchItem = txn.batchItems.find((bi) => bi.batchId === batch.id);
        return sum + (batchItem?.qtyFromBatch ?? 0);
      }, 0);

      const unaccounted = batch.initialQty - totalInStores - totalSold;

      return { batch, product, distribution, totalInStores, totalSold, unaccounted };
    }).sort(
      (a, b) =>
        new Date(b.batch.receivedDate).getTime() -
        new Date(a.batch.receivedDate).getTime()
    );
  }, [batches, storeStocks, stores, products, transactions, filterProduct]);

  const activeProducts = products.filter((p) => p.isActive);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center">
            <Layers className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Batch Distribution
            </h2>
            <p className="text-sm text-slate-500">
              Full visibility of every batch across all locations
            </p>
          </div>
        </div>
        <select
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Products</option>
          {activeProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-8" />
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                Batch
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                Received
              </th>
              <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                Cost/Unit
              </th>
              <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                Initial
              </th>
              <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                In Stock
              </th>
              <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                Sold
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {batchData.map(({ batch, product, distribution, totalInStores, totalSold, unaccounted }) => {
              const isExpanded = expandedBatch === batch.id;
              const usedPercent =
                batch.initialQty > 0
                  ? ((totalSold / batch.initialQty) * 100)
                  : 0;

              return (
                <>
                  <tr
                    key={batch.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() =>
                      setExpandedBatch(isExpanded ? null : batch.id)
                    }
                  >
                    <td className="px-3 sm:px-6 py-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm font-mono text-slate-700 hidden sm:table-cell">
                      {batch.id}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-slate-900">
                      {product?.name ?? batch.productId}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-slate-600 hidden md:table-cell">
                      {formatDate(batch.receivedDate)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 text-right hidden md:table-cell">
                      {formatCurrency(batch.purchasePrice)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-slate-500 text-right hidden md:table-cell">
                      {batch.initialQty}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm font-medium text-slate-900 text-right">
                      {totalInStores}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 text-right hidden md:table-cell">
                      {totalSold}
                    </td>
                    <td className="px-3 sm:px-6 py-3">
                      {totalInStores === 0 && totalSold === batch.initialQty ? (
                        <Badge variant="danger">Depleted</Badge>
                      ) : usedPercent > 75 ? (
                        <Badge variant="warning">
                          {usedPercent.toFixed(0)}% sold
                        </Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${batch.id}-detail`}>
                      <td colSpan={9} className="bg-slate-50 px-3 sm:px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">
                              Location Breakdown
                            </h4>
                            <div className="space-y-2">
                              {distribution.map(({ store, qty }) => (
                                <div
                                  key={store.id}
                                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-900">
                                      {store.name}
                                    </span>
                                    {store.isWarehouse && (
                                      <Badge variant="info">Warehouse</Badge>
                                    )}
                                  </div>
                                  <span className="text-sm font-medium text-slate-700">
                                    {qty} units
                                  </span>
                                </div>
                              ))}
                              {totalSold > 0 && (
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                  <span className="text-sm text-slate-500 italic">
                                    Sold
                                  </span>
                                  <span className="text-sm font-medium text-slate-500">
                                    {totalSold} units
                                  </span>
                                </div>
                              )}
                              {unaccounted > 0 && (
                                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                                  <span className="text-sm text-amber-700 italic">
                                    Unaccounted / In Transit
                                  </span>
                                  <span className="text-sm font-medium text-amber-700">
                                    {unaccounted} units
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">
                              Batch Details
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between p-3 bg-white rounded-lg border border-slate-200">
                                <span className="text-slate-500">Purchase Price</span>
                                <span className="font-medium text-slate-900">
                                  {formatCurrency(batch.purchasePrice)}
                                </span>
                              </div>
                              <div className="flex justify-between p-3 bg-white rounded-lg border border-slate-200">
                                <span className="text-slate-500">Total Cost (at intake)</span>
                                <span className="font-medium text-slate-900">
                                  {formatCurrency(batch.purchasePrice * batch.initialQty)}
                                </span>
                              </div>
                              {batch.expiryDate && (
                                <div className="flex justify-between p-3 bg-white rounded-lg border border-slate-200">
                                  <span className="text-slate-500">Expiry Date</span>
                                  <span className="font-medium text-slate-900">
                                    {formatDate(batch.expiryDate)}
                                  </span>
                                </div>
                              )}
                              {batch.supplierNote && (
                                <div className="flex justify-between p-3 bg-white rounded-lg border border-slate-200">
                                  <span className="text-slate-500">Supplier Note</span>
                                  <span className="font-medium text-slate-900">
                                    {batch.supplierNote}
                                  </span>
                                </div>
                              )}
                              <div className="mt-3">
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                  <span>Stock utilization</span>
                                  <span>
                                    {totalSold} / {batch.initialQty} sold
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-500 rounded-full transition-all"
                                    style={{
                                      width: `${Math.min(100, (totalSold / batch.initialQty) * 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
