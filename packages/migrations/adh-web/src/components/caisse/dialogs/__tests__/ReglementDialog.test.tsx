// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReglementDialog } from '../ReglementDialog';

describe('ReglementDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when closed', () => {
    render(
      <ReglementDialog
        open={false}
        onOpenChange={vi.fn()}
        totalTransaction={100}
        devise="EUR"
        onValidate={vi.fn()}
      />,
    );

    expect(screen.queryByText('Reglement')).toBeNull();
  });

  it('should render payment methods when open', () => {
    render(
      <ReglementDialog
        open={true}
        onOpenChange={vi.fn()}
        totalTransaction={100}
        devise="EUR"
        onValidate={vi.fn()}
      />,
    );

    expect(screen.getByText('Reglement')).toBeDefined();
    expect(screen.getByText('Especes')).toBeDefined();
    expect(screen.getByText('Carte bancaire')).toBeDefined();
    expect(screen.getByText('Cheque')).toBeDefined();
    expect(screen.getByText('Virement')).toBeDefined();
    expect(screen.getByText('Autre')).toBeDefined();
  });

  it('should disable Valider button when total not met', () => {
    render(
      <ReglementDialog
        open={true}
        onOpenChange={vi.fn()}
        totalTransaction={100}
        devise="EUR"
        onValidate={vi.fn()}
      />,
    );

    const validerBtn = screen.getByText('Valider reglement');
    expect(validerBtn).toHaveProperty('disabled', true);
  });

  it('should call onOpenChange when Annuler clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <ReglementDialog
        open={true}
        onOpenChange={onOpenChange}
        totalTransaction={100}
        devise="EUR"
        onValidate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Annuler'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show Solde auto-fill buttons for each payment method', () => {
    render(
      <ReglementDialog
        open={true}
        onOpenChange={vi.fn()}
        totalTransaction={100}
        devise="EUR"
        onValidate={vi.fn()}
      />,
    );

    const soldeButtons = screen.getAllByText('Solde');
    expect(soldeButtons.length).toBe(5); // One per payment method
  });
});
