import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CaisseMenuGrid } from '../CaisseMenuGrid';
import type { CaisseMenuItem } from '@/types';

const mockItems: CaisseMenuItem[] = [
  {
    action: 'ouverture',
    label: 'Ouvrir caisse',
    icon: 'door-open',
    description: 'Ouvrir une session de caisse',
    enabled: true,
    requiresOpenSession: false,
  },
  {
    action: 'fermeture',
    label: 'Fermer caisse',
    icon: 'door-closed',
    description: 'Fermer la session en cours',
    enabled: true,
    requiresOpenSession: true,
  },
  {
    action: 'comptage',
    label: 'Comptage',
    icon: 'calculator',
    description: 'Compter le contenu de la caisse',
    enabled: true,
    requiresOpenSession: true,
  },
  {
    action: 'historique',
    label: 'Historique',
    icon: 'history',
    description: 'Consulter l\'historique',
    enabled: true,
    requiresOpenSession: false,
  },
  {
    action: 'parametres',
    label: 'Parametres',
    icon: 'settings',
    description: 'Configurer la caisse',
    enabled: false,
    requiresOpenSession: false,
  },
];

describe('CaisseMenuGrid', () => {
  it('should render all menu items', () => {
    const onAction = vi.fn();
    render(
      <CaisseMenuGrid items={mockItems} onAction={onAction} currentStatus="open" />,
    );

    expect(screen.getByText('Ouvrir caisse')).toBeInTheDocument();
    expect(screen.getByText('Fermer caisse')).toBeInTheDocument();
    expect(screen.getByText('Comptage')).toBeInTheDocument();
    expect(screen.getByText('Historique')).toBeInTheDocument();
    expect(screen.getByText('Parametres')).toBeInTheDocument();
  });

  it('should render item descriptions', () => {
    const onAction = vi.fn();
    render(
      <CaisseMenuGrid items={mockItems} onAction={onAction} currentStatus="open" />,
    );

    expect(screen.getByText('Ouvrir une session de caisse')).toBeInTheDocument();
    expect(screen.getByText('Fermer la session en cours')).toBeInTheDocument();
  });

  it('should call onAction with correct action when enabled item is clicked', () => {
    const onAction = vi.fn();
    render(
      <CaisseMenuGrid items={mockItems} onAction={onAction} currentStatus="open" />,
    );

    fireEvent.click(screen.getByText('Ouvrir caisse').closest('button')!);

    expect(onAction).toHaveBeenCalledWith('ouverture');
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('should disable items that require open session when session is closed', () => {
    const onAction = vi.fn();
    render(
      <CaisseMenuGrid items={mockItems} onAction={onAction} currentStatus="closed" />,
    );

    const fermerButton = screen.getByText('Fermer caisse').closest('button')!;
    const comptageButton = screen.getByText('Comptage').closest('button')!;

    expect(fermerButton).toBeDisabled();
    expect(comptageButton).toBeDisabled();
  });

  it('should enable items requiring open session when session is open', () => {
    const onAction = vi.fn();
    render(
      <CaisseMenuGrid items={mockItems} onAction={onAction} currentStatus="open" />,
    );

    const fermerButton = screen.getByText('Fermer caisse').closest('button')!;
    const comptageButton = screen.getByText('Comptage').closest('button')!;

    expect(fermerButton).not.toBeDisabled();
    expect(comptageButton).not.toBeDisabled();
  });

  it('should disable items where enabled is false regardless of session status', () => {
    const onAction = vi.fn();
    render(
      <CaisseMenuGrid items={mockItems} onAction={onAction} currentStatus="open" />,
    );

    const parametresButton = screen.getByText('Parametres').closest('button')!;
    expect(parametresButton).toBeDisabled();
  });

  it('should not call onAction when disabled item is clicked', () => {
    const onAction = vi.fn();
    render(
      <CaisseMenuGrid items={mockItems} onAction={onAction} currentStatus="closed" />,
    );

    const fermerButton = screen.getByText('Fermer caisse').closest('button')!;
    fireEvent.click(fermerButton);

    expect(onAction).not.toHaveBeenCalled();
  });

  it('should enable non-session-dependent items regardless of session status', () => {
    const onAction = vi.fn();
    render(
      <CaisseMenuGrid items={mockItems} onAction={onAction} currentStatus="closed" />,
    );

    const ouvertureButton = screen.getByText('Ouvrir caisse').closest('button')!;
    const historiqueButton = screen.getByText('Historique').closest('button')!;

    expect(ouvertureButton).not.toBeDisabled();
    expect(historiqueButton).not.toBeDisabled();
  });

  it('should render with correct grid layout', () => {
    const onAction = vi.fn();
    const { container } = render(
      <CaisseMenuGrid items={mockItems} onAction={onAction} currentStatus="open" />,
    );

    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain('grid');
    expect(grid.className).toContain('grid-cols-2');
  });
});
