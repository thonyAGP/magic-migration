/**
 * @vitest-environment jsdom
 */

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Use vi.hoisted to create mocks that are accessible during hoisting
const { mockStore, mockSetState } = vi.hoisted(() => {
  const store = {
    articles: [],
    isLoading: false,
    error: null,
    selectedArticle: null,
    titreEcran: 'Articles',
    searchFilter: '',
    validateServiceVillage: vi.fn(() => 'valid'),
    checkPassageCondition: vi.fn(() => true),
    validateCompositeCondition: vi.fn(() => true),
    loadArticles: vi.fn(),
    selectArticle: vi.fn(),
    loadTitle: vi.fn(),
    reset: vi.fn(),
    setState: vi.fn()
  }

  return {
    mockStore: store,
    mockSetState: vi.fn()
  }
})

vi.mock('@/stores/articleZoomStore', () => {
  // Mock needs to support both: useArticleZoomStore() and useArticleZoomStore.setState()
  const mockHook = (() => mockStore) as typeof mockStore & { setState: typeof mockSetState }
  mockHook.setState = mockSetState

  return {
    useArticleZoomStore: mockHook
  }
})

vi.mock('@/components/layout', () => ({
  ScreenLayout: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="screen-layout" className={className}>
      {children}
    </div>
  )
}))

vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick, disabled, variant, ...props }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    variant?: string
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
  Input: ({ placeholder, value, onChange, onKeyDown, className }: {
    placeholder?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
    className?: string
  }) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      className={className}
    />
  )
}))

vi.mock('@/lib/utils', () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' ')
}))

import { ArticleZoomPage } from '@/pages/ArticleZoomPage'
import type { Article } from '@/types/articleZoom'

