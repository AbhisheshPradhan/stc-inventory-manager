import { useState, useMemo } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { formatCurrency, formatDate } from '@/utils/format';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

export function PriceHistoryChart() {
  const { products, priceHistories } = useInventory();

  const activeProducts = products.filter((p) => p.isActive);
  const [selectedProductId, setSelectedProductId] = useState(
    activeProducts[0]?.id ?? ''
  );

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const chartData = useMemo(() => {
    return priceHistories
      .filter((ph) => ph.productId === selectedProductId)
      .sort(
        (a, b) =>
          new Date(a.effectiveDate).getTime() -
          new Date(b.effectiveDate).getTime()
      )
      .map((ph) => ({
        date: formatDate(ph.effectiveDate),
        rawDate: ph.effectiveDate,
        price: ph.sellingPrice,
        note: ph.note,
      }));
  }, [selectedProductId, priceHistories]);

  const priceRange = useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 100 };
    const prices = chartData.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.15 || max * 0.1;
    return {
      min: Math.max(0, Math.floor((min - padding) / 10) * 10),
      max: Math.ceil((max + padding) / 10) * 10,
    };
  }, [chartData]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Price History
          </h2>
          <p className="text-sm text-slate-500">
            Selling price changes over time
          </p>
        </div>
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
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
            No price history for this product
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                domain={[priceRange.min, priceRange.max]}
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
                    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
                      <p className="font-medium text-slate-900">
                        {formatCurrency(data.price)}
                      </p>
                      <p className="text-slate-500">{data.date}</p>
                      {data.note && (
                        <p className="text-indigo-600 text-xs mt-1">
                          {data.note}
                        </p>
                      )}
                    </div>
                  );
                }}
              />
              {selectedProduct && (
                <ReferenceLine
                  y={selectedProduct.currentSellingPrice}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Current',
                    position: 'right',
                    fill: '#10b981',
                    fontSize: 11,
                  }}
                />
              )}
              <Line
                type="stepAfter"
                dataKey="price"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, fill: '#4f46e5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Price change summary */}
        {chartData.length >= 2 && (
          <div className="mt-4 flex gap-4 text-sm">
            <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Starting: </span>
              <span className="font-medium text-slate-900">
                {formatCurrency(chartData[0].price)}
              </span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Current: </span>
              <span className="font-medium text-slate-900">
                {formatCurrency(chartData[chartData.length - 1].price)}
              </span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Change: </span>
              <span
                className={`font-medium ${
                  chartData[chartData.length - 1].price >= chartData[0].price
                    ? 'text-emerald-600'
                    : 'text-red-600'
                }`}
              >
                {(
                  ((chartData[chartData.length - 1].price - chartData[0].price) /
                    chartData[0].price) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Revisions: </span>
              <span className="font-medium text-slate-900">
                {chartData.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
