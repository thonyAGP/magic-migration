// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomerSearchPanel } from '../CustomerSearchPanel';
import type { CustomerSearchResult } from '@/types/datacatch';

vi.mock('@/services/api/endpoints-lot5', () => ({
  datacatchApi: {
    searchCustomer: vi.fn(),
  },
}));

const mockCustomers: CustomerSearchResult[] = [
  {
    customerId: 1,
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@test.fr',
    telephone: '0601020304',
    scoreMatch: 95,
  },
  {
    customerId: 2,
    nom: 'Martin',
    prenom: 'Marie',
    email: 'marie.martin@test.fr',
    telephone: '0605060708',
    scoreMatch: 78,
  },
];

describe('CustomerSearchPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search fields nom and prenom', () => {
    render(
      <CustomerSearchPanel onSelectCustomer={vi.fn()} onCreateNew={vi.fn()} />,
    );

    expect(screen.getByPlaceholderText('Nom du client')).toBeDefined();
    expect(screen.getByPlaceholderText('Prenom du client')).toBeDefined();
  });

  it('should show loading state', async () => {
    const { datacatchApi } = await import('@/services/api/endpoints-lot5');
    vi.mocked(datacatchApi.searchCustomer).mockImplementation(
      () => new Promise(() => {}),
    );

    render(
      <CustomerSearchPanel onSelectCustomer={vi.fn()} onCreateNew={vi.fn()} />,
    );

    const input = screen.getByPlaceholderText('Nom du client');
    fireEvent.change(input, { target: { value: 'Dupont' } });

    await waitFor(() => {
      expect(screen.getByText('Recherche en cours...')).toBeDefined();
    });
  });

  it('should show empty results message', async () => {
    const { datacatchApi } = await import('@/services/api/endpoints-lot5');
    vi.mocked(datacatchApi.searchCustomer).mockResolvedValue({
      data: { data: [] },
    } as never);

    render(
      <CustomerSearchPanel onSelectCustomer={vi.fn()} onCreateNew={vi.fn()} />,
    );

    const input = screen.getByPlaceholderText('Nom du client');
    fireEvent.change(input, { target: { value: 'zzz' } });

    await waitFor(() => {
      expect(screen.getByText('Aucun client trouve')).toBeDefined();
    });
  });

  it('should display results with score badge', async () => {
    const { datacatchApi } = await import('@/services/api/endpoints-lot5');
    vi.mocked(datacatchApi.searchCustomer).mockResolvedValue({
      data: { data: mockCustomers },
    } as never);

    render(
      <CustomerSearchPanel onSelectCustomer={vi.fn()} onCreateNew={vi.fn()} />,
    );

    const input = screen.getByPlaceholderText('Nom du client');
    fireEvent.change(input, { target: { value: 'Dupont' } });

    await waitFor(() => {
      expect(screen.getByText('Dupont Jean')).toBeDefined();
      expect(screen.getByText('95%')).toBeDefined();
    });
  });

  it('should call onSelectCustomer on click', async () => {
    const { datacatchApi } = await import('@/services/api/endpoints-lot5');
    vi.mocked(datacatchApi.searchCustomer).mockResolvedValue({
      data: { data: mockCustomers },
    } as never);

    const onSelect = vi.fn();
    render(
      <CustomerSearchPanel onSelectCustomer={onSelect} onCreateNew={vi.fn()} />,
    );

    const input = screen.getByPlaceholderText('Nom du client');
    fireEvent.change(input, { target: { value: 'Dupont' } });

    await waitFor(() => {
      expect(screen.getByText('Dupont Jean')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Dupont Jean'));
    expect(onSelect).toHaveBeenCalledWith(mockCustomers[0]);
  });
});
