import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

type StatCardProps = {
  label: string;
  value: string;
  change?: number;
  icon: LucideIcon;
};

export function StatCard({ label, value, change, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Icon className="h-5 w-5 text-indigo-600" />
        </div>
        {change !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              change >= 0 ? 'text-emerald-600' : 'text-red-600'
            )}
          >
            {change >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {change >= 0 ? '+' : ''}
            {change.toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
