import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/utils/format';

export function ProductsPage() {
  const { products, batches, storeStocks, priceHistories, stores } = useInventory();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const productData = useMemo(
    () =>
      products.map((product) => {
        const productBatches = batches.filter((b) => b.productId === product.id);
        const batchIds = productBatches.map((b) => b.id);
        const totalStock = storeStocks
          .filter((ss) => batchIds.includes(ss.batchId))
          .reduce((sum, ss) => sum + ss.currentQty, 0);
        const history = priceHistories
          .filter((ph) => ph.productId === product.id)
          .sort(
            (a, b) =>
              new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
          );
        return { product, productBatches, totalStock, history };
      }),
    [products, batches, storeStocks, priceHistories]
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">All Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-8" />
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                  SKU
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                  Category
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total Stock
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productData.map(({ product, productBatches, totalStock, history }) => (
                <>
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() =>
                      setExpandedId(expandedId === product.id ? null : product.id)
                    }
                  >
                    <td className="px-3 sm:px-6 py-3">
                      {expandedId === product.id ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm font-mono text-slate-600 hidden sm:table-cell">
                      {product.sku}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm font-medium text-slate-900">
                      {product.name}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-slate-600 hidden md:table-cell">
                      {product.category}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 text-right">
                      {formatCurrency(product.currentSellingPrice)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 text-right">
                      {totalStock}
                    </td>
                    <td className="px-3 sm:px-6 py-3 hidden sm:table-cell">
                      <Badge variant={product.isActive ? 'success' : 'danger'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                  {expandedId === product.id && (
                    <tr key={`${product.id}-detail`}>
                      <td colSpan={7} className="bg-slate-50 px-6 py-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">
                              Batches
                            </h4>
                            <div className="space-y-2">
                              {productBatches.map((batch) => {
                                const batchStock = storeStocks
                                  .filter((ss) => ss.batchId === batch.id)
                                  .reduce((sum, ss) => sum + ss.currentQty, 0);
                                return (
                                  <div
                                    key={batch.id}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 text-sm"
                                  >
                                    <div>
                                      <span className="font-mono text-slate-500">
                                        {batch.id}
                                      </span>
                                      <span className="ml-3 text-slate-600">
                                        Received {formatDate(batch.receivedDate)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className="text-slate-500">
                                        Cost: {formatCurrency(batch.purchasePrice)}
                                      </span>
                                      <Badge
                                        variant={
                                          batchStock === 0
                                            ? 'danger'
                                            : batchStock < 10
                                              ? 'warning'
                                              : 'success'
                                        }
                                      >
                                        {batchStock} / {batch.initialQty}
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <h4 className="text-sm font-semibold text-slate-700 mt-4 mb-3">
                              Stock by Store
                            </h4>
                            <div className="space-y-2">
                              {stores.map((store) => {
                                const storeQty = storeStocks
                                  .filter(
                                    (ss) =>
                                      ss.storeId === store.id &&
                                      productBatches.some((b) => b.id === ss.batchId)
                                  )
                                  .reduce((sum, ss) => sum + ss.currentQty, 0);
                                if (storeQty === 0) return null;
                                return (
                                  <div
                                    key={store.id}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 text-sm"
                                  >
                                    <span className="text-slate-900">{store.name}</span>
                                    <span className="font-medium text-slate-700">
                                      {storeQty} units
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">
                              Price History
                            </h4>
                            <div className="space-y-2">
                              {history.map((ph) => (
                                <div
                                  key={ph.id}
                                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 text-sm"
                                >
                                  <div>
                                    <span className="text-slate-900">
                                      {formatCurrency(ph.sellingPrice)}
                                    </span>
                                    {ph.note && (
                                      <span className="ml-2 text-slate-400">
                                        — {ph.note}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-slate-500">
                                    {formatDate(ph.effectiveDate)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
