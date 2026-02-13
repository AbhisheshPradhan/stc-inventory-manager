import { useMemo } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { formatCurrency, formatDate } from '@/utils/format';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';

type BatchHealth = {
  batchId: string;
  productName: string;
  receivedDate: string;
  expiryDate?: string;
  purchasePrice: number;
  initialQty: number;
  remainingQty: number;
  ageDays: number;
  daysToExpiry: number | null;
  utilization: number;
  storeBreakdown: { storeName: string; qty: number }[];
  deadStockValue: number;
  severity: 'critical' | 'warning' | 'watch' | 'healthy';
};

function getSeverity(
  ageDays: number,
  utilization: number,
  daysToExpiry: number | null
): BatchHealth['severity'] {
  if (daysToExpiry !== null && daysToExpiry <= 30) return 'critical';
  if (ageDays > 90 && utilization < 50) return 'critical';
  if (ageDays > 60 && utilization < 40) return 'warning';
  if (ageDays > 45 || (daysToExpiry !== null && daysToExpiry <= 90))
    return 'watch';
  return 'healthy';
}

export function InventoryExhaustionView() {
  const { batches, products, stores, storeStocks } = useInventory();

  const batchHealthData = useMemo(() => {
    const now = new Date();

    return batches
      .map((batch): BatchHealth | null => {
        if (batch.remainingQty <= 0) return null;

        const product = products.find((p) => p.id === batch.productId);
        if (!product) return null;

        const ageDays = Math.floor(
          (now.getTime() - new Date(batch.receivedDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        const daysToExpiry = batch.expiryDate
          ? Math.floor(
              (new Date(batch.expiryDate).getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null;

        const utilization =
          batch.initialQty > 0
            ? ((batch.initialQty - batch.remainingQty) / batch.initialQty) *
              100
            : 0;

        const storeBreakdown = storeStocks
          .filter((ss) => ss.batchId === batch.id && ss.currentQty > 0)
          .map((ss) => ({
            storeName:
              stores.find((s) => s.id === ss.storeId)?.name ?? ss.storeId,
            qty: ss.currentQty,
          }))
          .sort((a, b) => b.qty - a.qty);

        const deadStockValue = batch.remainingQty * batch.purchasePrice;

        return {
          batchId: batch.id,
          productName: product.name,
          receivedDate: batch.receivedDate,
          expiryDate: batch.expiryDate,
          purchasePrice: batch.purchasePrice,
          initialQty: batch.initialQty,
          remainingQty: batch.remainingQty,
          ageDays,
          daysToExpiry,
          utilization,
          storeBreakdown,
          deadStockValue,
          severity: getSeverity(ageDays, utilization, daysToExpiry),
        };
      })
      .filter(Boolean) as BatchHealth[];
  }, [batches, products, stores, storeStocks]);

  const sorted = useMemo(() => {
    const severityOrder = { critical: 0, warning: 1, watch: 2, healthy: 3 };
    return [...batchHealthData].sort(
      (a, b) =>
        severityOrder[a.severity] - severityOrder[b.severity] ||
        b.ageDays - a.ageDays
    );
  }, [batchHealthData]);

  const summaryStats = useMemo(() => {
    const critical = sorted.filter((b) => b.severity === 'critical');
    const warning = sorted.filter((b) => b.severity === 'warning');
    const totalDeadValue = sorted.reduce(
      (sum, b) => sum + b.deadStockValue,
      0
    );
    const avgUtilization =
      sorted.length > 0
        ? sorted.reduce((sum, b) => sum + b.utilization, 0) / sorted.length
        : 0;

    return {
      total: sorted.length,
      critical: critical.length,
      warning: warning.length,
      totalDeadValue,
      avgUtilization,
    };
  }, [sorted]);

  const severityConfig = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'danger' as const,
      label: 'Critical',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'warning' as const,
      label: 'Warning',
    },
    watch: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      badge: 'info' as const,
      label: 'Watch',
    },
    healthy: {
      bg: 'bg-white',
      border: 'border-slate-200',
      badge: 'success' as const,
      label: 'Healthy',
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Inventory Exhaustion &mdash; Batch Health
        </h2>
        <p className="text-sm text-slate-500">
          Aging batches that need attention or clearance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-slate-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-900">
            {summaryStats.total}
          </p>
          <p className="text-xs text-slate-500">Active Batches</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">
            {summaryStats.critical}
          </p>
          <p className="text-xs text-slate-500">Critical</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-600">
            {summaryStats.warning}
          </p>
          <p className="text-xs text-slate-500">Warning</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(summaryStats.totalDeadValue)}
          </p>
          <p className="text-xs text-slate-500">Unsold Stock Value</p>
        </div>
      </div>

      {/* Batch Cards */}
      <div className="px-6 py-4 space-y-3">
        {sorted.map((batch) => {
          const config = severityConfig[batch.severity];
          return (
            <div
              key={batch.batchId}
              className={`p-4 rounded-lg border ${config.bg} ${config.border}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-medium text-slate-700">
                      {batch.batchId}
                    </span>
                    <Badge variant={config.badge}>{config.label}</Badge>
                    {batch.daysToExpiry !== null && batch.daysToExpiry <= 60 && (
                      <Badge variant="danger">
                        <AlertTriangle className="h-3 w-3 mr-0.5 inline" />
                        Expires in {batch.daysToExpiry}d
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    {batch.productName}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Received {formatDate(batch.receivedDate)} ({batch.ageDays}d ago)
                    </span>
                    {batch.expiryDate && (
                      <span>Expires {formatDate(batch.expiryDate)}</span>
                    )}
                    <span>Cost: {formatCurrency(batch.purchasePrice)}/unit</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-slate-900">
                    {batch.remainingQty}
                    <span className="text-sm font-normal text-slate-500">
                      /{batch.initialQty}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">remaining</p>
                </div>
              </div>

              {/* Utilization bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>
                    Sold: {batch.initialQty - batch.remainingQty} units
                  </span>
                  <span>{batch.utilization.toFixed(0)}% utilized</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      batch.utilization >= 75
                        ? 'bg-emerald-500'
                        : batch.utilization >= 40
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${batch.utilization}%` }}
                  />
                </div>
              </div>

              {/* Store locations */}
              {batch.storeBreakdown.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {batch.storeBreakdown.map((loc) => (
                    <span
                      key={loc.storeName}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/70 border border-slate-200 text-xs text-slate-600"
                    >
                      <MapPin className="h-3 w-3" />
                      {loc.storeName}: {loc.qty}
                    </span>
                  ))}
                  <span className="text-xs text-slate-400 self-center">
                    Value at risk: {formatCurrency(batch.deadStockValue)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
