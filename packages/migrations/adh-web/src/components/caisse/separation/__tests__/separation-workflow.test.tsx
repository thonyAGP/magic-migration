// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeparationPreviewCard } from '../SeparationPreviewCard';
import { SeparationProcessing } from '../SeparationProcessing';
import { SeparationResultDialog } from '../SeparationResultDialog';
import type { SeparationPreview, SeparationResult, SeparationProgress, SeparationAccount } from '@/types/separation';

// Mock API for SeparationAccountSelector
vi.mock('@/services/api/endpoints-lot6', () => ({
  separationApi: {
    searchAccount: vi.fn(() => Promise.resolve({ data: { data: [] } })),
  },
}));

// --- Fixtures ---

const compteSource: SeparationAccount = {
  codeAdherent: 12345,
  filiation: 0,
  nom: 'DUPONT',
  prenom: 'Jean',
  societe: 'ADH',
  solde: 1500,
  nbTransactions: 25,
};

const compteDestination: SeparationAccount = {
  codeAdherent: 12345,
  filiation: 1,
  nom: 'DUPONT',
  prenom: 'Marie',
  societe: 'ADH',
  solde: 300,
  nbTransactions: 5,
};

const preview: SeparationPreview = {
  compteSource,
  compteDestination,
  nbOperationsADeplacer: 10,
  montantADeplacer: 800,
  garantiesImpactees: 2,
  avertissements: ['Attention: garanties actives seront transferees', 'Verifier les operations en cours'],
};

const _previewNoWarnings: SeparationPreview = {
  ...preview,
  avertissements: [],
  garantiesImpactees: 0,
};

const successResult: SeparationResult = {
  success: true,
  compteSource,
  compteDestination,
  nbOperationsDeplacees: 10,
  montantDeplace: 800,
  message: 'Separation effectuee avec succes',
  dateExecution: '10/02/2026 14:30',
};

const failureResult: SeparationResult = {
  success: false,
  compteSource,
  compteDestination,
  nbOperationsDeplacees: 0,
  montantDeplace: 0,
  message: 'Erreur lors de la separation: compte verrouille',
  dateExecution: '10/02/2026 14:30',
};

const progress: SeparationProgress = {
  etape: 'Deplacement operations',
  progression: 65,
  message: 'Operation 7/10 traitee',
};

// --- Tests ---

describe('Separation Workflow Integration', () => {
  describe('SeparationPreviewCard', () => {
    it('should display source and destination account info', () => {
      render(
        <SeparationPreviewCard
          preview={preview}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(screen.getByText('Apercu de la separation')).toBeInTheDocument();
      expect(screen.getByText(/DUPONT Jean/)).toBeInTheDocument();
      expect(screen.getByText(/DUPONT Marie/)).toBeInTheDocument();
    });

    it('should display operations and montant to move', () => {
      render(
        <SeparationPreviewCard
          preview={preview}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should display warnings when present', () => {
      render(
        <SeparationPreviewCard
          preview={preview}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(screen.getByText(/garanties actives/)).toBeInTheDocument();
      expect(screen.getByText(/operations en cours/)).toBeInTheDocument();
    });

    it('should call onConfirm when execute button is clicked', () => {
      const onConfirm = vi.fn();
      render(
        <SeparationPreviewCard
          preview={preview}
          onConfirm={onConfirm}
          onCancel={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByText('Executer la separation'));
      expect(onConfirm).toHaveBeenCalled();
    });

    it('should call onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn();
      render(
        <SeparationPreviewCard
          preview={preview}
          onConfirm={vi.fn()}
          onCancel={onCancel}
        />,
      );

      fireEvent.click(screen.getByText('Annuler'));
      expect(onCancel).toHaveBeenCalled();
    });

    it('should show "Execution..." when executing', () => {
      render(
        <SeparationPreviewCard
          preview={preview}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
          isExecuting={true}
        />,
      );

      expect(screen.getByText('Execution...')).toBeInTheDocument();
    });

    it('should show loading state when no preview', () => {
      render(
        <SeparationPreviewCard
          preview={null}
          isLoading={true}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(screen.getByText('Validation en cours...')).toBeInTheDocument();
    });
  });

  describe('SeparationProcessing', () => {
    it('should display progress bar and percentage', () => {
      render(<SeparationProcessing progress={progress} isProcessing={true} />);

      expect(screen.getByText('Separation en cours...')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '65');
    });

    it('should display step name and message', () => {
      render(<SeparationProcessing progress={progress} isProcessing={true} />);

      expect(screen.getByText('Deplacement operations')).toBeInTheDocument();
      expect(screen.getByText('Operation 7/10 traitee')).toBeInTheDocument();
    });

    it('should show waiting message when not processing', () => {
      render(<SeparationProcessing progress={null} isProcessing={false} />);

      expect(screen.getByText('En attente du demarrage...')).toBeInTheDocument();
    });
  });

  describe('SeparationResultDialog', () => {
    it('should display success result with details', () => {
      render(
        <SeparationResultDialog
          open={true}
          result={successResult}
          onClose={vi.fn()}
        />,
      );

      expect(screen.getByText('Separation terminee')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should display failure result with error message', () => {
      render(
        <SeparationResultDialog
          open={true}
          result={failureResult}
          onClose={vi.fn()}
        />,
      );

      expect(screen.getByText('Echec de la separation')).toBeInTheDocument();
      expect(screen.getByText(/compte verrouille/)).toBeInTheDocument();
    });

    it('should call onClose when Fermer button is clicked', () => {
      const onClose = vi.fn();
      render(
        <SeparationResultDialog
          open={true}
          result={successResult}
          onClose={onClose}
        />,
      );

      fireEvent.click(screen.getByText('Fermer'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should render nothing when result is null', () => {
      const { container } = render(
        <SeparationResultDialog
          open={true}
          result={null}
          onClose={vi.fn()}
        />,
      );

      expect(container.innerHTML).toBe('');
    });
  });
});
