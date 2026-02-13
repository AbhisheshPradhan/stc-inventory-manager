import { cn } from '@/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
  secondary:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-indigo-500',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-500',
};

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
