/**
 * @vitest-environment jsdom
 */

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const { mockUseSessionConcurrencyStore, mockReset, mockForceOpenSession } = vi.hoisted(() => ({
  mockUseSessionConcurrencyStore: vi.fn(),
  mockReset: vi.fn(),
  mockForceOpenSession: vi.fn(),
}))

vi.mock('@/stores/sessionConcurrencyStore', () => ({
  useSessionConcurrencyStore: mockUseSessionConcurrencyStore
}))

vi.mock('@/components/layout', () => ({
  ScreenLayout: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="screen-layout" className={className}>
      {children}
    </div>
  )
}))

vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick, disabled, variant, className }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    variant?: string
    className?: string
  }) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      className={className}
    >
      {children}
    </button>
  ),
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
    open ? <div data-testid="dialog">{children}</div> : null
  )
}))

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ')
}))

import { SessionConcurrencyPage } from '@/pages/SessionConcurrencyPage'

describe('SessionConcurrencyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockReset.mockClear()
    mockForceOpenSession.mockClear()
  })

  it('renders without crashing', () => {
    mockUseSessionConcurrencyStore.mockReturnValue({
      activeSessions: [],
      isLoading: false,
      error: null,
      conflictDetected: false,
      conflictingSession: null,
      checkConcurrency: vi.fn(),
      registerSession: vi.fn(),
      releaseSession: vi.fn(),
      forceOpenSession: mockForceOpenSession,
      reset: mockReset
    })

    render(<SessionConcurrencyPage />)
    
    expect(screen.getByText('Gestion de la Concurrence')).toBeInTheDocument()
    expect(screen.getByText('Contrôle des sessions actives et résolution des conflits')).toBeInTheDocument()
  })

  it('displays loading state', () => {
    mockUseSessionConcurrencyStore.mockReturnValue({
      activeSessions: [],
      isLoading: true,
      error: null,
      conflictDetected: false,
      conflictingSession: null,
      checkConcurrency: vi.fn(),
      registerSession: vi.fn(),
      releaseSession: vi.fn(),
      forceOpenSession: mockForceOpenSession,
      reset: mockReset
    })

    render(<SessionConcurrencyPage />)
    
    expect(screen.getByText('Vérification de la concurrence...')).toBeInTheDocument()
  })

  it('displays error state', () => {
    mockUseSessionConcurrencyStore.mockReturnValue({
      activeSessions: [],
      isLoading: false,
      error: 'Connection failed',
      conflictDetected: false,
      conflictingSession: null,
      checkConcurrency: vi.fn(),
      registerSession: vi.fn(),
      releaseSession: vi.fn(),
      forceOpenSession: mockForceOpenSession,
      reset: mockReset
    })

    render(<SessionConcurrencyPage />)
    
    expect(screen.getByText('Erreur lors de la vérification')).toBeInTheDocument()
    expect(screen.getByText('Connection failed')).toBeInTheDocument()
    expect(screen.getByText('Réessayer')).toBeInTheDocument()
  })

  it('handles retry button click in error state', () => {
    mockUseSessionConcurrencyStore.mockReturnValue({
      activeSessions: [],
      isLoading: false,
      error: 'Connection failed',
      conflictDetected: false,
      conflictingSession: null,
      checkConcurrency: vi.fn(),
      registerSession: vi.fn(),
      releaseSession: vi.fn(),
      forceOpenSession: mockForceOpenSession,
      reset: mockReset
    })

    render(<SessionConcurrencyPage />)
    
    const retryButton = screen.getByText('Réessayer')
    fireEvent.click(retryButton)
    
    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('displays data when loaded with active sessions', () => {
    const mockSession = {
      societe: 'TEST_CORP',
      compte: 12345,
      filiation: 1,
      terminalId: 'TERM001',
      timestamp: new Date('2024-01-15T10:30:00Z'),
      codeCalcul: 'C' as const,
      coffreEnCoursComptage: true
    }

    mockUseSessionConcurrencyStore.mockReturnValue({
      activeSessions: [mockSession],
      isLoading: false,
      error: null,
      conflictDetected: false,
      conflictingSession: null,
      checkConcurrency: vi.fn(),
      registerSession: vi.fn(),
      releaseSession: vi.fn(),
      forceOpenSession: mockForceOpenSession,
      reset: mockReset
    })

    render(<SessionConcurrencyPage />)
    
    expect(screen.getByText('Sessions Actives')).toBeInTheDocument()
    expect(screen.getByText('TEST_CORP')).toBeInTheDocument()
    expect(screen.getByText('12345')).toBeInTheDocument()
    expect(screen.getByText('TERM001')).toBeInTheDocument()
    expect(screen.getByText('En cours')).toBeInTheDocument()
  })

  it('displays no sessions message when no data', () => {
    mockUseSessionConcurrencyStore.mockReturnValue({
      activeSessions: [],
      isLoading: false,
      error: null,
      conflictDetected: false,
      conflictingSession: null,
      checkConcurrency: vi.fn(),
      registerSession: vi.fn(),
      releaseSession: vi.fn(),
      forceOpenSession: mockForceOpenSession,
      reset: mockReset
    })

    render(<SessionConcurrencyPage />)
    
    expect(screen.getByText('Aucune session active détectée')).toBeInTheDocument()
    expect(screen.getByText('Le système fonctionne normalement')).toBeInTheDocument()
  })

  it('displays conflict dialog when conflict detected', () => {
    const mockConflictingSession = {
      societe: 'CONFLICT_CORP',
      compte: 98765,
      filiation: 2,
      terminalId: 'TERM999',
      timestamp: new Date('2024-01-15T14:30:00Z'),
      codeCalcul: 'D' as const,
      coffreEnCoursComptage: true
    }

    mockUseSessionConcurrencyStore.mockReturnValue({
      activeSessions: [],
      isLoading: false,
      error: null,
      conflictDetected: true,
      conflictingSession: mockConflictingSession,
      checkConcurrency: vi.fn(),
      registerSession: vi.fn(),
      releaseSession: vi.fn(),
      forceOpenSession: mockForceOpenSession,
      reset: mockReset
    })

    render(<SessionConcurrencyPage />)
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
    expect(screen.getByText('Conflit de Session Détecté')).toBeInTheDocument()
    expect(screen.getByText('Une session est déjà active pour ce compte')).toBeInTheDocument()
    expect(screen.getByText('CONFLICT_CORP')).toBeInTheDocument()
    expect(screen.getByText('98765')).toBeInTheDocument()
    expect(screen.getByText('TERM999')).toBeInTheDocument()
  })

  it('handles cancel action in conflict dialog', () => {
    const mockConflictingSession = {
      societe: 'CONFLICT_CORP',
      compte: 98765,
      filiation: 2,
      terminalId: 'TERM999',
      timestamp: new Date('2024-01-15T14:30:00Z'),
      codeCalcul: 'D' as const,
      coffreEnCoursComptage: true
    }

    mockUseSessionConcurrencyStore.mockReturnValue({
      activeSessions: [],
      isLoading: false,
      error: null,
      conflictDetected: true,
      conflictingSession: mockConflictingSession,
      checkConcurrency: vi.fn(),
      registerSession: vi.fn(),
      releaseSession: vi.fn(),
      forceOpenSession: mockForceOpenSession,
      reset: mockReset
    })

    render(<SessionConcurrencyPage />)
    
    const cancelButton = screen.getByText('Annuler')
    fireEvent.click(cancelButton)
    
    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('handles force open action in conflict dialog', async () => {
    const mockConflictingSession = {
      societe: 'CONFLICT_CORP',
      compte: 98765,
      filiation: 2,
      terminalId: 'TERM999',
      timestamp: new Date('2024-01-15T14:30:00Z'),
      codeCalcul: 'D' as const,
      coffreEnCoursComptage: true
    }

    mockForceOpenSession.mockResolvedValue(undefined)

    mockUseSessionConcurrencyStore.mockReturnValue({
      activeSessions: [],
      isLoading: false,
      error: null,
      conflictDetected: true,
      conflictingSession: mockConflictingSession,
      checkConcurrency: vi.fn(),
      registerSession: vi.fn(),
      releaseSession: vi.fn(),
      forceOpenSession: mockForceOpenSession,
      reset: mockReset
    })

    render(<SessionConcurrencyPage />)
    
    const forceButton = screen.getByText("Forcer l'Ouverture")
    fireEvent.click(forceButton)
    
    await waitFor(() => {
      expect(mockForceOpenSession).toHaveBeenCalledWith({
        societe: 'CONFLICT_CORP',
        compte: 98765,
        filiation: 2,
        terminalId: 'TERM999',
        reason: 'Force open by user'
      })
    })
    
    await waitFor(() => {
      expect(mockReset).toHaveBeenCalledTimes(1)
    })
  })

  it('handles force open error gracefully', async () => {
    const mockConflictingSession = {
      societe: 'CONFLICT_CORP',
      compte: 98765,
      filiation: 2,
      terminalId: 'TERM999',
      timestamp: new Date('2024-01-15T14:30:00Z'),
      codeCalcul: 'D' as const,
      coffreEnCoursComptage: true
    }

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockForceOpenSession.mockRejectedValue(new Error('Force open failed'))

    mockUseSessionConcurrencyStore.mockReturnValue({
      activeSessions: [],
      isLoading: false,
      error: null,
      conflictDetected: true,
      conflictingSession: mockConflictingSession,
      checkConcurrency: vi.fn(),
      registerSession: vi.fn(),
      releaseSession: vi.fn(),
      forceOpenSession: mockForceOpenSession,
      reset: mockReset
    })

    render(<SessionConcurrencyPage />)
    
    const forceButton = screen.getByText("Forcer l'Ouverture")
    fireEvent.click(forceButton)
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to force open session:',
        expect.any(Error)
      )
    })

    consoleErrorSpy.mockRestore()
  })

  it('displays inactive session status correctly', () => {
    const mockSession = {
      societe: 'TEST_CORP',
      compte: 12345,
      filiation: 1,
      terminalId: 'TERM001',
      timestamp: new Date('2024-01-15T10:30:00Z'),
      codeCalcul: null,
      coffreEnCoursComptage: false
    }

    mockUseSessionConcurrencyStore.mockReturnValue({
      activeSessions: [mockSession],
      isLoading: false,
      error: null,
      conflictDetected: false,
      conflictingSession: null,
      checkConcurrency: vi.fn(),
      registerSession: vi.fn(),
      releaseSession: vi.fn(),
      forceOpenSession: mockForceOpenSession,
      reset: mockReset
    })

    render(<SessionConcurrencyPage />)
    
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('formats timestamp correctly in French locale', () => {
    const mockSession = {
      societe: 'TEST_CORP',
      compte: 12345,
      filiation: 1,
      terminalId: 'TERM001',
      timestamp: new Date('2024-01-15T10:30:00Z'),
      codeCalcul: 'C' as const,
      coffreEnCoursComptage: true
    }

    mockUseSessionConcurrencyStore.mockReturnValue({
      activeSessions: [mockSession],
      isLoading: false,
      error: null,
      conflictDetected: false,
      conflictingSession: null,
      checkConcurrency: vi.fn(),
      registerSession: vi.fn(),
      releaseSession: vi.fn(),
      forceOpenSession: mockForceOpenSession,
      reset: mockReset
    })

    render(<SessionConcurrencyPage />)
    
    expect(screen.getByText(/Dernière activité:/)).toBeInTheDocument()
  })

  it('disables buttons when loading', () => {
    const mockConflictingSession = {
      societe: 'CONFLICT_CORP',
      compte: 98765,
      filiation: 2,
      terminalId: 'TERM999',
      timestamp: new Date('2024-01-15T14:30:00Z'),
      codeCalcul: 'D' as const,
      coffreEnCoursComptage: true
    }

    mockUseSessionConcurrencyStore.mockReturnValue({
      activeSessions: [],
      isLoading: true,
      error: null,
      conflictDetected: true,
      conflictingSession: mockConflictingSession,
      checkConcurrency: vi.fn(),
      registerSession: vi.fn(),
      releaseSession: vi.fn(),
      forceOpenSession: mockForceOpenSession,
      reset: mockReset
    })

    render(<SessionConcurrencyPage />)
    
    const cancelButton = screen.getByText('Annuler')
    const forceButton = screen.getByText('...')
    
    expect(cancelButton).toBeDisabled()
    expect(forceButton).toBeDisabled()
  })
})