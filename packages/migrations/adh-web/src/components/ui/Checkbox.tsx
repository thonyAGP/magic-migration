import { forwardRef, type InputHTMLAttributes, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Check, Minus } from 'lucide-react';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string;
  indeterminate?: boolean;
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, indeterminate, id, ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef;

    useEffect(() => {
      if (resolvedRef && 'current' in resolvedRef && resolvedRef.current) {
        resolvedRef.current.indeterminate = indeterminate ?? false;
      }
    }, [indeterminate, resolvedRef]);

    return (
      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            ref={resolvedRef}
            id={id}
            className={cn(
              'peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-sm border border-border-strong bg-surface transition-colors checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              className,
            )}
            {...props}
          />
          <Check className="pointer-events-none absolute left-0 h-4 w-4 text-white opacity-0 peer-checked:opacity-100" />
          <Minus className="pointer-events-none absolute left-0 h-4 w-4 text-white opacity-0 peer-indeterminate:opacity-100" />
        </div>
        {label && (
          <label
            htmlFor={id}
            className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
export type { CheckboxProps };
