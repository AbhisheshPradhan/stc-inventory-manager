import { useLocation } from 'react-router-dom';
import { Search, Bell, User, Menu } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/hq': 'HQ Inventory Manager',
  '/products': 'Products',
  '/inventory': 'Inventory',
  '/stores': 'Stores',
  '/sales': 'Sales',
  '/reports': 'Reports',
};

type TopBarProps = {
  onMenuClick: () => void;
};

export function TopBar({ onMenuClick }: TopBarProps) {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? 'Dashboard';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Menu className="h-5 w-5 text-slate-600" />
        </button>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900">{title}</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-48 lg:w-64"
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell className="h-5 w-5 text-slate-500" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </button>
        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center">
          <User className="h-5 w-5 text-indigo-600" />
        </div>
      </div>
    </header>
  );
}
