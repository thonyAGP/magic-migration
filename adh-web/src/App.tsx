import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { useAuthStore } from '@/stores';
import {
  CaisseMenuPage,
  SessionOuverturePage,
  SessionFermeturePage,
  SessionHistoriquePage,
  ReimpressionPage,
  TransactionPage,
} from '@/pages';

function LoginPage() {
  const login = useAuthStore((s) => s.login);
  return (
    <div className="flex items-center justify-center h-screen bg-surface">
      <div className="w-96 p-8 bg-surface rounded-lg border border-border shadow-lg">
        <h1 className="text-2xl font-bold text-primary mb-6">ADH Caisse</h1>
        <p className="text-on-surface-muted mb-4">Migration Lot 0 - Connexion</p>
        <button
          onClick={() => login({ login: 'test', password: 'test', societe: 'ADH' })}
          className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          Connexion (dev mode)
        </button>
      </div>
    </div>
  );
}

function DashboardPage() {
  return (
    <ScreenLayout>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Tableau de bord</h2>
        <p className="text-on-surface-muted">Session de caisse en cours...</p>
      </div>
    </ScreenLayout>
  );
}


function ExtraitPage() {
  return (
    <ScreenLayout>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Extrait compte</h2>
        <p className="text-on-surface-muted">DataGrid avec operations (Lot 3)</p>
      </div>
    </ScreenLayout>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/caisse" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/caisse/menu" element={<ProtectedRoute><CaisseMenuPage /></ProtectedRoute>} />
        <Route path="/caisse/ouverture" element={<ProtectedRoute><SessionOuverturePage /></ProtectedRoute>} />
        <Route path="/caisse/fermeture" element={<ProtectedRoute><SessionFermeturePage /></ProtectedRoute>} />
        <Route path="/caisse/historique" element={<ProtectedRoute><SessionHistoriquePage /></ProtectedRoute>} />
        <Route path="/caisse/reimpression" element={<ProtectedRoute><ReimpressionPage /></ProtectedRoute>} />
        <Route path="/caisse/vente/:mode" element={<ProtectedRoute><TransactionPage /></ProtectedRoute>} />
        <Route path="/caisse/vente" element={<Navigate to="/caisse/vente/GP" replace />} />
        <Route path="/caisse/extrait" element={<ProtectedRoute><ExtraitPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
