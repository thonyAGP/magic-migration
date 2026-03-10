// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockStore = {
  sessions: [],
  currentSession: null,
  unilateralBilateralTypes: [],
  isLoading: false,
  error: null,
  isClosing: false,
  loadSessions: vi.fn(),
  loadUnilateralBilateralTypes: vi.fn(),
  fermerSession: vi.fn(),
  generateClosureCode: vi.fn(),
  validateSessionClosure: vi.fn(),
  reset: vi.fn()
}

vi.mock('@/stores/fermetureSessionsStore', () => ({
  useFermetureSessionsStore: () => mockStore
}))

vi.mock('@/components/layout', () => ({
  ScreenLayout: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="screen-layout" className={className}>{children}</div>
  )
}))

vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick, disabled, variant, className, ...props }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    variant?: string
    className?: string
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
  Dialog: ({ children, open, onClose }: {
    children: React.ReactNode
    open: boolean
    onClose: () => void
  }) => open ? (
    <div data-testid="dialog">
      {children}
    </div>
  ) : null,
  Input: ({ value, onChange, readOnly, className, ...props }: {
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    readOnly?: boolean
    className?: string
  }) => (
    <input
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={className}
      {...props}
    />
  )
}))

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ')
}))

import { FermetureSessionsPage } from '@/pages/FermetureSessionsPage'

const mockSessions = [
  {
    id: 1,
    dateOuverture: new Date('2024-01-15T09:00:00'),
    dateFermeture: null,
    statut: 'O'
  },
  {
    id: 2,
    dateOuverture: new Date('2024-01-15T14:30:00'),
    dateFermeture: null,
    statut: 'O'
  },
  {
    id: 3,
    dateOuverture: new Date('2024-01-14T10:00:00'),
    dateFermeture: new Date('2024-01-14T18:00:00'),
    statut: 'C'
  }
]

