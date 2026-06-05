import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: LucideIcon;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', icon: Icon, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded transition-all font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:pointer-events-none text-sm';
    
    const variants = {
      primary: 'bg-primary text-on-primary hover:bg-primary/90',
      secondary: 'bg-transparent border border-white/20 text-white hover:bg-white/10',
      ghost: 'bg-transparent hover:bg-white/5 text-on-surface-variant hover:text-white',
      glass: 'glass-button text-white',
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 py-3 text-base',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {Icon && <Icon className={cn("shrink-0", children ? "mr-2 h-4 w-4" : "h-5 w-5")} />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
