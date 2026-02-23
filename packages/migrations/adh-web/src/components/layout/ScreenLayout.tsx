import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { HeaderBar } from './HeaderBar';
import { FooterBar } from './FooterBar';
import { Sidebar } from './Sidebar';
import { useUiStore } from '@/stores/uiStore';

interface ScreenLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  className?: string;
}

export function ScreenLayout({
  children,
  showSidebar = true,
  className,
}: ScreenLayoutProps) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  return (
    <div className="flex flex-col h-screen bg-surface">
      <HeaderBar />
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <Sidebar isOpen={sidebarOpen} />}
        <main className={cn('flex-1 overflow-auto p-4', className)}>
          {children}
        </main>
      </div>
      <FooterBar />
    </div>
  );
}
