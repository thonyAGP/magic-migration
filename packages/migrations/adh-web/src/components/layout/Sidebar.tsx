import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Menu,
  LogIn,
  LogOut,
  ShoppingCart,
  FileText,
  ArrowLeftRight,
  Shield,
  Receipt,
  CreditCard,
  UserPlus,
  Scissors,
  GitMerge,
  RefreshCw,
  Wallet,
  Phone,
  Clock,
  Printer,
  Settings,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: 'CAISSE',
    items: [
      { icon: LayoutDashboard, label: 'Tableau de bord', path: '/caisse/dashboard' },
      { icon: Menu, label: 'Menu caisse', path: '/caisse/menu' },
      { icon: LogIn, label: 'Ouverture session', path: '/caisse/ouverture' },
      { icon: LogOut, label: 'Fermeture session', path: '/caisse/fermeture' },
      { icon: Briefcase, label: 'Operations caisse', path: '/caisse/operations' },
    ],
  },
  {
    title: 'VENTE & OPERATIONS',
    items: [
      { icon: ShoppingCart, label: 'Vente', path: '/caisse/vente' },
      { icon: FileText, label: 'Extrait compte', path: '/caisse/extrait' },
      { icon: ArrowLeftRight, label: 'Change', path: '/caisse/change' },
      { icon: Shield, label: 'Garantie', path: '/caisse/garantie' },
      { icon: Receipt, label: 'Factures', path: '/caisse/facture' },
      { icon: CreditCard, label: 'Club Med Pass', path: '/caisse/pass' },
    ],
  },
  {
    title: 'ADHERENT',
    items: [
      { icon: UserPlus, label: 'Data Catching', path: '/caisse/datacatch' },
      { icon: Scissors, label: 'Separation', path: '/caisse/separation' },
      { icon: GitMerge, label: 'Fusion', path: '/caisse/fusion' },
      { icon: RefreshCw, label: 'Changement compte', path: '/caisse/compte/changement' },
      { icon: Wallet, label: 'Solde compte', path: '/caisse/compte/solde' },
      { icon: Phone, label: 'Telephone', path: '/caisse/compte/telephone' },
    ],
  },
  {
    title: 'HISTORIQUE & ADMIN',
    items: [
      { icon: Clock, label: 'Historique', path: '/caisse/historique' },
      { icon: Printer, label: 'Reimpression', path: '/caisse/reimpression' },
      { icon: Settings, label: 'Parametres', path: '/caisse/parametres' },
    ],
  },
];

export function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside
      className={cn(
        'bg-surface-dim border-r border-border transition-all duration-200 overflow-y-auto overflow-x-hidden',
        isOpen ? 'w-56' : 'w-0'
      )}
    >
      <nav className="p-2 space-y-1">
        {menuSections.map((section) => (
          <div key={section.title} className="mt-4 first:mt-0">
            <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-muted/60">
              {section.title}
            </span>
            <div className="mt-1 space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-on-surface hover:bg-surface-bright'
                  )}
                >
                  <item.icon className={cn('w-4 h-4', isActive(item.path) ? 'text-primary' : 'text-on-surface-muted')} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
