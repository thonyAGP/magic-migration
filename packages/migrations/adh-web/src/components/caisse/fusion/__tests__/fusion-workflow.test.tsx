// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FusionAccountSelection } from '../FusionAccountSelection';
import { FusionPreviewCard } from '../FusionPreviewCard';
import { FusionResultDialog } from '../FusionResultDialog';
import type { FusionAccount, FusionPreview, FusionResult } from '@/types/fusion';

// --- Fixtures ---

const comptePrincipal: FusionAccount = {
  codeAdherent: 10001,
  filiation: 0,
  nom: 'MARTIN',
  prenom: 'Pierre',
  societe: 'ADH',
  solde: 2000,
  nbTransactions: 40,
  nbGaranties: 2,
};

const compteSecondaire: FusionAccount = {
  codeAdherent: 10002,
  filiation: 0,
  nom: 'MARTIN',
  prenom: 'Paul',
  societe: 'ADH',
  solde: 500,
  nbTransactions: 10,
  nbGaranties: 1,
};

const previewNoConflict: FusionPreview = {
  comptePrincipal,
  compteSecondaire,
  nbOperationsAFusionner: 10,
  montantTotal: 500,
  garantiesATransferer: 1,
  conflits: [],
  avertissements: [],
};

const previewWithConflicts: FusionPreview = {
  comptePrincipal,
  compteSecondaire,
  nbOperationsAFusionner: 10,
  montantTotal: 500,
  garantiesATransferer: 1,
  conflits: [
    { type: 'garantie', description: 'Garantie en double sur meme article', resolution: 'auto' },
    { type: 'pointage', description: 'Pointage non reconcilie', resolution: 'manuel' },
  ],
  avertissements: ['Operation longue estimee a 5 minutes'],
};

const successResult: FusionResult = {
  success: true,
  compteFinal: comptePrincipal,
  nbOperationsFusionnees: 10,
  nbGarantiesTransferees: 1,
  message: 'Fusion terminee avec succes',
  dateExecution: '10/02/2026 15:00',
};

const failureResult: FusionResult = {
  success: false,
  compteFinal: comptePrincipal,
  nbOperationsFusionnees: 0,
  nbGarantiesTransferees: 0,
  message: 'Erreur: conflit non resolu detecte',
  dateExecution: '10/02/2026 15:00',
};

// --- Tests ---

