import { cn } from '@/utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
};

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-indigo-50 text-indigo-700',
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant]
      )}
    >
      {children}
    </span>
  );
}
