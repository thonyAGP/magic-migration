// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TelecollectePanel } from '../TelecollectePanel';

describe('TelecollectePanel', () => {
  it('should render terminal selection', () => {
    render(<TelecollectePanel onExecute={vi.fn()} result={null} isExecuting={false} />);
    expect(screen.getByText('Telecollecte')).toBeInTheDocument();
    expect(screen.getByText('Selectionner un terminal...')).toBeInTheDocument();
    expect(screen.getByText('Lancer telecollecte')).toBeInTheDocument();
  });

  it('should disable button when no terminal selected', () => {
    render(<TelecollectePanel onExecute={vi.fn()} result={null} isExecuting={false} />);
    const btn = screen.getByText('Lancer telecollecte');
    expect(btn).toBeDisabled();
  });

  it('should execute when terminal is selected', () => {
    const onExecute = vi.fn();
    render(<TelecollectePanel onExecute={onExecute} result={null} isExecuting={false} />);
    const select = screen.getByLabelText(/Terminal/) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'TPE-01' } });
    fireEvent.click(screen.getByText('Lancer telecollecte'));
    expect(onExecute).toHaveBeenCalledWith('TPE-01');
  });

  it('should show success result', () => {
    const result = { success: true, montantCollecte: 1200, nbTransactionsTraitees: 45 };
    render(<TelecollectePanel onExecute={vi.fn()} result={result} isExecuting={false} />);
    expect(screen.getByText('Telecollecte reussie')).toBeInTheDocument();
    expect(screen.getByText('1200.00 EUR')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('should show error result', () => {
    const result = { success: false, montantCollecte: 0, nbTransactionsTraitees: 0, erreurs: ['Timeout'] };
    render(<TelecollectePanel onExecute={vi.fn()} result={result} isExecuting={false} />);
    expect(screen.getByText('Erreur telecollecte')).toBeInTheDocument();
    expect(screen.getByText('Timeout')).toBeInTheDocument();
  });

  it('should show executing state', () => {
    render(<TelecollectePanel onExecute={vi.fn()} result={null} isExecuting={true} />);
    expect(screen.getByText('Collecte en cours...')).toBeInTheDocument();
  });
});
