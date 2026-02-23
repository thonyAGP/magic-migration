import { useAuthStore } from '@/stores/authStore';
import { useSessionStore } from '@/stores/sessionStore';
import { Menu, LogOut, User } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { DataSourceToggle } from '@/components/ui/DataSourceToggle';

export function HeaderBar() {
  const user = useAuthStore((s) => s.user);
  const session = useSessionStore((s) => s.currentSession);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="flex items-center justify-between h-12 px-4 bg-primary text-white border-b border-primary-dark">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-primary-light"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold">ADH Caisse</h1>
        {session && (
          <span className="text-xs bg-primary-light px-2 py-0.5 rounded">
            Session #{session.id} - {session.status}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <DataSourceToggle />
        {user && (
          <span className="flex items-center gap-1 text-xs">
            <User className="w-4 h-4" />
            {user.prenom} {user.nom}
          </span>
        )}
        <button
          onClick={logout}
          className="p-1 rounded hover:bg-primary-light"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
