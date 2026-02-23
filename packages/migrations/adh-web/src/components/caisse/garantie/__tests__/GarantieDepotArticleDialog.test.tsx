// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GarantieDepotArticleDialog } from '../GarantieDepotArticleDialog';

describe('GarantieDepotArticleDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open', () => {
    render(
      <GarantieDepotArticleDialog
        open
        onClose={vi.fn()}
        compteId="1001"
        onValidate={vi.fn()}
      />,
    );

    expect(screen.getByText('Deposer un article')).toBeInTheDocument();
    expect(screen.getByText(/compte 1001/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: SKI01')).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Description de l'article")).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <GarantieDepotArticleDialog
        open={false}
        onClose={vi.fn()}
        compteId="1001"
        onValidate={vi.fn()}
      />,
    );

    expect(screen.queryByText('Deposer un article')).not.toBeInTheDocument();
  });

  it('should show validation errors when submitting empty form', () => {
    render(
      <GarantieDepotArticleDialog
        open
        onClose={vi.fn()}
        compteId="1001"
        onValidate={vi.fn()}
      />,
    );

    // Clear the default quantity value
    fireEvent.change(screen.getByPlaceholderText('1'), { target: { value: '0' } });
    fireEvent.click(screen.getByText('Deposer'));

    expect(screen.getByText('Code article requis')).toBeInTheDocument();
    expect(screen.getByText('Description requise')).toBeInTheDocument();
  });

  it('should call onValidate with valid data', () => {
    const onValidate = vi.fn();
    render(
      <GarantieDepotArticleDialog
        open
        onClose={vi.fn()}
        compteId="1001"
        onValidate={onValidate}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Ex: SKI01'), { target: { value: 'SKI01' } });
    fireEvent.change(screen.getByPlaceholderText("Description de l'article"), { target: { value: 'Paire de skis' } });
    fireEvent.change(screen.getByPlaceholderText('1'), { target: { value: '2' } });
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '300' } });

    fireEvent.click(screen.getByText('Deposer'));

    expect(onValidate).toHaveBeenCalledWith({
      code: 'SKI01',
      libelle: 'Paire de skis',
      description: '',
      valeurEstimee: 300,
    });
  });

  it('should call onClose on cancel', () => {
    const onClose = vi.fn();
    render(
      <GarantieDepotArticleDialog
        open
        onClose={onClose}
        compteId="1001"
        onValidate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should validate quantite > 0', () => {
    const onValidate = vi.fn();
    render(
      <GarantieDepotArticleDialog
        open
        onClose={vi.fn()}
        compteId="1001"
        onValidate={onValidate}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Ex: SKI01'), { target: { value: 'SKI01' } });
    fireEvent.change(screen.getByPlaceholderText("Description de l'article"), { target: { value: 'Skis' } });
    fireEvent.change(screen.getByPlaceholderText('1'), { target: { value: '0' } });

    fireEvent.click(screen.getByText('Deposer'));

    expect(onValidate).not.toHaveBeenCalled();
    expect(screen.getByText(/Quantite doit etre/)).toBeInTheDocument();
  });
});
