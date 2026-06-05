import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, helperText, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full relative">
        {label && <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">{label}</label>}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md bg-surface-container-high border border-white/5 px-3 py-2 text-sm text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && <p className="text-xs text-on-surface-variant/70">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; helperText?: string }>(
  ({ className, label, helperText, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full bg-transparent">
        {label && <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">{label}</label>}
        <select
          className={cn(
            "flex h-10 w-full rounded-md bg-surface-container-high border border-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all appearance-none cursor-pointer",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {helperText && <p className="text-xs text-on-surface-variant/70">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export const Switch = ({ checked, onChange, label }: { checked: boolean, onChange: (val: boolean) => void, label?: string }) => {
  return (
    <div className="flex items-center justify-between py-2">
      {label && <label className="text-sm font-medium text-white cursor-pointer select-none" onClick={() => onChange(!checked)}>{label}</label>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container",
          checked ? "bg-primary" : "bg-surface-container-highest"
        )}
      >
        <span
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-surface-container transition-transform ring-0",
            checked ? "translate-x-2 shadow-sm" : "-translate-x-2"
          )}
        />
      </button>
    </div>
  );
};
