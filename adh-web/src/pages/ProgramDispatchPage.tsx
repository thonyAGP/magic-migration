import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { useProgramDispatchStore } from '@/stores/programDispatchStore';
import { useAuthStore } from '@/stores';

const DISPATCH_ROUTES: Record<string, string> = {
  BTN_CHANGE: '/caisse/change',
  BTN_DEPOT: '/caisse/depot',
  BTN_GARANTIE: '/caisse/garanties',
  BTN_GRATUITES: '/caisse/gratuites',
  BTN_VERSEMENT: '/caisse/versement',
  BTN_TELEPHONE: '/caisse/telephone',
  BTN_MENU_COMPTE: '/caisse/changement-compte',
  BTN_EXTRAIT: '/caisse/extrait',
  BTN_CMP: '/caisse/sessions',
  BTN_BAR_LIMIT: '/caisse/bar-limit',
  BTN_GM_MENU: '/caisse/menu',
  BTN_CAISSE_GM: '/caisse',
  BTN_FORFAIT_TAI: '/caisse/forfait-tai',
  BTN_SOLDE: '/caisse/solde',
  BTN_IMPRESSION: '/caisse/impression',
  BTN_VENTE: '/caisse/ventes',
};

export function ProgramDispatchPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const lastClickedControl = useProgramDispatchStore((s) => s.lastClickedControl);
  const isDispatching = useProgramDispatchStore((s) => s.isDispatching);
  const error = useProgramDispatchStore((s) => s.error);
  const getLastClickedControl = useProgramDispatchStore((s) => s.getLastClickedControl);
  const dispatchToProgram = useProgramDispatchStore((s) => s.dispatchToProgram);
  const clearDispatch = useProgramDispatchStore((s) => s.clearDispatch);
  const reset = useProgramDispatchStore((s) => s.reset);

  useEffect(() => {
    const handleDispatch = async () => {
      const controlId = await getLastClickedControl();
      
      if (!controlId) {
        navigate('/caisse/menu');
        return;
      }

      await dispatchToProgram(controlId);

      const targetRoute = DISPATCH_ROUTES[controlId];
      if (targetRoute) {
        navigate(targetRoute);
      } else {
        navigate('/caisse/menu');
      }
    };

    handleDispatch();

    return () => reset();
  }, [getLastClickedControl, dispatchToProgram, navigate, reset]);

  if (isDispatching) {
    return (
      <ScreenLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-on-surface-muted">Redirection en cours...</p>
            {lastClickedControl && (
              <p className="text-xs text-on-surface-muted">
                Contrôle: {lastClickedControl}
              </p>
            )}
          </div>
        </div>
      </ScreenLayout>
    );
  }

  if (error) {
    return (
      <ScreenLayout>
        <div className="max-w-md mx-auto mt-12 space-y-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="font-medium mb-1">Erreur de routage</p>
            <p className="text-sm">{error}</p>
            {lastClickedControl && (
              <p className="text-xs mt-2 opacity-75">
                Contrôle: {lastClickedControl}
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                clearDispatch();
                navigate('/caisse/menu');
              }}
              className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
            >
              Retour au menu
            </button>
          </div>

          {user && (
            <p className="text-xs text-center text-on-surface-muted">
              {user.prenom} {user.nom}
            </p>
          )}
        </div>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-on-surface-muted">Initialisation...</p>
        </div>
      </div>
    </ScreenLayout>
  );
}