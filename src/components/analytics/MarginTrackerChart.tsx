import { useState, useMemo } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { formatCurrency } from '@/utils/format';
import { Badge } from '@/components/ui/Badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

export function MarginTrackerChart() {
  const { products, batches, transactions } = useInventory();

  const activeProducts = products.filter((p) => p.isActive);
  const [selectedProductId, setSelectedProductId] = useState('all');

  const chartData = useMemo(() => {
    const filteredBatches =
      selectedProductId === 'all'
        ? batches
        : batches.filter((b) => b.productId === selectedProductId);

    return filteredBatches.map((batch) => {
      const product = products.find((p) => p.id === batch.productId);
      const unitsSold = batch.initialQty - batch.remainingQty;

      // Aggregate selling prices from transactions for this batch
      let totalSellingRevenue = 0;
      let totalUnitsSoldInTxns = 0;

      for (const txn of transactions) {
        for (const item of txn.batchItems) {
          if (item.batchId === batch.id) {
            totalSellingRevenue += item.sellingPricePerUnit * item.qtyFromBatch;
            totalUnitsSoldInTxns += item.qtyFromBatch;
          }
        }
      }

      const avgSellingPrice =
        totalUnitsSoldInTxns > 0
          ? totalSellingRevenue / totalUnitsSoldInTxns
          : 0;

      const totalCOGS = batch.purchasePrice * totalUnitsSoldInTxns;
      const totalMargin = totalSellingRevenue - totalCOGS;
      const marginPercent =
        totalSellingRevenue > 0
          ? (totalMargin / totalSellingRevenue) * 100
          : 0;

      return {
        batchId: batch.id,
        batchLabel: batch.id.replace('batch-', 'B'),
        productName: product?.name ?? 'Unknown',
        purchasePrice: batch.purchasePrice,
        avgSellingPrice: Math.round(avgSellingPrice),
        margin: Math.round(totalMargin),
        marginPercent,
        unitsSold,
        totalUnitsSoldInTxns,
        hasSales: totalUnitsSoldInTxns > 0,
      };
    }).filter((d) => d.hasSales);
  }, [selectedProductId, batches, products, transactions]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Batch Margin Tracker
          </h2>
          <p className="text-sm text-slate-500">
            Purchase price vs. actual selling prices per batch
          </p>
        </div>
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
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

      <div className="px-6 py-5">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
            No sales data for selected product
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="batchLabel"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm min-w-[200px]">
                        <p className="font-medium text-slate-900 mb-1">
                          {data.batchId}
                        </p>
                        <p className="text-slate-500 text-xs mb-2">
                          {data.productName}
                        </p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Purchase:</span>
                            <span className="font-medium text-red-600">
                              {formatCurrency(data.purchasePrice)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Avg Sell:</span>
                            <span className="font-medium text-indigo-600">
                              {formatCurrency(data.avgSellingPrice)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-slate-100 pt-1">
                            <span className="text-slate-500">Margin:</span>
                            <span className="font-semibold text-emerald-600">
                              {formatCurrency(data.margin)} ({data.marginPercent.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>Units sold:</span>
                            <span>{data.totalUnitsSoldInTxns}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value) => (
                    <span className="text-slate-600">{value}</span>
                  )}
                />
                <Bar
                  dataKey="purchasePrice"
                  name="Purchase Price"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.batchId} fill="#f87171" fillOpacity={0.8} />
                  ))}
                </Bar>
                <Bar
                  dataKey="avgSellingPrice"
                  name="Avg Selling Price"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.batchId} fill="#6366f1" fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Summary table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                      Batch
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                      Product
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase">
                      Purchase
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase">
                      Avg Sell
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase">
                      Margin
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase">
                      Margin %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {chartData.map((row) => (
                    <tr key={row.batchId} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono text-slate-600">
                        {row.batchId}
                      </td>
                      <td className="px-3 py-2 text-slate-900">
                        {row.productName}
                      </td>
                      <td className="px-3 py-2 text-right text-red-600">
                        {formatCurrency(row.purchasePrice)}
                      </td>
                      <td className="px-3 py-2 text-right text-indigo-600">
                        {formatCurrency(row.avgSellingPrice)}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-emerald-600">
                        {formatCurrency(row.margin)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Badge
                          variant={
                            row.marginPercent >= 40
                              ? 'success'
                              : row.marginPercent >= 25
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
          </>
        )}
      </div>
    </div>
  );
}
