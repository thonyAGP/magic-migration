/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockSessionListStore = {
  sessions: [],
  isLoading: false,
  error: null,
  filters: {
    existeSession: false,
    existeSessionOuverte: false,
    societe: null,
    deviseLocale: null
  },
  fetchSessions: vi.fn(),
  setFilters: vi.fn(),
  clearError: vi.fn(),
  reset: vi.fn(),
  selectedSession: null,
  showDeleteDialog: false,
  showEditDialog: false,
  editFormData: {},
  validationErrors: {},
  searchQuery: '',
  sortConfig: { field: null, direction: 'asc' },
  pageSize: 20,
  currentPage: 1,
  totalCount: 0,
  hasNextPage: false,
  hasPreviousPage: false,
  lastFetchTime: null,
  isInitialized: false,
  isDirty: false,
  optimisticUpdates: [],
  cachedFilters: {},
  retryCount: 0,
  maxRetries: 3,
  autoRefresh: false,
  refreshInterval: 30000
}

vi.mock('@/stores/sessionListStore', () => ({
  useSessionListStore: vi.fn(() => mockSessionListStore)
}))

vi.mock('@/components/layout', () => ({
  ScreenLayout: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="screen-layout" className={className}>{children}</div>
  )
}))

vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick, disabled, className, size, ...props }: unknown) => (
    <button
      onClick={onClick as () => void}
      disabled={disabled as boolean}
      className={className as string}
      data-testid="button"
      {...props}
    >
      {children}
    </button>
  ),
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  Input: ({ value, onChange, placeholder, className, id, type, ...props }: unknown) => (
    <input
      value={value as string}
      onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
      placeholder={placeholder as string}
      className={className as string}
      id={id as string}
      type={type as string}
      data-testid="input"
      {...props}
    />
  )
}))

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ')
}))

import { SessionListPage } from '@/pages/SessionListPage'

