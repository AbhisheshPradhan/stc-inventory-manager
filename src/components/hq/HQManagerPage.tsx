import { BatchIntakeForm } from './BatchIntakeForm';
import { StockTransferInterface } from './StockTransferInterface';
import { BatchVisibilityTable } from './BatchVisibilityTable';

export function HQManagerPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BatchIntakeForm />
        <StockTransferInterface />
      </div>
      <BatchVisibilityTable />
    </div>
  );
}
