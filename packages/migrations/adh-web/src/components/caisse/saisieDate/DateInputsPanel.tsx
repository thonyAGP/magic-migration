import type { FC, ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

interface DateInputsPanelProps {
  dateMin: Date | null;
  dateMax: Date | null;
  onDateMinChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDateMaxChange: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const DateInputsPanel: FC<DateInputsPanelProps> = ({
  dateMin,
  dateMax,
  onDateMinChange,
  onDateMaxChange,
  className,
}) => {
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <label htmlFor="date-min" className="text-sm font-medium">
        Du
      </label>
      <input
        id="date-min"
        type="date"
        value={formatDateForInput(dateMin)}
        onChange={onDateMinChange}
        className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <label htmlFor="date-max" className="text-sm font-medium">
        Au
      </label>
      <input
        id="date-max"
        type="date"
        value={formatDateForInput(dateMax)}
        onChange={onDateMaxChange}
        className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
};