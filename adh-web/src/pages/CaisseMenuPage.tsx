import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { SessionCard, CaisseMenuGrid } from '@/components/caisse/session';
import { useSessionStore } from '@/stores';
import type { CaisseMenuItem, CaisseMenuAction } from '@/types';

function buildMenuItems(sessionStatus: 'open' | 'closed'): CaisseMenuItem[] {
  const isOpen = sessionStatus === 'open';
  return [
    {
      action: 'vente_gp',
      label: 'Vente GP',
      icon: 'shopping-cart',
      description: 'Transaction de vente Grand Public',
      enabled: isOpen,
      requiresOpenSession: true,
    },
    {
      action: 'vente_boutique',
      label: 'Vente Boutique',
      icon: 'store',
      description: 'Transaction de vente Boutique',
      enabled: isOpen,
      requiresOpenSession: true,
    },
    {
      action: 'ouverture',
      label: 'Ouverture caisse',
      icon: 'door-open',
      description: 'Ouvrir une nouvelle session de caisse',
      enabled: !isOpen,
      requiresOpenSession: false,
    },
    {
      action: 'fermeture',
      label: 'Fermeture caisse',
      icon: 'door-closed',
      description: 'Fermer la session en cours',
      enabled: isOpen,
      requiresOpenSession: true,
    },
    {
      action: 'comptage',
      label: 'Comptage caisse',
      icon: 'calculator',
      description: 'Compter le contenu de la caisse',
      enabled: isOpen,
      requiresOpenSession: true,
    },
    {
      action: 'historique',
      label: 'Historique sessions',
      icon: 'clock',
      description: 'Consulter les sessions precedentes',
      enabled: true,
      requiresOpenSession: false,
    },
    {
      action: 'reimpression',
      label: 'Reimpression tickets',
      icon: 'printer',
      description: 'Reimprimer un ticket de session',
      enabled: true,
      requiresOpenSession: false,
    },
    {
      action: 'consultation',
      label: 'Consultation',
      icon: 'eye',
      description: 'Consulter les details de la session',
      enabled: isOpen,
      requiresOpenSession: true,
    },
    {
      action: 'extrait',
      label: 'Extrait de compte',
      icon: 'list',
      description: 'Consulter et imprimer l\'extrait de compte',
      enabled: isOpen,
      requiresOpenSession: true,
    },
    {
      action: 'change',
      label: 'Change devises',
      icon: 'repeat',
      description: 'Operations de change de devises',
      enabled: isOpen,
      requiresOpenSession: true,
    },
    {
      action: 'garantie',
      label: 'Garanties',
      icon: 'lock',
      description: 'Gestion des cautions et garanties',
      enabled: isOpen,
      requiresOpenSession: true,
    },
    {
      action: 'facture',
      label: 'Factures TVA',
      icon: 'file-text',
      description: 'Creation et gestion des factures',
      enabled: isOpen,
      requiresOpenSession: true,
    },
    {
      action: 'clubmedpass',
      label: 'Club Med Pass',
      icon: 'credit-card',
      description: 'Validation et gestion des cartes Club Med',
      enabled: isOpen,
      requiresOpenSession: true,
    },
    {
      action: 'datacatch',
      label: 'Saisie client',
      icon: 'user-plus',
      description: 'Capture et mise a jour donnees clients',
      enabled: isOpen,
      requiresOpenSession: true,
    },
    {
      action: 'separation',
      label: 'Separation',
      icon: 'scissors',
      description: 'Separer un compte',
      enabled: isOpen,
      requiresOpenSession: true,
    },
    {
      action: 'fusion',
      label: 'Fusion',
      icon: 'merge',
      description: 'Fusionner des comptes',
      enabled: isOpen,
      requiresOpenSession: true,
    },
    {
      action: 'changement_compte',
      label: 'Changement compte',
      icon: 'refresh-cw',
      description: 'Changer de compte',
      enabled: isOpen,
      requiresOpenSession: true,
    },
    {
      action: 'solde_compte',
      label: 'Solde compte',
      icon: 'wallet',
      description: 'Consulter le solde',
      enabled: isOpen,
      requiresOpenSession: true,
    },
    {
      action: 'telephone',
      label: 'Telephone',
      icon: 'phone',
      description: 'Gestion telephone',
      enabled: isOpen,
      requiresOpenSession: true,
    },
  ];
}

const actionRoutes: Record<CaisseMenuAction, string> = {
  ouverture: '/caisse/ouverture',
  fermeture: '/caisse/fermeture',
  comptage: '/caisse/ouverture',
  historique: '/caisse/historique',
  reimpression: '/caisse/reimpression',
  consultation: '/caisse/historique',
  parametres: '/caisse/menu',
  vente_gp: '/caisse/vente/GP',
  vente_boutique: '/caisse/vente/Boutique',
  extrait: '/caisse/extrait',
  change: '/caisse/change',
  garantie: '/caisse/garantie',
  facture: '/caisse/facture',
  clubmedpass: '/caisse/pass',
  datacatch: '/caisse/datacatch',
  separation: '/caisse/separation',
  fusion: '/caisse/fusion',
  changement_compte: '/caisse/compte/changement',
  solde_compte: '/caisse/compte/solde',
  telephone: '/caisse/compte/telephone',
};

export function CaisseMenuPage() {
  const navigate = useNavigate();
  const currentSession = useSessionStore((s) => s.currentSession);
  const status = useSessionStore((s) => s.status);

  const effectiveStatus = status === 'open' || status === 'opening' ? 'open' : 'closed';
  const menuItems = buildMenuItems(effectiveStatus);

  const handleAction = (action: string) => {
    const route = actionRoutes[action as CaisseMenuAction];
    if (route) {
      navigate(route);
    }
  };

  return (
    <ScreenLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Menu Caisse</h2>
          <p className="text-on-surface-muted text-sm mt-1">
            Gestion des sessions de caisse
          </p>
        </div>

        {currentSession && (
          <SessionCard session={currentSession} />
        )}

        <CaisseMenuGrid
          items={menuItems}
          onAction={handleAction}
          currentStatus={status}
        />
      </div>
    </ScreenLayout>
  );
}
