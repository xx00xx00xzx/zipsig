import * as React from 'react';

// Simple className concatenation utility
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary';
}

const base =
  'inline-flex items-center gap-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants =
      variant === 'secondary'
        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
        : 'bg-indigo-600 hover:bg-indigo-500 text-white';
    return (
      <button ref={ref} className={cn(base, variants, className)} {...props} />
    );
  }
);
Button.displayName = 'Button'; 