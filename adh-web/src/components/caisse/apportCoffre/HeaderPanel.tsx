import type { ReactNode } from 'react';
import { CONTEXT_LABELS } from '@/types/apportCoffre';
import { cn } from '@/lib/utils';

interface HeaderPanelProps {
  context: 'O' | 'F' | 'G';
  className?: string;
}

const CONTEXT_COLORS = {
  O: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  F: 'bg-rose-100 text-rose-800 border-rose-300',
  G: 'bg-sky-100 text-sky-800 border-sky-300',
} as const;

export const HeaderPanel = ({ context, className }: HeaderPanelProps): ReactNode => {
  const contextLabel = CONTEXT_LABELS[context];
  const colorClass = CONTEXT_COLORS[context];

  return (
    <div className={cn('flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4', className)}>
      <h1 className="text-2xl font-semibold text-gray-900">Apport coffre</h1>
      <div className={cn('rounded-md border px-4 py-2 text-sm font-medium', colorClass)}>{contextLabel}</div>
    </div>
  );
};