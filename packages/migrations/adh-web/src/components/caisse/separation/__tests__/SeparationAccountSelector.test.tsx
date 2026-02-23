// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SeparationAccountSelector } from '../SeparationAccountSelector';
import type { SeparationAccount } from '@/types/separation';

const mockAccounts: SeparationAccount[] = [
  {
    codeAdherent: 1001,
    filiation: 0,
    nom: 'Dupont',
    prenom: 'Jean',
    societe: 'ADH',
    solde: 1250.0,
    nbTransactions: 45,
  },
  {
    codeAdherent: 1002,
    filiation: 1,
    nom: 'Martin',
    prenom: 'Marie',
    societe: 'ADH',
    solde: 890.5,
    nbTransactions: 23,
  },
];

describe('SeparationAccountSelector', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render search input with label', () => {
    render(
      <SeparationAccountSelector
        label="Compte source"
        onSelect={vi.fn()}
        onSearch={vi.fn()}
        selectedAccount={null}
      />,
    );

    expect(screen.getByText('Compte source')).toBeDefined();
    expect(screen.getByPlaceholderText('Rechercher par code ou nom...')).toBeDefined();
  });

  it('should show selected account card', () => {
    render(
      <SeparationAccountSelector
        label="Compte source"
        onSelect={vi.fn()}
        onSearch={vi.fn()}
        selectedAccount={mockAccounts[0]}
      />,
    );

    expect(screen.getByText('Dupont Jean')).toBeDefined();
    expect(screen.getByText('Selectionne')).toBeDefined();
  });

  it('should show change button when selected', () => {
    render(
      <SeparationAccountSelector
        label="Compte source"
        onSelect={vi.fn()}
        onSearch={vi.fn()}
        selectedAccount={mockAccounts[0]}
      />,
    );

    expect(screen.getByText('Changer')).toBeDefined();
  });

  it('should call onSearch on input and display results', async () => {
    const onSearch = vi.fn();
    const onSelect = vi.fn();

    render(
      <SeparationAccountSelector
        label="Compte source"
        onSelect={onSelect}
        onSearch={onSearch}
        searchResults={mockAccounts}
        selectedAccount={null}
      />,
    );

    const input = screen.getByPlaceholderText('Rechercher par code ou nom...');
    await act(() => {
      fireEvent.change(input, { target: { value: 'Dupont' } });
    });

    // Advance timers for debounce
    await act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(onSearch).toHaveBeenCalledWith('Dupont');
    expect(screen.getByText('Dupont Jean')).toBeDefined();

    fireEvent.click(screen.getByText('Dupont Jean'));
    expect(onSelect).toHaveBeenCalledWith(mockAccounts[0]);
  });

  it('should filter out excludeAccount from results', async () => {
    const onSearch = vi.fn();

    render(
      <SeparationAccountSelector
        label="Compte destination"
        onSelect={vi.fn()}
        onSearch={onSearch}
        searchResults={mockAccounts}
        selectedAccount={null}
        excludeAccount={mockAccounts[0]}
      />,
    );

    const input = screen.getByPlaceholderText('Rechercher par code ou nom...');
    await act(() => {
      fireEvent.change(input, { target: { value: 'test' } });
    });

    await act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByText('Martin Marie')).toBeDefined();
    expect(screen.queryByText('Dupont Jean')).toBeNull();
  });

  it('should show empty message when no results after search', async () => {
    const onSearch = vi.fn();

    render(
      <SeparationAccountSelector
        label="Compte source"
        onSelect={vi.fn()}
        onSearch={onSearch}
        searchResults={[]}
        selectedAccount={null}
      />,
    );

    const input = screen.getByPlaceholderText('Rechercher par code ou nom...');
    await act(() => {
      fireEvent.change(input, { target: { value: 'zzz' } });
    });

    await act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByText('Aucun compte trouve')).toBeDefined();
  });
});
