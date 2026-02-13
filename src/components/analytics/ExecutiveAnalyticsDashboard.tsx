import { PriceHistoryChart } from './PriceHistoryChart';
import { MarginTrackerChart } from './MarginTrackerChart';
import { InventoryExhaustionView } from './InventoryExhaustionView';

export function ExecutiveAnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Executive Analytics
        </h1>
        <p className="text-sm text-slate-500">
          Strategic insights for HQ decision-making
        </p>
      </div>

      <PriceHistoryChart />
      <MarginTrackerChart />
      <InventoryExhaustionView />
    </div>
  );
}