describe('Fusion Workflow Integration', () => {
  describe('FusionAccountSelection', () => {
    it('should display both principal and secondary accounts', () => {
      render(
        <FusionAccountSelection
          principal={comptePrincipal}
          secondaire={compteSecondaire}
          onPreview={vi.fn()}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByText(/MARTIN Pierre/)).toBeInTheDocument();
      expect(screen.getByText(/MARTIN Paul/)).toBeInTheDocument();
      expect(screen.getByText(/Compte principal/i)).toBeInTheDocument();
      expect(screen.getByText(/Compte secondaire/i)).toBeInTheDocument();
    });

    it('should display account details (solde, transactions, garanties)', () => {
      render(
        <FusionAccountSelection
          principal={comptePrincipal}
          secondaire={compteSecondaire}
          onPreview={vi.fn()}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByText('2000.00 EUR')).toBeInTheDocument();
      expect(screen.getByText('500.00 EUR')).toBeInTheDocument();
    });

    it('should call onPreview when preview button is clicked', () => {
      const onPreview = vi.fn();
      render(
        <FusionAccountSelection
          principal={comptePrincipal}
          secondaire={compteSecondaire}
          onPreview={onPreview}
          onBack={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByText('Previsualiser la fusion'));
      expect(onPreview).toHaveBeenCalled();
    });

    it('should call onBack when back button is clicked', () => {
      const onBack = vi.fn();
      render(
        <FusionAccountSelection
          principal={comptePrincipal}
          secondaire={compteSecondaire}
          onPreview={vi.fn()}
          onBack={onBack}
        />,
      );

      fireEvent.click(screen.getByText('Retour'));
      expect(onBack).toHaveBeenCalled();
    });
  });

  describe('FusionPreviewCard', () => {
    it('should display "Aucun conflit detecte" when no conflicts', () => {
      render(
        <FusionPreviewCard
          preview={previewNoConflict}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(screen.getByText('Aucun conflit detecte')).toBeInTheDocument();
    });

    it('should display conflict details with resolution badges', () => {
      render(
        <FusionPreviewCard
          preview={previewWithConflicts}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(screen.getByText('Conflits detectes')).toBeInTheDocument();
      expect(screen.getByText('Garantie en double sur meme article')).toBeInTheDocument();
      expect(screen.getByText('Pointage non reconcilie')).toBeInTheDocument();
      expect(screen.getByText('Resolution auto')).toBeInTheDocument();
      expect(screen.getByText('Resolution manuelle')).toBeInTheDocument();
    });

    it('should disable confirm button when manual resolution conflicts exist', () => {
      render(
        <FusionPreviewCard
          preview={previewWithConflicts}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      const confirmButton = screen.getByText('Confirmer la fusion');
      expect(confirmButton).toBeDisabled();
    });

    it('should enable confirm button when no manual conflicts', () => {
      render(
        <FusionPreviewCard
          preview={previewNoConflict}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      const confirmButton = screen.getByText('Confirmer la fusion');
      expect(confirmButton).not.toBeDisabled();
    });

    it('should call onConfirm when confirmed', () => {
      const onConfirm = vi.fn();
      render(
        <FusionPreviewCard
          preview={previewNoConflict}
          onConfirm={onConfirm}
          onCancel={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByText('Confirmer la fusion'));
      expect(onConfirm).toHaveBeenCalled();
    });

    it('should display avertissements', () => {
      render(
        <FusionPreviewCard
          preview={previewWithConflicts}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(screen.getByText(/5 minutes/)).toBeInTheDocument();
    });

    it('should show blocking message when manual conflicts exist', () => {
      render(
        <FusionPreviewCard
          preview={previewWithConflicts}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(screen.getByText(/resolution manuelle.*ne peut pas continuer/i)).toBeInTheDocument();
    });
  });

  describe('FusionResultDialog', () => {
    it('should display success result with details', () => {
      render(
        <FusionResultDialog
          result={successResult}
          onRetry={vi.fn()}
          onClose={vi.fn()}
        />,
      );

      expect(screen.getByText('Fusion reussie')).toBeInTheDocument();
      expect(screen.getByText('Fusion terminee avec succes')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should display failure result with retry button', () => {
      render(
        <FusionResultDialog
          result={failureResult}
          onRetry={vi.fn()}
          onClose={vi.fn()}
        />,
      );

      expect(screen.getByText('Echec de la fusion')).toBeInTheDocument();
      expect(screen.getByText(/conflit non resolu/)).toBeInTheDocument();
      expect(screen.getByText('Reessayer')).toBeInTheDocument();
    });

    it('should not show retry button on success', () => {
      render(
        <FusionResultDialog
          result={successResult}
          onRetry={vi.fn()}
          onClose={vi.fn()}
        />,
      );

      expect(screen.queryByText('Reessayer')).not.toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const onRetry = vi.fn();
      render(
        <FusionResultDialog
          result={failureResult}
          onRetry={onRetry}
          onClose={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByText('Reessayer'));
      expect(onRetry).toHaveBeenCalled();
    });

    it('should call onClose when "Retour au menu" is clicked', () => {
      const onClose = vi.fn();
      render(
        <FusionResultDialog
          result={successResult}
          onRetry={vi.fn()}
          onClose={onClose}
        />,
      );

      fireEvent.click(screen.getByText('Retour au menu'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should display compte final details on success', () => {
      render(
        <FusionResultDialog
          result={successResult}
          onRetry={vi.fn()}
          onClose={vi.fn()}
        />,
      );

      expect(screen.getByText(/10001/)).toBeInTheDocument();
      expect(screen.getByText(/MARTIN/)).toBeInTheDocument();
    });
  });
});
