import { type ReactNode } from 'react';

interface ScreenLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  className?: string;
}

export const ScreenLayout = ({ children, className }: ScreenLayoutProps) => (
  <div className={className}>{children}</div>
);
