// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SeparationAccountSelector } from '../SeparationAccountSelector';
import type { SeparationAccount } from '@/types/separation';

vi.mock('@/services/api/endpoints-lot6', () => ({
  separationApi: {
    searchAccount: vi.fn(),
  },
}));

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
    vi.clearAllMocks();
  });

  it('should render search input with label', () => {
    render(
      <SeparationAccountSelector
        label="Compte source"
        onSelect={vi.fn()}
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
        selectedAccount={mockAccounts[0]}
      />,
    );

    expect(screen.getByText('Changer')).toBeDefined();
  });

  it('should search on input and display results', async () => {
    const { separationApi } = await import('@/services/api/endpoints-lot6');
    vi.mocked(separationApi.searchAccount).mockResolvedValue({
      data: { data: mockAccounts },
    } as never);

    const onSelect = vi.fn();
    render(
      <SeparationAccountSelector
        label="Compte source"
        onSelect={onSelect}
        selectedAccount={null}
      />,
    );

    const input = screen.getByPlaceholderText('Rechercher par code ou nom...');
    fireEvent.change(input, { target: { value: 'Dupont' } });

    await waitFor(() => {
      expect(screen.getByText('Dupont Jean')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Dupont Jean'));
    expect(onSelect).toHaveBeenCalledWith(mockAccounts[0]);
  });

  it('should filter out excludeAccount from results', async () => {
    const { separationApi } = await import('@/services/api/endpoints-lot6');
    vi.mocked(separationApi.searchAccount).mockResolvedValue({
      data: { data: mockAccounts },
    } as never);

    render(
      <SeparationAccountSelector
        label="Compte destination"
        onSelect={vi.fn()}
        selectedAccount={null}
        excludeAccount={mockAccounts[0]}
      />,
    );

    const input = screen.getByPlaceholderText('Rechercher par code ou nom...');
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('Martin Marie')).toBeDefined();
    });

    expect(screen.queryByText('Dupont Jean')).toBeNull();
  });

  it('should show empty message when no results', async () => {
    const { separationApi } = await import('@/services/api/endpoints-lot6');
    vi.mocked(separationApi.searchAccount).mockResolvedValue({
      data: { data: [] },
    } as never);

    render(
      <SeparationAccountSelector
        label="Compte source"
        onSelect={vi.fn()}
        selectedAccount={null}
      />,
    );

    const input = screen.getByPlaceholderText('Rechercher par code ou nom...');
    fireEvent.change(input, { target: { value: 'zzz' } });

    await waitFor(() => {
      expect(screen.getByText('Aucun compte trouve')).toBeDefined();
    });
  });
});
