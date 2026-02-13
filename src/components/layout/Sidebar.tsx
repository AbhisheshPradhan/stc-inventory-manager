import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Store,
  ShoppingCart,
  BarChart3,
  Box,
  Building2,
  MonitorSmartphone,
  TrendingUp,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'HQ Manager', path: '/hq', icon: Building2 },
  { label: 'Seller POS', path: '/pos', icon: MonitorSmartphone },
  { label: 'Analytics', path: '/analytics', icon: TrendingUp },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Inventory', path: '/inventory', icon: Warehouse },
  { label: 'Stores', path: '/stores', icon: Store },
  { label: 'Sales', path: '/sales', icon: ShoppingCart },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
];

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Box className="h-7 w-7 text-indigo-400" />
          <span className="text-lg font-bold text-white tracking-tight">STC Inventory</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-800 text-white border-l-2 border-indigo-500 pl-[10px]'
                  : 'hover:bg-slate-800/50 hover:text-white'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-slate-800 text-xs text-slate-500">
        STC Inventory v1.0
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 bg-slate-900 text-slate-300 flex-col z-30">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar — slide-in drawer */}
      {open && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <aside className="lg:hidden fixed left-0 top-0 h-screen w-60 bg-slate-900 text-slate-300 flex flex-col z-50 animate-slide-in">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
