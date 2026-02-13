import { useMemo } from 'react';
import { Package, DollarSign, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/utils/format';

export function OverviewPage() {
  const { products, batches, storeStocks, transactions, stores } = useInventory();

  const stats = useMemo(() => {
    const totalProducts = products.filter((p) => p.isActive).length;

    const totalStockValue = storeStocks.reduce((sum, ss) => {
      const batch = batches.find((b) => b.id === ss.batchId);
      return sum + (batch ? batch.purchasePrice * ss.currentQty : 0);
    }, 0);

    const today = new Date().toISOString().split('T')[0];
    const salesToday = transactions.filter(
      (t) => t.transactionDate.split('T')[0] === today
    ).length;

    const avgMargin =
      transactions.length > 0
        ? transactions.reduce((sum, t) => sum + t.marginPercent, 0) / transactions.length
        : 0;

    return { totalProducts, totalStockValue, salesToday, avgMargin };
  }, [products, batches, storeStocks, transactions]);

  const lowStockProducts = useMemo(() => {
    return products
      .filter((p) => p.isActive)
      .map((product) => {
        const productBatchIds = batches
          .filter((b) => b.productId === product.id)
          .map((b) => b.id);
        const totalQty = storeStocks
          .filter((ss) => productBatchIds.includes(ss.batchId))
          .reduce((sum, ss) => sum + ss.currentQty, 0);
        return { product, totalQty };
      })
      .filter((item) => item.totalQty < 30)
      .sort((a, b) => a.totalQty - b.totalQty);
  }, [products, batches, storeStocks]);

  const recentTransactions = useMemo(
    () => transactions.slice(0, 5),
    [transactions]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Active Products"
          value={stats.totalProducts.toString()}
          icon={Package}
          change={5.2}
        />
        <StatCard
          label="Stock Value (Cost)"
          value={formatCurrency(stats.totalStockValue)}
          icon={DollarSign}
          change={12.3}
        />
        <StatCard
          label="Sales Today"
          value={stats.salesToday.toString()}
          icon={ShoppingCart}
        />
        <StatCard
          label="Avg. Margin"
          value={`${stats.avgMargin.toFixed(1)}%`}
          icon={TrendingUp}
          change={2.1}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                    Store
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                    Qty
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Margin
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((txn) => {
                  const store = stores.find((s) => s.id === txn.storeId);
                  const product = products.find((p) => p.id === txn.productId);
                  return (
                    <tr key={txn.id} className="hover:bg-slate-50">
                      <td className="px-3 sm:px-6 py-3 text-sm text-slate-600">
                        {formatDate(txn.transactionDate)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 hidden sm:table-cell">
                        {store?.name ?? txn.storeId}
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-sm text-slate-900">
                        {product?.name ?? txn.productId}
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 text-right hidden sm:table-cell">
                        {txn.qtySold}
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 text-right">
                        {formatCurrency(txn.totalRevenue)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-right">
                        <Badge variant={txn.marginPercent >= 40 ? 'success' : 'warning'}>
                          {txn.marginPercent.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Low Stock Alerts</h2>
          </div>
          <div className="p-4 space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                All products are well-stocked.
              </p>
            ) : (
              lowStockProducts.map(({ product, totalQty }) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100"
                >
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">{product.sku}</p>
                  </div>
                  <Badge variant={totalQty < 15 ? 'danger' : 'warning'}>
                    {totalQty} left
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