describe('SessionListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionListStore.fetchSessions = vi.fn()
    mockSessionListStore.setFilters = vi.fn()
    mockSessionListStore.clearError = vi.fn()
    mockSessionListStore.reset = vi.fn()
    mockSessionListStore.sessions = []
    mockSessionListStore.isLoading = false
    mockSessionListStore.error = null
    mockSessionListStore.filters = {
      existeSession: false,
      existeSessionOuverte: false,
      societe: null,
      deviseLocale: null
    }
  })

  it('renders without crashing', () => {
    render(<SessionListPage />)
    
    expect(screen.getByText('Sessions de Caisse')).toBeInTheDocument()
    expect(screen.getByText('Filtres')).toBeInTheDocument()
    expect(screen.getByText('Sessions (0)')).toBeInTheDocument()
  })

  it('displays loading state', () => {
    mockSessionListStore.isLoading = true
    
    render(<SessionListPage />)
    
    expect(screen.getByText('Chargement des sessions...')).toBeInTheDocument()
    expect(screen.getByTestId('button')).toBeDisabled()
  })

  it('displays data when loaded', () => {
    const mockSessions = [
      {
        id: 1,
        societe: 'Test Société',
        caisse: 'CAISSE001',
        operateur: 'John Doe',
        dateOuverture: new Date('2024-01-15T09:00:00'),
        etat: 'O',
        montantOuverture: 100.50
      },
      {
        id: 2,
        societe: 'Test Société 2',
        caisse: 'CAISSE002',
        operateur: 'Jane Smith',
        dateOuverture: new Date('2024-01-15T10:00:00'),
        etat: 'F',
        montantOuverture: null
      }
    ]
    
    mockSessionListStore.sessions = mockSessions
    mockSessionListStore.isLoading = false
    
    render(<SessionListPage />)
    
    expect(screen.getByText('Sessions (2)')).toBeInTheDocument()
    expect(screen.getByText('Test Société')).toBeInTheDocument()
    expect(screen.getByText('CAISSE001')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Ouverte')).toBeInTheDocument()
    expect(screen.getByText('Fermée')).toBeInTheDocument()
    expect(screen.getByText('100,50 €')).toBeInTheDocument()
    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('displays empty state when no sessions', () => {
    mockSessionListStore.sessions = []
    mockSessionListStore.isLoading = false
    
    render(<SessionListPage />)
    
    expect(screen.getByText('Aucune session')).toBeInTheDocument()
    expect(screen.getByText('Aucune session ne correspond aux critères de filtrage.')).toBeInTheDocument()
  })

  it('displays error state', () => {
    mockSessionListStore.error = 'Une erreur est survenue'
    
    render(<SessionListPage />)
    
    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument()
    expect(screen.getByText('Fermer')).toBeInTheDocument()
  })

  it('handles refresh button click', () => {
    render(<SessionListPage />)
    
    const refreshButton = screen.getByText('Actualiser').closest('button')
    fireEvent.click(refreshButton!)
    
    expect(mockSessionListStore.fetchSessions).toHaveBeenCalledWith(mockSessionListStore.filters)
  })

  it('handles existe session checkbox change', () => {
    render(<SessionListPage />)
    
    const checkbox = screen.getByLabelText('Session existe')
    fireEvent.click(checkbox)
    
    expect(mockSessionListStore.setFilters).toHaveBeenCalledWith({ existeSession: true })
  })

  it('handles existe session ouverte checkbox change', () => {
    render(<SessionListPage />)
    
    const checkbox = screen.getByLabelText('Session ouverte')
    fireEvent.click(checkbox)
    
    expect(mockSessionListStore.setFilters).toHaveBeenCalledWith({ existeSessionOuverte: true })
  })

  it('handles societe input change', () => {
    render(<SessionListPage />)
    
    const input = screen.getByPlaceholderText('Filtrer par société...')
    fireEvent.change(input, { target: { value: 'Test Company' } })
    
    expect(mockSessionListStore.setFilters).toHaveBeenCalledWith({ societe: 'Test Company' })
  })

  it('handles societe input clear', () => {
    render(<SessionListPage />)
    
    const input = screen.getByPlaceholderText('Filtrer par société...')
    
    fireEvent.change(input, { target: { value: 'Test Société' } })
    fireEvent.change(input, { target: { value: '' } })
    
    expect(mockSessionListStore.setFilters).toHaveBeenLastCalledWith({ societe: null })
  })

  it('handles error dismissal', () => {
    mockSessionListStore.error = 'Une erreur est survenue'
    
    render(<SessionListPage />)
    
    const closeButton = screen.getByText('Fermer')
    fireEvent.click(closeButton)
    
    expect(mockSessionListStore.clearError).toHaveBeenCalled()
  })

  it('calls fetchSessions on mount', () => {
    render(<SessionListPage />)
    
    expect(mockSessionListStore.fetchSessions).toHaveBeenCalledWith(mockSessionListStore.filters)
  })

  it('calls reset on unmount', () => {
    const { unmount } = render(<SessionListPage />)
    
    unmount()
    
    expect(mockSessionListStore.reset).toHaveBeenCalled()
  })

  it('displays session state colors correctly', () => {
    const mockSessions = [
      {
        id: 1,
        societe: 'Test',
        caisse: 'CAISSE001',
        operateur: 'John',
        dateOuverture: new Date('2024-01-15T09:00:00'),
        etat: 'O',
        montantOuverture: 100
      },
      {
        id: 2,
        societe: 'Test',
        caisse: 'CAISSE002',
        operateur: 'Jane',
        dateOuverture: new Date('2024-01-15T10:00:00'),
        etat: 'F',
        montantOuverture: 200
      },
      {
        id: 3,
        societe: 'Test',
        caisse: 'CAISSE003',
        operateur: 'Bob',
        dateOuverture: new Date('2024-01-15T11:00:00'),
        etat: '',
        montantOuverture: 300
      }
    ]
    
    mockSessionListStore.sessions = mockSessions
    
    render(<SessionListPage />)
    
    expect(screen.getByText('Ouverte')).toBeInTheDocument()
    expect(screen.getByText('Fermée')).toBeInTheDocument()
    expect(screen.getByText('Indéfinie')).toBeInTheDocument()
  })

  it('formats currency correctly', () => {
    const mockSessions = [
      {
        id: 1,
        societe: 'Test',
        caisse: 'CAISSE001',
        operateur: 'John',
        dateOuverture: new Date('2024-01-15T09:00:00'),
        etat: 'O',
        montantOuverture: 1234.56
      }
    ]
    
    mockSessionListStore.sessions = mockSessions
    
    render(<SessionListPage />)
    
    expect(screen.getByText('1 234,56 €')).toBeInTheDocument()
  })

  it('formats date correctly', () => {
    const mockSessions = [
      {
        id: 1,
        societe: 'Test',
        caisse: 'CAISSE001',
        operateur: 'John',
        dateOuverture: new Date('2024-01-15T09:30:00'),
        etat: 'O',
        montantOuverture: 100
      }
    ]
    
    mockSessionListStore.sessions = mockSessions
    
    render(<SessionListPage />)
    
    expect(screen.getByText('15/01/2024 09:30')).toBeInTheDocument()
  })
})