describe('FermetureSessionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(mockStore, {
      sessions: [],
      currentSession: null,
      unilateralBilateralTypes: [],
      isLoading: false,
      error: null,
      isClosing: false
    })
  })

  it('renders without crashing', () => {
    render(<FermetureSessionsPage />)
    expect(screen.getByTestId('screen-layout')).toBeInTheDocument()
    expect(screen.getByText('Fermeture des Sessions')).toBeInTheDocument()
  })

  it('displays loading state when initially loading', () => {
    mockStore.isLoading = true
    render(<FermetureSessionsPage />)
    
    expect(screen.getByText('Chargement des sessions...')).toBeInTheDocument()
  })

  it('displays error state when there is an error', () => {
    mockStore.error = 'Erreur de chargement des sessions'
    render(<FermetureSessionsPage />)
    
    expect(screen.getByText('Erreur de chargement des sessions')).toBeInTheDocument()
  })

  it('loads sessions and types on mount', () => {
    render(<FermetureSessionsPage />)
    
    expect(mockStore.loadSessions).toHaveBeenCalledOnce()
    expect(mockStore.loadUnilateralBilateralTypes).toHaveBeenCalledOnce()
  })

  it('calls reset on unmount', () => {
    const { unmount } = render(<FermetureSessionsPage />)
    unmount()
    
    expect(mockStore.reset).toHaveBeenCalledOnce()
  })

  it('displays sessions when loaded', () => {
    mockStore.sessions = mockSessions
    render(<FermetureSessionsPage />)
    
    expect(screen.getByText('Session #1')).toBeInTheDocument()
    expect(screen.getByText('Session #2')).toBeInTheDocument()
    expect(screen.getByText('Session #3')).toBeInTheDocument()
    expect(screen.getByText('Sélectionner tout (0/3)')).toBeInTheDocument()
  })

  it('displays empty state when no sessions', () => {
    mockStore.sessions = []
    render(<FermetureSessionsPage />)
    
    expect(screen.getByText('Aucune session ouverte trouvée')).toBeInTheDocument()
  })

  it('handles individual session selection', () => {
    mockStore.sessions = mockSessions
    render(<FermetureSessionsPage />)
    
    const sessionCheckboxes = screen.getAllByRole('checkbox')
    const firstSessionCheckbox = sessionCheckboxes[1]
    
    fireEvent.click(firstSessionCheckbox)
    
    expect(screen.getByText('Sélectionner tout (1/3)')).toBeInTheDocument()
  })

  it('handles select all functionality', () => {
    mockStore.sessions = mockSessions
    render(<FermetureSessionsPage />)
    
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(selectAllCheckbox)
    
    expect(screen.getByText('Sélectionner tout (3/3)')).toBeInTheDocument()
  })

  it('enables closure button when sessions are selected', () => {
    mockStore.sessions = mockSessions
    render(<FermetureSessionsPage />)
    
    const closureButton = screen.getByText('Fermer les sessions sélectionnées')
    expect(closureButton).toBeDisabled()
    
    const sessionCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(sessionCheckbox)
    
    expect(closureButton).not.toBeDisabled()
  })

  it('opens confirmation dialog when initiating closure', () => {
    mockStore.sessions = mockSessions
    mockStore.generateClosureCode = vi.fn().mockReturnValue('CLOSE_CODE_123')
    
    render(<FermetureSessionsPage />)
    
    const sessionCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(sessionCheckbox)
    
    const closureButton = screen.getByText('Fermer les sessions sélectionnées')
    fireEvent.click(closureButton)
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
    expect(screen.getByText('Confirmation de fermeture')).toBeInTheDocument()
    expect(screen.getByDisplayValue('CLOSE_CODE_123')).toBeInTheDocument()
  })

  it('handles successful session closure', async () => {
    mockStore.sessions = mockSessions
    mockStore.generateClosureCode = vi.fn().mockReturnValue('CLOSE_CODE_123')
    mockStore.validateSessionClosure = vi.fn().mockResolvedValue(true)
    mockStore.fermerSession = vi.fn().mockResolvedValue(undefined)
    
    render(<FermetureSessionsPage />)
    
    const sessionCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(sessionCheckbox)
    
    const closureButton = screen.getByText('Fermer les sessions sélectionnées')
    fireEvent.click(closureButton)
    
    const confirmButton = screen.getByText('Confirmer la fermeture')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(mockStore.validateSessionClosure).toHaveBeenCalledWith(1)
      expect(mockStore.fermerSession).toHaveBeenCalledWith(1)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Fermeture réussie')).toBeInTheDocument()
      expect(screen.getByText('1 session(s) fermée(s) avec succès')).toBeInTheDocument()
    })
  })

  it('handles validation errors during closure', async () => {
    mockStore.sessions = mockSessions
    mockStore.generateClosureCode = vi.fn().mockReturnValue('CLOSE_CODE_123')
    mockStore.validateSessionClosure = vi.fn().mockResolvedValue(false)
    
    render(<FermetureSessionsPage />)
    
    const sessionCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(sessionCheckbox)
    
    const closureButton = screen.getByText('Fermer les sessions sélectionnées')
    fireEvent.click(closureButton)
    
    const confirmButton = screen.getByText('Confirmer la fermeture')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText('Erreurs de validation:')).toBeInTheDocument()
    })
    
    await waitFor(() => {
      expect(screen.getByText('• Session 1 ne peut pas être fermée')).toBeInTheDocument()
    })
  })

  it('handles closure errors', async () => {
    mockStore.sessions = mockSessions
    mockStore.generateClosureCode = vi.fn().mockReturnValue('CLOSE_CODE_123')
    mockStore.validateSessionClosure = vi.fn().mockResolvedValue(true)
    mockStore.fermerSession = vi.fn().mockRejectedValue(new Error('Erreur réseau'))
    
    render(<FermetureSessionsPage />)
    
    const sessionCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(sessionCheckbox)
    
    const closureButton = screen.getByText('Fermer les sessions sélectionnées')
    fireEvent.click(closureButton)
    
    const confirmButton = screen.getByText('Confirmer la fermeture')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText('Erreur de fermeture')).toBeInTheDocument()
      expect(screen.getByText('Erreur réseau')).toBeInTheDocument()
    })
  })

  it('cancels closure dialog', () => {
    mockStore.sessions = mockSessions
    mockStore.generateClosureCode = vi.fn().mockReturnValue('CLOSE_CODE_123')
    
    render(<FermetureSessionsPage />)
    
    const sessionCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(sessionCheckbox)
    
    const closureButton = screen.getByText('Fermer les sessions sélectionnées')
    fireEvent.click(closureButton)
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
    
    const cancelButton = screen.getByText('Annuler')
    fireEvent.click(cancelButton)
    
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
  })

  it('refreshes sessions when clicking actualiser', () => {
    render(<FermetureSessionsPage />)
    
    const refreshButton = screen.getByText('Actualiser')
    fireEvent.click(refreshButton)
    
    expect(mockStore.loadSessions).toHaveBeenCalledTimes(2)
  })

  it('shows loading state in closure button when closing', () => {
    mockStore.sessions = mockSessions
    mockStore.isClosing = true
    
    render(<FermetureSessionsPage />)
    
    const sessionCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(sessionCheckbox)
    
    expect(screen.getByText('Fermer les sessions sélectionnées')).toBeDisabled()
  })

  it('opens print window for successful closure report', () => {
    const mockOpen = vi.fn().mockReturnValue({
      document: { write: vi.fn() },
      print: vi.fn(),
      close: vi.fn()
    })
    Object.defineProperty(window, 'open', { value: mockOpen })
    
    mockStore.sessions = mockSessions
    render(<FermetureSessionsPage />)
    
    const sessionCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(sessionCheckbox)
    
    fireEvent.click(screen.getByText('Fermer les sessions sélectionnées'))
    fireEvent.click(screen.getByText('Confirmer la fermeture'))
    
    setTimeout(() => {
      const printButton = screen.getByText('Imprimer le rapport')
      fireEvent.click(printButton)
      expect(mockOpen).toHaveBeenCalledWith('', '_blank')
    }, 100)
  })

  it('displays session status correctly', () => {
    mockStore.sessions = mockSessions
    render(<FermetureSessionsPage />)
    
    const openStatusElements = screen.getAllByText('Ouverte')
    const closedStatusElements = screen.getAllByText('Fermée')
    
    expect(openStatusElements).toHaveLength(2)
    expect(closedStatusElements).toHaveLength(1)
  })

  it('formats session dates correctly', () => {
    mockStore.sessions = [mockSessions[0]]
    render(<FermetureSessionsPage />)
    
    expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument()
    expect(screen.getByText(/09:00/)).toBeInTheDocument()
  })
})