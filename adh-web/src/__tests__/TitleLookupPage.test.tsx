import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, mockNavigate } from 'react-router-dom';
import type { Title } from '@/types/titleLookup';

const mockAuthStore = vi.fn();
vi.mock('@/stores', () => ({
  useAuthStore: (selector: unknown) => mockAuthStore(selector),
}));

const mockTitleLookupStore = vi.fn();
vi.mock('@/stores/titleLookupStore', () => ({
  useTitleLookupStore: (selector: unknown) => mockTitleLookupStore(selector),
}));

import { TitleLookupPage } from '@/pages/TitleLookupPage';

describe('TitleLookupPage', () => {
  const mockLoadTitles = vi.fn();
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthStore.mockImplementation((selector) =>
      selector({
        user: { prenom: 'Jean', nom: 'Dupont' },
      })
    );

    mockTitleLookupStore.mockImplementation((selector) =>
      selector({
        titles: [],
        isLoading: false,
        error: null,
        loadTitles: mockLoadTitles,
        reset: mockReset,
      })
    );
  });

  const renderPage = () => {
    return render(
      <BrowserRouter>
        <TitleLookupPage />
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    renderPage();
    expect(screen.getByText('Service de recherche de titres')).toBeInTheDocument();
  });

  it('displays service description', () => {
    renderPage();
    expect(screen.getByText(/Service backend - Pas d'interface utilisateur/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Ce service fournit la recherche de titres \(M\., Mme, Dr, etc\.\)/i
      )
    ).toBeInTheDocument();
  });

  it('displays user information when authenticated', () => {
    renderPage();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  it('displays active service indicator', () => {
    renderPage();
    expect(screen.getByText('Service actif')).toBeInTheDocument();
  });

  it('calls loadTitles on mount', () => {
    renderPage();
    expect(mockLoadTitles).toHaveBeenCalledTimes(1);
  });

  it('calls reset on unmount', () => {
    const { unmount } = renderPage();
    unmount();
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('displays loading state', () => {
    mockTitleLookupStore.mockImplementation((selector) =>
      selector({
        titles: [],
        isLoading: true,
        error: null,
        loadTitles: mockLoadTitles,
        reset: mockReset,
      })
    );

    renderPage();
    expect(screen.getByText('Chargement des titres...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    mockTitleLookupStore.mockImplementation((selector) =>
      selector({
        titles: [],
        isLoading: false,
        error: 'Erreur de chargement',
        loadTitles: mockLoadTitles,
        reset: mockReset,
      })
    );

    renderPage();
    expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
  });

  it('displays loaded titles count when data is loaded', () => {
    const mockTitles: Title[] = [
      { code: 'M', label: 'Monsieur', type: 'CA' },
      { code: 'MME', label: 'Madame', type: 'CA' },
      { code: 'DR', label: 'Docteur', type: 'CA' },
    ];

    mockTitleLookupStore.mockImplementation((selector) =>
      selector({
        titles: mockTitles,
        isLoading: false,
        error: null,
        loadTitles: mockLoadTitles,
        reset: mockReset,
      })
    );

    renderPage();
    expect(screen.getByText('Titres chargés: 3')).toBeInTheDocument();
  });

  it('displays up to 8 titles in grid', () => {
    const mockTitles: Title[] = Array.from({ length: 10 }, (_, i) => ({
      code: `T${i}`,
      label: `Titre ${i}`,
      type: 'CA',
    }));

    mockTitleLookupStore.mockImplementation((selector) =>
      selector({
        titles: mockTitles,
        isLoading: false,
        error: null,
        loadTitles: mockLoadTitles,
        reset: mockReset,
      })
    );

    renderPage();
    expect(screen.getByText('T0')).toBeInTheDocument();
    expect(screen.getByText('T7')).toBeInTheDocument();
    expect(screen.queryByText('T8')).not.toBeInTheDocument();
  });

  it('navigates back to menu on button click', async () => {
    renderPage();

    const backButton = screen.getByText('Retour au menu');
    backButton.click();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
    });
  });

  it('does not display user info when not authenticated', () => {
    mockAuthStore.mockImplementation((selector) =>
      selector({
        user: null,
      })
    );

    renderPage();
    expect(screen.queryByText('Jean Dupont')).not.toBeInTheDocument();
  });

  it('displays title details correctly', () => {
    const mockTitles: Title[] = [
      { code: 'M', label: 'Monsieur', type: 'CA' },
    ];

    mockTitleLookupStore.mockImplementation((selector) =>
      selector({
        titles: mockTitles,
        isLoading: false,
        error: null,
        loadTitles: mockLoadTitles,
        reset: mockReset,
      })
    );

    renderPage();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('Monsieur')).toBeInTheDocument();
    expect(screen.getByText('(CA)')).toBeInTheDocument();
  });
});