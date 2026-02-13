import { useMemo, useState } from 'react';
import { Warehouse, MapPin } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';

export function StoresPage() {
  const { stores, storeStocks, batches, products } = useInventory();
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const storeData = useMemo(
    () =>
      stores.map((store) => {
        const stocks = storeStocks.filter(
          (ss) => ss.storeId === store.id && ss.currentQty > 0
        );
        const skuSet = new Set<string>();
        let totalUnits = 0;
        let totalValue = 0;

        for (const ss of stocks) {
          const batch = batches.find((b) => b.id === ss.batchId);
          if (batch) {
            skuSet.add(batch.productId);
            totalUnits += ss.currentQty;
            totalValue += batch.purchasePrice * ss.currentQty;
          }
        }

        return { store, totalSKUs: skuSet.size, totalUnits, totalValue, stocks };
      }),
    [stores, storeStocks, batches]
  );

  const selectedStoreData = useMemo(() => {
    if (!selectedStore) return null;
    const data = storeData.find((d) => d.store.id === selectedStore);
    if (!data) return null;

    const stockDetails = data.stocks
      .map((ss) => {
        const batch = batches.find((b) => b.id === ss.batchId);
        const product = batch
          ? products.find((p) => p.id === batch.productId)
          : undefined;
        return { ss, batch, product };
      })
      .filter(
        (
          row
        ): row is {
          ss: (typeof storeStocks)[0];
          batch: (typeof batches)[0];
          product: (typeof products)[0];
        } => !!row.batch && !!row.product
      )
      .sort(
        (a, b) =>
          new Date(a.batch.receivedDate).getTime() -
          new Date(b.batch.receivedDate).getTime()
      );

    return { ...data, stockDetails };
  }, [selectedStore, storeData, batches, products, storeStocks]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {storeData.map(({ store, totalSKUs, totalUnits, totalValue }) => (
          <div
            key={store.id}
            onClick={() =>
              setSelectedStore(selectedStore === store.id ? null : store.id)
            }
            className={cn(
              'bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md',
              selectedStore === store.id
                ? 'border-indigo-500 ring-2 ring-indigo-100'
                : 'border-slate-200'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Warehouse className="h-5 w-5 text-indigo-600" />
              </div>
              <Badge variant={store.isWarehouse ? 'info' : 'default'}>
                {store.isWarehouse ? 'Warehouse' : 'Retail'}
              </Badge>
            </div>
            <h3 className="text-base font-semibold text-slate-900">{store.name}</h3>
            {store.location && (
              <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                <MapPin className="h-3 w-3" />
                {store.location}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-lg font-bold text-slate-900">{totalSKUs}</p>
                <p className="text-xs text-slate-500">SKUs</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{totalUnits}</p>
                <p className="text-xs text-slate-500">Units</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(totalValue).replace('.00', '')}
                </p>
                <p className="text-xs text-slate-500">Value</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedStoreData && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              {selectedStoreData.store.name} — Stock Detail
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                    Batch
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    Received
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                    Cost/Unit
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedStoreData.stockDetails.map((row) => (
                  <tr
                    key={`${row.ss.storeId}-${row.ss.batchId}`}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-3 sm:px-6 py-3 text-sm text-slate-900">
                      {row.product.name}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm font-mono text-slate-600 hidden sm:table-cell">
                      {row.batch.id}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-slate-600 hidden md:table-cell">
                      {formatDate(row.batch.receivedDate)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 text-right hidden sm:table-cell">
                      {formatCurrency(row.batch.purchasePrice)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm font-medium text-slate-900 text-right">
                      {row.ss.currentQty}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 text-right">
                      {formatCurrency(row.batch.purchasePrice * row.ss.currentQty)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
