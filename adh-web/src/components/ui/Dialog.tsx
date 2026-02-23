import { type ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export const Dialog = ({ open, onClose, title, children }: DialogProps) => {
  if (!open) return null;
  return (
    <div role="dialog">
      {title && <h2>{title}</h2>}
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
};