describe('ArticleZoomPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mockStore to default state
    mockStore.articles = []
    mockStore.isLoading = false
    mockStore.error = null
    mockStore.selectedArticle = null
    mockStore.titreEcran = 'Articles'
    mockStore.searchFilter = ''
  })

  it('renders without crashing', () => {
    render(<ArticleZoomPage />)
    
    expect(screen.getByTestId('screen-layout')).toBeInTheDocument()
    expect(screen.getByText('Articles')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Rechercher un article...')).toBeInTheDocument()
    expect(screen.getAllByText('Rechercher')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Sélectionner')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Quitter')[0]).toBeInTheDocument()
  })

  it('displays loading state', () => {
    mockStore.isLoading = true

    render(<ArticleZoomPage />)
    
    expect(screen.getByText('Chargement des articles...')).toBeInTheDocument()
  })

  it('displays error state', () => {
    const errorMessage = 'Erreur de chargement'
    mockStore.error = errorMessage

    render(<ArticleZoomPage />)
    
    expect(screen.getByText(`Erreur: ${errorMessage}`)).toBeInTheDocument()
  })

  it('displays empty state when no articles', () => {
    mockStore.articles = []

    render(<ArticleZoomPage />)
    
    expect(screen.getAllByText('Aucun article trouvé')[0]).toBeInTheDocument()
  })

  it('displays articles when loaded', () => {
    const mockArticles: Article[] = [
      {
        codeArticle: 1,
        libelleArticle: 'Article Test 1',
        prixUnitaire: 10.50,
        serviceVillage: 'Service A',
        imputation: 100,
        sousImputation: 200,
        passage: true,
        masqueMontant: null
      },
      {
        codeArticle: 2,
        libelleArticle: 'Article Test 2',
        prixUnitaire: 25.00,
        serviceVillage: null,
        imputation: null,
        sousImputation: null,
        passage: false,
        masqueMontant: null
      }
    ]

    mockStore.articles = mockArticles

    render(<ArticleZoomPage />)
    
    expect(screen.getByText('Article Test 1')).toBeInTheDocument()
    expect(screen.getByText('Article Test 2')).toBeInTheDocument()
    expect(screen.getByText('Code: 1')).toBeInTheDocument()
    expect(screen.getByText('Prix: 10.50€')).toBeInTheDocument()
    expect(screen.getByText('Service: Service A')).toBeInTheDocument()
    expect(screen.getByText('Imputation: 100')).toBeInTheDocument()
    expect(screen.getByText('Sous-imputation: 200')).toBeInTheDocument()
    expect(screen.getByText('Passage')).toBeInTheDocument()
    expect(screen.getByText('Fixe')).toBeInTheDocument()
  })

  it('handles search input change', () => {
    render(<ArticleZoomPage />)

    const searchInput = screen.getAllByPlaceholderText('Rechercher un article...')[0]
    fireEvent.change(searchInput, { target: { value: 'test search' } })

    expect(mockSetState).toHaveBeenCalledWith({ searchFilter: 'test search' })
  })

  it('handles search submit on button click', () => {
    render(<ArticleZoomPage />)
    
    const searchButton = screen.getAllByText('Rechercher')[0]
    fireEvent.click(searchButton)
    
    expect(mockStore.loadArticles).toHaveBeenCalled()
  })

  it('handles search submit on Enter key press', () => {
    render(<ArticleZoomPage />)
    
    const searchInput = screen.getAllByPlaceholderText('Rechercher un article...')[0]
    fireEvent.keyDown(searchInput, { key: 'Enter' })
    
    expect(mockStore.loadArticles).toHaveBeenCalled()
  })

  it('handles article selection', () => {
    const mockArticle: Article = {
      codeArticle: 1,
      libelleArticle: 'Article Test',
      prixUnitaire: 10.50,
      serviceVillage: 'Service A',
      imputation: 100,
      sousImputation: 200,
      passage: true,
      masqueMontant: null
    }

    mockStore.articles = [mockArticle]

    render(<ArticleZoomPage />)
    
    const articleCard = screen.getByText('Article Test').closest('div')
    fireEvent.click(articleCard!)
    
    expect(mockStore.selectArticle).toHaveBeenCalledWith(mockArticle)
  })

  it('displays selected article info', () => {
    const selectedArticle: Article = {
      codeArticle: 1,
      libelleArticle: 'Article Sélectionné',
      prixUnitaire: 15.75,
      serviceVillage: null,
      imputation: null,
      sousImputation: null,
      passage: false,
      masqueMontant: null
    }

    mockStore.selectedArticle = selectedArticle

    render(<ArticleZoomPage />)
    
    expect(screen.getByText('Sélectionné: Article Sélectionné - 15.75€')).toBeInTheDocument()
  })

  it('handles select button click with selected article', () => {
    const selectedArticle: Article = {
      codeArticle: 1,
      libelleArticle: 'Article Test',
      prixUnitaire: 10.00,
      serviceVillage: null,
      imputation: null,
      sousImputation: null,
      passage: false,
      masqueMontant: null
    }

    mockStore.selectedArticle = selectedArticle

    render(<ArticleZoomPage />)
    
    const selectButton = screen.getAllByText('Sélectionner')[0]
    fireEvent.click(selectButton)
    
    expect(mockStore.selectArticle).toHaveBeenCalledWith(selectedArticle)
  })

  it('handles quit button click', () => {
    render(<ArticleZoomPage />)
    
    const quitButton = screen.getAllByText('Quitter')[0]
    fireEvent.click(quitButton)
    
    expect(mockStore.reset).toHaveBeenCalled()
  })

  it('loads data on mount', async () => {
    render(<ArticleZoomPage />)
    
    await waitFor(() => {
      expect(mockStore.loadTitle).toHaveBeenCalled()
      expect(mockStore.loadArticles).toHaveBeenCalled()
    })
  })

  it('disables buttons when loading', () => {
    mockStore.isLoading = true

    render(<ArticleZoomPage />)
    
    expect(screen.getAllByText('Rechercher')[0]).toBeDisabled()
    expect(screen.getAllByText('Sélectionner')[0]).toBeDisabled()
  })

  it('disables select button when no article selected', () => {
    mockStore.selectedArticle = null

    render(<ArticleZoomPage />)
    
    expect(screen.getAllByText('Sélectionner')[0]).toBeDisabled()
  })

  it('displays validation states for articles', () => {
    const mockArticle: Article = {
      codeArticle: 1,
      libelleArticle: 'Article Test',
      prixUnitaire: 10.00,
      serviceVillage: 'Service A',
      imputation: 100,
      sousImputation: 200,
      passage: true,
      masqueMontant: null
    }

    mockStore.articles = [mockArticle]
    mockStore.validateServiceVillage = vi.fn(() => 'valid')
    mockStore.checkPassageCondition = vi.fn(() => true)
    mockStore.validateCompositeCondition = vi.fn(() => false)

    render(<ArticleZoomPage />)

    expect(screen.getByText('Condition composite non valide')).toBeInTheDocument()
  })

  it('displays custom title when provided', () => {
    const customTitle = 'Titre Personnalisé'
    mockStore.titreEcran = customTitle

    render(<ArticleZoomPage />)
    
    expect(screen.getByText(customTitle)).toBeInTheDocument()
  })
})