// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FusionPreviewCard } from '../FusionPreviewCard';
import type { FusionPreview, FusionConflict } from '@/types/fusion';

const basePreview: FusionPreview = {
  comptePrincipal: {
    codeAdherent: 1001, filiation: 0, nom: 'Dupont', prenom: 'Jean',
    societe: 'ADH', solde: 1250.0, nbTransactions: 45, nbGaranties: 2,
  },
  compteSecondaire: {
    codeAdherent: 1002, filiation: 0, nom: 'Martin', prenom: 'Marie',
    societe: 'ADH', solde: 890.5, nbTransactions: 23, nbGaranties: 0,
  },
  nbOperationsAFusionner: 23,
  montantTotal: 2140.5,
  garantiesATransferer: 0,
  conflits: [],
  avertissements: [],
};

const conflitAuto: FusionConflict = {
  type: 'transaction',
  description: 'Transaction en double detectee',
  resolution: 'auto',
};

const conflitManuel: FusionConflict = {
  type: 'garantie',
  description: 'Garantie active sur compte secondaire',
  resolution: 'manuel',
};

describe('FusionPreviewCard', () => {
  it('should render preview summary with account info', () => {
    render(
      <FusionPreviewCard preview={basePreview} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByText(/1001/)).toBeInTheDocument();
    expect(screen.getByText(/1002/)).toBeInTheDocument();
    expect(screen.getByText('23')).toBeInTheDocument();
    expect(screen.getByText('2140.50 EUR')).toBeInTheDocument();
  });

  it('should show no conflict message when no conflicts', () => {
    render(
      <FusionPreviewCard preview={basePreview} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByText(/aucun conflit detecte/i)).toBeInTheDocument();
  });

  it('should display auto-resolution conflicts with warning styling', () => {
    const previewWithConflicts = { ...basePreview, conflits: [conflitAuto] };
    render(
      <FusionPreviewCard preview={previewWithConflicts} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByText('Transaction en double detectee')).toBeInTheDocument();
    expect(screen.getByText('Resolution auto')).toBeInTheDocument();
  });

  it('should display manual conflicts and disable confirm button', () => {
    const previewWithErrors = { ...basePreview, conflits: [conflitManuel] };
    render(
      <FusionPreviewCard preview={previewWithErrors} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByText('Garantie active sur compte secondaire')).toBeInTheDocument();
    expect(screen.getByText('Resolution manuelle')).toBeInTheDocument();
    expect(screen.getByText('Confirmer la fusion')).toBeDisabled();
  });

  it('should display avertissements when present', () => {
    const previewWithWarnings = { ...basePreview, avertissements: ['Compte secondaire sera cloture'] };
    render(
      <FusionPreviewCard preview={previewWithWarnings} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByText('Compte secondaire sera cloture')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(
      <FusionPreviewCard preview={basePreview} onConfirm={onConfirm} onCancel={vi.fn()} />,
    );
    fireEvent.click(screen.getByText('Confirmer la fusion'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('should call onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(
      <FusionPreviewCard preview={basePreview} onConfirm={vi.fn()} onCancel={onCancel} />,
    );
    fireEvent.click(screen.getByText('Annuler'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('should enable confirm button with only auto-resolution conflicts', () => {
    const previewAutoOnly = { ...basePreview, conflits: [conflitAuto] };
    render(
      <FusionPreviewCard preview={previewAutoOnly} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByText('Confirmer la fusion')).not.toBeDisabled();
  });
});
