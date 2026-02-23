import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter, mockNavigate } from 'react-router-dom';

vi.mock('@/stores/apportArticlesStore', () => ({
  useApportArticlesStore: vi.fn(),
}));

vi.mock('@/stores', () => ({
  useAuthStore: vi.fn(),
}));

import { ApportArticlesPage } from '@/pages/ApportArticlesPage';
import { useApportArticlesStore } from '@/stores/apportArticlesStore';
import { useAuthStore } from '@/stores';
import type { ArticleApport } from '@/types/apportArticles';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ApportArticlesPage', () => {
  const mockUser = {
    id: '1',
    prenom: 'Jean',
    nom: 'Dupont',
    sessionId: 'SESSION-001',
  };

  const mockArticle: ArticleApport = {
    articleCode: 'ART-001',
    libelle: 'Article Test',
    quantite: 2,
    prixUnitaire: 10.5,
    montant: 21.0,
  };

  const defaultStoreState = {
    articles: [],
    total: 0,
    deviseCode: 'EUR',
    isExecuting: false,
    error: null,
    editingIndex: null,
    addArticle: vi.fn(),
    updateArticle: vi.fn(),
    removeArticle: vi.fn(),
    submitApport: vi.fn(),
    reset: vi.fn(),
    setEditingIndex: vi.fn(),
    setDeviseCode: vi.fn(),
    setError: vi.fn(),
    calculateTotal: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockUser);
    (useApportArticlesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => selector(defaultStoreState)
    );
    (useApportArticlesStore as unknown as { getState: () => typeof defaultStoreState }).getState = vi.fn(() => defaultStoreState);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders without crashing', () => {
    renderWithRouter(<ApportArticlesPage />);
    expect(screen.getByText('Apport Articles')).toBeInTheDocument();
    expect(screen.getByText('Saisie des articles vendus à la caisse')).toBeInTheDocument();
  });

  it('displays user information', () => {
    renderWithRouter(<ApportArticlesPage />);
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  it('displays empty state when no articles', () => {
    renderWithRouter(<ApportArticlesPage />);
    expect(screen.getByText('Aucun article saisi')).toBeInTheDocument();
  });

  it('displays article entry form', () => {
    renderWithRouter(<ApportArticlesPage />);
    expect(screen.getByPlaceholderText('ART-001')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description article')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
  });

  it('displays articles when data loaded', () => {
    const storeWithArticles = {
      ...defaultStoreState,
      articles: [mockArticle],
      total: 21.0,
    };

    (useApportArticlesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => selector(storeWithArticles)
    );

    renderWithRouter(<ApportArticlesPage />);

    expect(screen.getByText('ART-001')).toBeInTheDocument();
    expect(screen.getByText('Article Test')).toBeInTheDocument();
    expect(screen.getByText('2.00')).toBeInTheDocument();

    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    const dataRow = rows[1];
    expect(within(dataRow).getByText('10.50 EUR')).toBeInTheDocument();
    expect(within(dataRow).getByText('21.00 EUR')).toBeInTheDocument();
  });

  it('calls addArticle when adding new article', () => {
    const mockAddArticle = vi.fn();
    (useApportArticlesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => selector({ ...defaultStoreState, addArticle: mockAddArticle })
    );

    renderWithRouter(<ApportArticlesPage />);

    const codeInput = screen.getByPlaceholderText('ART-001');
    const libelleInput = screen.getByPlaceholderText('Description article');
    const quantiteInput = screen.getByPlaceholderText('1');
    const prixInput = screen.getByPlaceholderText('0.00');
    const addButton = screen.getByRole('button', { name: 'Ajouter' });

    fireEvent.change(codeInput, { target: { value: 'ART-001' } });
    fireEvent.change(libelleInput, { target: { value: 'Article Test' } });
    fireEvent.change(quantiteInput, { target: { value: '2' } });
    fireEvent.change(prixInput, { target: { value: '10.5' } });
    fireEvent.click(addButton);

    expect(mockAddArticle).toHaveBeenCalledWith({
      articleCode: 'ART-001',
      libelle: 'Article Test',
      quantite: 2,
      prixUnitaire: 10.5,
    });
  });

  it('displays validation error when fields are empty', () => {
    const mockSetError = vi.fn();
    (useApportArticlesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => selector({ ...defaultStoreState, setError: mockSetError })
    );

    renderWithRouter(<ApportArticlesPage />);

    const addButton = screen.getByRole('button', { name: 'Ajouter' });
    fireEvent.click(addButton);

    expect(mockSetError).toHaveBeenCalledWith('Tous les champs sont obligatoires');
  });

  it('displays validation error when quantity is invalid', () => {
    const mockSetError = vi.fn();
    (useApportArticlesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => selector({ ...defaultStoreState, setError: mockSetError })
    );

    renderWithRouter(<ApportArticlesPage />);

    const codeInput = screen.getByPlaceholderText('ART-001');
    const libelleInput = screen.getByPlaceholderText('Description article');
    const quantiteInput = screen.getByPlaceholderText('1');
    const prixInput = screen.getByPlaceholderText('0.00');
    const addButton = screen.getByRole('button', { name: 'Ajouter' });

    fireEvent.change(codeInput, { target: { value: 'ART-001' } });
    fireEvent.change(libelleInput, { target: { value: 'Test' } });
    fireEvent.change(quantiteInput, { target: { value: '-1' } });
    fireEvent.change(prixInput, { target: { value: '10' } });
    fireEvent.click(addButton);

    expect(mockSetError).toHaveBeenCalledWith('Quantité invalide');
  });

  it('calls setEditingIndex when edit button clicked', () => {
    const mockSetEditingIndex = vi.fn();
    const storeWithArticles = {
      ...defaultStoreState,
      articles: [mockArticle],
      setEditingIndex: mockSetEditingIndex,
    };

    (useApportArticlesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => selector(storeWithArticles)
    );

    renderWithRouter(<ApportArticlesPage />);

    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    const dataRow = rows[1];
    const editButton = within(dataRow).getByRole('button', { name: 'Modifier' });
    fireEvent.click(editButton);

    expect(mockSetEditingIndex).toHaveBeenCalledWith(0);
  });

  it('opens delete dialog when delete button clicked', async () => {
    const storeWithArticles = {
      ...defaultStoreState,
      articles: [mockArticle],
    };

    (useApportArticlesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => selector(storeWithArticles)
    );

    renderWithRouter(<ApportArticlesPage />);

    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    const dataRow = rows[1];
    const deleteButton = within(dataRow).getByRole('button', { name: 'Supprimer' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument();
    });

    expect(screen.getByText('Voulez-vous vraiment supprimer cet article ?')).toBeInTheDocument();
  });

  it('calls removeArticle when delete confirmed', async () => {
    const mockRemoveArticle = vi.fn();
    const storeWithArticles = {
      ...defaultStoreState,
      articles: [mockArticle],
      removeArticle: mockRemoveArticle,
    };

    (useApportArticlesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => selector(storeWithArticles)
    );

    renderWithRouter(<ApportArticlesPage />);

    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    const dataRow = rows[1];
    const deleteButton = within(dataRow).getByRole('button', { name: 'Supprimer' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    const confirmButton = within(dialog).getByRole('button', { name: 'Supprimer' });
    fireEvent.click(confirmButton);

    expect(mockRemoveArticle).toHaveBeenCalledWith(0);
  });

  it('calls submitApport when submit button clicked', async () => {
    const mockSubmitApport = vi.fn().mockResolvedValue(undefined);
    const storeWithArticles = {
      ...defaultStoreState,
      articles: [mockArticle],
      submitApport: mockSubmitApport,
    };

    (useApportArticlesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => selector(storeWithArticles)
    );

    renderWithRouter(<ApportArticlesPage />);

    const submitButton = screen.getByRole('button', { name: "Valider l'apport" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmitApport).toHaveBeenCalledWith('SESSION-001', 'Jean Dupont');
    });
  });

  it('navigates to menu after successful submit', async () => {
    const mockSubmitApport = vi.fn().mockResolvedValue(undefined);
    const storeWithArticles = {
      ...defaultStoreState,
      articles: [mockArticle],
      submitApport: mockSubmitApport,
    };

    (useApportArticlesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => selector(storeWithArticles)
    );
    (useApportArticlesStore as unknown as { getState: () => typeof storeWithArticles }).getState = vi.fn(() => storeWithArticles);

    renderWithRouter(<ApportArticlesPage />);

    const submitButton = screen.getByRole('button', { name: "Valider l'apport" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
    });
  });

  it('displays error state', () => {
    const storeWithError = {
      ...defaultStoreState,
      error: 'Erreur de connexion',
    };

    (useApportArticlesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => selector(storeWithError)
    );

    renderWithRouter(<ApportArticlesPage />);

    expect(screen.getByText('Erreur de connexion')).toBeInTheDocument();
  });

  it('disables inputs when executing', () => {
    const executingStore = {
      ...defaultStoreState,
      isExecuting: true,
    };

    (useApportArticlesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => selector(executingStore)
    );

    renderWithRouter(<ApportArticlesPage />);

    const codeInput = screen.getByPlaceholderText('ART-001');
    const addButton = screen.getByRole('button', { name: 'Ajouter' });

    expect(codeInput).toBeDisabled();
    expect(addButton).toBeDisabled();
  });

  it('calls reset on unmount', () => {
    const mockReset = vi.fn();
    (useApportArticlesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => selector({ ...defaultStoreState, reset: mockReset })
    );

    const { unmount } = renderWithRouter(<ApportArticlesPage />);
    unmount();

    expect(mockReset).toHaveBeenCalled();
  });

  it('navigates to menu when cancel clicked', () => {
    renderWithRouter(<ApportArticlesPage />);

    const buttons = screen.getAllByRole('button', { name: 'Annuler' });
    const cancelButton = buttons[0];
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
  });

  it('displays total with correct formatting', () => {
    const storeWithArticles = {
      ...defaultStoreState,
      articles: [mockArticle],
      total: 21.0,
    };

    (useApportArticlesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => selector(storeWithArticles)
    );

    renderWithRouter(<ApportArticlesPage />);

    const totalSection = screen.getByText('Total général').closest('div');
    expect(within(totalSection!).getByText('21.00 EUR')).toBeInTheDocument();
  });

  it('shows editing state when editingIndex is set', () => {
    const editingStore = {
      ...defaultStoreState,
      articles: [mockArticle],
      editingIndex: 0,
    };

    (useApportArticlesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => selector(editingStore)
    );

    renderWithRouter(<ApportArticlesPage />);

    const formSection = screen.getByText('Saisie article').closest('div');
    expect(within(formSection!).getByRole('button', { name: 'Modifier' })).toBeInTheDocument();
    expect(within(formSection!).getByRole('button', { name: 'Annuler modification' })).toBeInTheDocument();
  });
});