import { useMemo } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/format';

export function ReportsPage() {
  const { transactions, products, stores } = useInventory();

  const productReport = useMemo(() => {
    const map = new Map<
      string,
      { unitsSold: number; revenue: number; cogs: number; margin: number }
    >();

    for (const txn of transactions) {
      const existing = map.get(txn.productId) ?? {
        unitsSold: 0,
        revenue: 0,
        cogs: 0,
        margin: 0,
      };
      map.set(txn.productId, {
        unitsSold: existing.unitsSold + txn.qtySold,
        revenue: existing.revenue + txn.totalRevenue,
        cogs: existing.cogs + txn.totalCOGS,
        margin: existing.margin + txn.totalMargin,
      });
    }

    return products
      .map((product) => {
        const data = map.get(product.id);
        if (!data) return null;
        return {
          product,
          ...data,
          marginPercent: data.revenue > 0 ? (data.margin / data.revenue) * 100 : 0,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.revenue - a!.revenue) as {
      product: (typeof products)[0];
      unitsSold: number;
      revenue: number;
      cogs: number;
      margin: number;
      marginPercent: number;
    }[];
  }, [transactions, products]);

  const storeReport = useMemo(() => {
    const map = new Map<
      string,
      { totalSales: number; revenue: number; margin: number }
    >();

    for (const txn of transactions) {
      const existing = map.get(txn.storeId) ?? {
        totalSales: 0,
        revenue: 0,
        margin: 0,
      };
      map.set(txn.storeId, {
        totalSales: existing.totalSales + 1,
        revenue: existing.revenue + txn.totalRevenue,
        margin: existing.margin + txn.totalMargin,
      });
    }

    return stores
      .map((store) => {
        const data = map.get(store.id);
        if (!data) return null;
        return {
          store,
          ...data,
          avgMargin:
            data.revenue > 0 ? (data.margin / data.revenue) * 100 : 0,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.revenue - a!.revenue) as {
      store: (typeof stores)[0];
      totalSales: number;
      revenue: number;
      margin: number;
      avgMargin: number;
    }[];
  }, [transactions, stores]);

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, txn) => ({
        revenue: acc.revenue + txn.totalRevenue,
        cogs: acc.cogs + txn.totalCOGS,
        margin: acc.margin + txn.totalMargin,
        units: acc.units + txn.qtySold,
      }),
      { revenue: 0, cogs: 0, margin: 0, units: 0 }
    );
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(totals.revenue)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total COGS</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(totals.cogs)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Margin</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {formatCurrency(totals.margin)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Margin %</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {totals.revenue > 0
              ? ((totals.margin / totals.revenue) * 100).toFixed(1)
              : '0.0'}
            %
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Margin Analysis by Product
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                  Units Sold
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                  COGS
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                  Margin
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Margin %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productReport.map((row) => (
                <tr key={row.product.id} className="hover:bg-slate-50">
                  <td className="px-3 sm:px-6 py-3 text-sm font-medium text-slate-900">
                    {row.product.name}
                  </td>
                  <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 text-right hidden sm:table-cell">
                    {row.unitsSold}
                  </td>
                  <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 text-right">
                    {formatCurrency(row.revenue)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 text-right hidden md:table-cell">
                    {formatCurrency(row.cogs)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 text-sm font-medium text-emerald-600 text-right hidden sm:table-cell">
                    {formatCurrency(row.margin)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 text-right">
                    <Badge
                      variant={
                        row.marginPercent >= 45
                          ? 'success'
                          : row.marginPercent >= 30
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {row.marginPercent.toFixed(1)}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Store Performance
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                  Total Sales
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                  Margin
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Avg Margin %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {storeReport.map((row) => (
                <tr key={row.store.id} className="hover:bg-slate-50">
                  <td className="px-3 sm:px-6 py-3 text-sm font-medium text-slate-900">
                    {row.store.name}
                  </td>
                  <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 text-right hidden sm:table-cell">
                    {row.totalSales}
                  </td>
                  <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 text-right">
                    {formatCurrency(row.revenue)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 text-sm font-medium text-emerald-600 text-right hidden sm:table-cell">
                    {formatCurrency(row.margin)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 text-right">
                    <Badge
                      variant={
                        row.avgMargin >= 45
                          ? 'success'
                          : row.avgMargin >= 30
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {row.avgMargin.toFixed(1)}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
