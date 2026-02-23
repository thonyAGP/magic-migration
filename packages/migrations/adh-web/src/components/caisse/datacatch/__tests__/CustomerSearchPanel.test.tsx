// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomerSearchPanel } from '../CustomerSearchPanel';
import type { CustomerSearchResult } from '@/types/datacatch';

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

  it('should show loading state', () => {
    render(
      <CustomerSearchPanel
        onSelectCustomer={vi.fn()}
        onCreateNew={vi.fn()}
        isSearching={true}
      />,
    );

    expect(screen.getByText('Recherche en cours...')).toBeDefined();
  });

  it('should show empty results message', () => {
    render(
      <CustomerSearchPanel
        onSelectCustomer={vi.fn()}
        onCreateNew={vi.fn()}
        searchResults={[]}
        isSearching={false}
        onSearch={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText('Nom du client');
    fireEvent.change(input, { target: { value: 'zzz' } });

    waitFor(() => {
      expect(screen.getByText('Aucun client trouve')).toBeDefined();
    });
  });

  it('should display results with score badge', () => {
    render(
      <CustomerSearchPanel
        onSelectCustomer={vi.fn()}
        onCreateNew={vi.fn()}
        searchResults={mockCustomers}
        isSearching={false}
      />,
    );

    expect(screen.getByText('Dupont Jean')).toBeDefined();
    expect(screen.getByText('95%')).toBeDefined();
    expect(screen.getByText('Martin Marie')).toBeDefined();
    expect(screen.getByText('78%')).toBeDefined();
  });

  it('should call onSelectCustomer on click', () => {
    const onSelect = vi.fn();
    render(
      <CustomerSearchPanel
        onSelectCustomer={onSelect}
        onCreateNew={vi.fn()}
        searchResults={mockCustomers}
        isSearching={false}
      />,
    );

    const customerElement = screen.getByText('Dupont Jean');
    fireEvent.click(customerElement);

    expect(onSelect).toHaveBeenCalledWith(mockCustomers[0]);
  });

  it('should call onSearch with debounced nom input', async () => {
    const onSearch = vi.fn();
    render(
      <CustomerSearchPanel
        onSelectCustomer={vi.fn()}
        onCreateNew={vi.fn()}
        onSearch={onSearch}
      />,
    );

    const input = screen.getByPlaceholderText('Nom du client');
    fireEvent.change(input, { target: { value: 'Dupont' } });

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('Dupont', undefined);
    }, { timeout: 500 });
  });

  it('should call onSearch with debounced prenom input', async () => {
    const onSearch = vi.fn();
    render(
      <CustomerSearchPanel
        onSelectCustomer={vi.fn()}
        onCreateNew={vi.fn()}
        onSearch={onSearch}
      />,
    );

    const input = screen.getByPlaceholderText('Prenom du client');
    fireEvent.change(input, { target: { value: 'Jean' } });

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith(undefined, 'Jean');
    }, { timeout: 500 });
  });

  it('should call onCreateNew when create button clicked', () => {
    const onCreate = vi.fn();
    render(
      <CustomerSearchPanel
        onSelectCustomer={vi.fn()}
        onCreateNew={onCreate}
      />,
    );

    const createButton = screen.getByText('Creer nouveau client');
    fireEvent.click(createButton);

    expect(onCreate).toHaveBeenCalled();
  });

  it('should disable search button when both fields empty', () => {
    render(
      <CustomerSearchPanel onSelectCustomer={vi.fn()} onCreateNew={vi.fn()} />,
    );

    const searchButton = screen.getByText('Rechercher');
    expect(searchButton).toHaveProperty('disabled', true);
  });

  it('should enable search button when nom is filled', () => {
    render(
      <CustomerSearchPanel onSelectCustomer={vi.fn()} onCreateNew={vi.fn()} />,
    );

    const input = screen.getByPlaceholderText('Nom du client');
    fireEvent.change(input, { target: { value: 'Dupont' } });

    const searchButton = screen.getByText('Rechercher');
    expect(searchButton).toHaveProperty('disabled', false);
  });
});