import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import {
  CaisseMenuPage,
  SessionOuverturePage,
  SessionFermeturePage,
  SessionHistoriquePage,
  ReimpressionPage,
  TransactionPage,
  ExtraitPage,
  ChangePage,
  GarantiePage,
  FacturePage,
  PassPage,
  DataCatchPage,
  SeparationPage,
  FusionPage,
  AccountOpsPage,
  ParametresPage,
  DashboardPage,
  CaisseOpsPage,
} from '@/pages';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastContainer } from '@/components/ui/Toast';

function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/caisse/menu" replace />;
  }

  const handleLogin = async () => {
    await login({ login: 'test', password: 'test', societe: 'ADH' });
    navigate('/caisse/menu');
  };

  return (
    <div className="flex items-center justify-center h-screen bg-surface">
      <div className="w-96 p-8 bg-surface rounded-lg border border-border shadow-lg">
        <h1 className="text-2xl font-bold text-primary mb-6">ADH Caisse</h1>
        <p className="text-on-surface-muted mb-4">Migration Lot 0 - Connexion</p>
        <button
          onClick={handleLogin}
          className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          Connexion (dev mode)
        </button>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/caisse" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/caisse/menu" element={<ProtectedRoute><CaisseMenuPage /></ProtectedRoute>} />
        <Route path="/caisse/parametres" element={<ProtectedRoute><ParametresPage /></ProtectedRoute>} />
        <Route path="/caisse/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/caisse/ouverture" element={<ProtectedRoute><SessionOuverturePage /></ProtectedRoute>} />
        <Route path="/caisse/fermeture" element={<ProtectedRoute><SessionFermeturePage /></ProtectedRoute>} />
        <Route path="/caisse/historique" element={<ProtectedRoute><SessionHistoriquePage /></ProtectedRoute>} />
        <Route path="/caisse/reimpression" element={<ProtectedRoute><ReimpressionPage /></ProtectedRoute>} />
        <Route path="/caisse/vente/:mode" element={<ProtectedRoute><TransactionPage /></ProtectedRoute>} />
        <Route path="/caisse/vente" element={<Navigate to="/caisse/vente/GP" replace />} />
        <Route path="/caisse/extrait" element={<ProtectedRoute><ExtraitPage /></ProtectedRoute>} />
        <Route path="/caisse/change" element={<ProtectedRoute><ChangePage /></ProtectedRoute>} />
        <Route path="/caisse/garantie" element={<ProtectedRoute><GarantiePage /></ProtectedRoute>} />
        <Route path="/caisse/facture" element={<ProtectedRoute><FacturePage /></ProtectedRoute>} />
        <Route path="/caisse/pass" element={<ProtectedRoute><PassPage /></ProtectedRoute>} />
        <Route path="/caisse/datacatch" element={<ProtectedRoute><DataCatchPage /></ProtectedRoute>} />
        <Route path="/caisse/separation" element={<ProtectedRoute><SeparationPage /></ProtectedRoute>} />
        <Route path="/caisse/fusion" element={<ProtectedRoute><FusionPage /></ProtectedRoute>} />
        <Route path="/caisse/compte/:type" element={<ProtectedRoute><AccountOpsPage /></ProtectedRoute>} />
        <Route path="/caisse/operations" element={<ProtectedRoute><CaisseOpsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
    </ErrorBoundary>
  );
}
