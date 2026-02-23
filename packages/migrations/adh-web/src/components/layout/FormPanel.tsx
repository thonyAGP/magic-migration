import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function FormPanel({
  title,
  description,
  children,
  actions,
  className,
}: FormPanelProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-lg border border-border',
        className
      )}
    >
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-on-surface">{title}</h2>
        {description && (
          <p className="text-sm text-on-surface-muted mt-1">{description}</p>
        )}
      </div>
      <div className="p-6">{children}</div>
      {actions && (
        <div className="px-6 py-4 border-t border-border bg-surface-dim flex justify-end gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
