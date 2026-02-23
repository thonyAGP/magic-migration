// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeparationPreviewCard } from '../SeparationPreviewCard';
import type { SeparationPreview } from '@/types/separation';

const mockPreview: SeparationPreview = {
  compteSource: {
    codeAdherent: 1001,
    filiation: 0,
    nom: 'Dupont',
    prenom: 'Jean',
    societe: 'ADH',
    solde: 1250.0,
    nbTransactions: 45,
  },
  compteDestination: {
    codeAdherent: 1002,
    filiation: 0,
    nom: 'Martin',
    prenom: 'Marie',
    societe: 'ADH',
    solde: 890.5,
    nbTransactions: 23,
  },
  nbOperationsADeplacer: 12,
  montantADeplacer: 450.0,
  garantiesImpactees: 2,
  avertissements: ['Attention: garantie active sur le compte source'],
};

describe('SeparationPreviewCard', () => {
  it('should show loading state when preview is null', () => {
    render(
      <SeparationPreviewCard
        preview={null}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText('Validation en cours...')).toBeDefined();
  });

  it('should render preview details', () => {
    render(
      <SeparationPreviewCard
        preview={mockPreview}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText('Apercu de la separation')).toBeDefined();
    expect(screen.getByText('Source')).toBeDefined();
    expect(screen.getByText('Destination')).toBeDefined();
    expect(screen.getByText('12')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
  });

  it('should show warnings with icons', () => {
    render(
      <SeparationPreviewCard
        preview={mockPreview}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Attention: garantie active sur le compte source'),
    ).toBeDefined();
  });

  it('should call onConfirm on execute button click', () => {
    const onConfirm = vi.fn();
    render(
      <SeparationPreviewCard
        preview={mockPreview}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Executer la separation'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('should call onCancel on cancel button click', () => {
    const onCancel = vi.fn();
    render(
      <SeparationPreviewCard
        preview={mockPreview}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByText('Annuler'));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
