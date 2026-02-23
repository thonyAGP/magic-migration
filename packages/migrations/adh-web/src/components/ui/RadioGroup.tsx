import { createContext, forwardRef, useContext, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type RadioGroupContextValue = {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
};

const RadioGroupContext = createContext<RadioGroupContextValue>({
  name: '',
});

type RadioGroupProps = {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

function RadioGroup({ name, value, onChange, disabled, className, children }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ name, value, onChange, disabled }}>
      <div role="radiogroup" className={cn('flex flex-col gap-2', className)}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

type RadioGroupItemProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'name' | 'onChange'> & {
  value: string;
  label?: string;
};

const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, label, id, disabled: itemDisabled, ...props }, ref) => {
    const ctx = useContext(RadioGroupContext);
    const isDisabled = itemDisabled ?? ctx.disabled;

    return (
      <div className="flex items-center gap-2">
        <input
          type="radio"
          ref={ref}
          id={id}
          name={ctx.name}
          value={value}
          checked={ctx.value === value}
          disabled={isDisabled}
          onChange={() => ctx.onChange?.(value)}
          className={cn(
            'h-4 w-4 cursor-pointer appearance-none rounded-full border border-border-strong bg-surface transition-colors checked:border-[5px] checked:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        />
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
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };
export type { RadioGroupProps, RadioGroupItemProps };
