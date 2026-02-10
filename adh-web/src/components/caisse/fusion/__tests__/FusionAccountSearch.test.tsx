// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FusionAccountSearch } from '../FusionAccountSearch';
import type { FusionAccount } from '@/types/fusion';

const mockSearchAccount = vi.fn();

const mockAccounts: FusionAccount[] = [
  { codeAdherent: 1001, filiation: 0, nom: 'Dupont', prenom: 'Jean', societe: 'ADH', solde: 1250.0, nbTransactions: 45, nbGaranties: 2 },
  { codeAdherent: 1002, filiation: 0, nom: 'Martin', prenom: 'Marie', societe: 'ADH', solde: 890.5, nbTransactions: 23, nbGaranties: 0 },
  { codeAdherent: 1003, filiation: 1, nom: 'Durand', prenom: 'Pierre', societe: 'ADH', solde: 320.0, nbTransactions: 12, nbGaranties: 1 },
];

vi.mock('@/stores/fusionStore', () => ({
  useFusionStore: vi.fn(() => ({
    searchResults: mockAccounts,
    isSearching: false,
    searchAccount: mockSearchAccount,
  })),
}));

describe('FusionAccountSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input and both account columns', () => {
    render(<FusionAccountSearch onSelect={vi.fn()} />);
    expect(screen.getByPlaceholderText(/rechercher par code ou nom/i)).toBeInTheDocument();
    expect(screen.getByText(/compte principal/i)).toBeInTheDocument();
    expect(screen.getByText(/compte secondaire/i)).toBeInTheDocument();
  });

  it('should display search results in both columns', () => {
    render(<FusionAccountSearch onSelect={vi.fn()} />);
    const dupontElements = screen.getAllByText('Dupont Jean');
    expect(dupontElements.length).toBe(2);
    const martinElements = screen.getAllByText('Martin Marie');
    expect(martinElements.length).toBe(2);
  });

  it('should call searchAccount on search button click', () => {
    render(<FusionAccountSearch onSelect={vi.fn()} />);
    const input = screen.getByPlaceholderText(/rechercher par code ou nom/i);
    fireEvent.change(input, { target: { value: 'Dupont' } });
    fireEvent.click(screen.getByText('Rechercher'));
    expect(mockSearchAccount).toHaveBeenCalledWith('ADH', 'Dupont');
  });

  it('should call searchAccount on Enter key press', () => {
    render(<FusionAccountSearch onSelect={vi.fn()} />);
    const input = screen.getByPlaceholderText(/rechercher par code ou nom/i);
    fireEvent.change(input, { target: { value: 'Martin' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockSearchAccount).toHaveBeenCalledWith('ADH', 'Martin');
  });

  it('should disable search button when query is too short', () => {
    render(<FusionAccountSearch onSelect={vi.fn()} />);
    const btn = screen.getByText('Rechercher');
    expect(btn).toBeDisabled();
    const input = screen.getByPlaceholderText(/rechercher par code ou nom/i);
    fireEvent.change(input, { target: { value: 'a' } });
    expect(btn).toBeDisabled();
  });

  it('should allow selecting principal account', () => {
    const { container } = render(<FusionAccountSearch onSelect={vi.fn()} />);
    const codeElements = screen.getAllByText('1001');
    fireEvent.click(codeElements[0]);
    const selectionDiv = container.querySelector('.bg-primary\\/5');
    expect(selectionDiv).toBeInTheDocument();
    expect(selectionDiv?.textContent).toContain('1001');
  });

  it('should show Continuer button when both accounts selected', () => {
    render(<FusionAccountSearch onSelect={vi.fn()} />);
    expect(screen.queryByText('Continuer')).not.toBeInTheDocument();

    const code1001 = screen.getAllByText('1001');
    fireEvent.click(code1001[0]); // select as principal

    const code1002 = screen.getAllByText('1002');
    fireEvent.click(code1002[1]); // select as secondaire

    expect(screen.getByText('Continuer')).toBeInTheDocument();
  });

  it('should call onSelect when Continuer is clicked', () => {
    const onSelect = vi.fn();
    render(<FusionAccountSearch onSelect={onSelect} />);

    const code1001 = screen.getAllByText('1001');
    fireEvent.click(code1001[0]);

    const code1002 = screen.getAllByText('1002');
    fireEvent.click(code1002[1]);

    fireEvent.click(screen.getByText('Continuer'));
    expect(onSelect).toHaveBeenCalledWith(mockAccounts[0], mockAccounts[1]);
  });
});
