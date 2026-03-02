/**
 * @vitest-environment jsdom
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockAccountMergeStore = {
  mergeRequest: null,
  sourceAccount: null,
  targetAccount: null,
  mergeHistory: [],
  mergeLogs: [],
  validationStatus: null,
  currentStep: 'validation' as const,
  isProcessing: false,
  error: null,
  progressData: { current: 0, total: 0, table: '' },
  validatePrerequisites: vi.fn(),
  loadAccounts: vi.fn(),
  executeMerge: vi.fn(),
  saveMergeHistory: vi.fn(),
  writeMergeLogs: vi.fn(),
  cleanupTemporaryData: vi.fn(),
  printMergeTicket: vi.fn(),
  cancelMerge: vi.fn(),
  getMergeHistory: vi.fn(),
  getMergeLogs: vi.fn(),
  setCurrentStep: vi.fn(),
  updateProgress: vi.fn(),
  setError: vi.fn(),
  reset: vi.fn()
}

vi.mock('@/stores/accountMergeStore', () => ({
  useAccountMergeStore: () => mockAccountMergeStore
}))

import { AccountMergePage } from '@/pages/AccountMergePage'

describe('AccountMergePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAccountMergeStore.mergeRequest = null
    mockAccountMergeStore.sourceAccount = null
    mockAccountMergeStore.targetAccount = null
    mockAccountMergeStore.mergeHistory = []
    mockAccountMergeStore.mergeLogs = []
    mockAccountMergeStore.validationStatus = null
    mockAccountMergeStore.currentStep = 'validation'
    mockAccountMergeStore.isProcessing = false
    mockAccountMergeStore.error = null
    mockAccountMergeStore.progressData = { current: 0, total: 0, table: '' }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<AccountMergePage />)
    
    expect(screen.getByText('Sélection des comptes')).toBeInTheDocument()
    expect(screen.getByText('Progression')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
    expect(screen.getByText('Historique des fusions')).toBeInTheDocument()
  })

  it('displays loading state during processing', () => {
    mockAccountMergeStore.isProcessing = true
    
    render(<AccountMergePage />)
    
    expect(screen.getByText('Traitement...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Traitement...' })).toBeDisabled()
  })

  it('displays validation status when loaded', () => {
    mockAccountMergeStore.validationStatus = {
      network: true,
      closure: false,
      validation: 'V'
    }
    
    render(<AccountMergePage />)
    
    expect(screen.getByText('Réseau: OK')).toBeInTheDocument()
    expect(screen.getByText('Clôture: OK')).toBeInTheDocument()
    expect(screen.getByText('Validation: V')).toBeInTheDocument()
  })

  it('displays account information when accounts are loaded', () => {
    mockAccountMergeStore.sourceAccount = {
      id: 123,
      status: 'active',
      balance: 1500.50,
      clientName: 'Jean Dupont',
      linkedAccounts: null
    }
    mockAccountMergeStore.targetAccount = {
      id: 456,
      status: 'active',
      balance: 2300.75,
      clientName: 'Marie Martin',
      linkedAccounts: null
    }
    
    render(<AccountMergePage />)
    
    expect(screen.getByText('N°: 123')).toBeInTheDocument()
    expect(screen.getByText('Client: Jean Dupont')).toBeInTheDocument()
    expect(screen.getByText('Solde: 1 500,50 €')).toBeInTheDocument()
    expect(screen.getByText('N°: 456')).toBeInTheDocument()
    expect(screen.getByText('Client: Marie Martin')).toBeInTheDocument()
    expect(screen.getByText('Solde: 2 300,75 €')).toBeInTheDocument()
  })

  it('displays progress data when processing', () => {
    mockAccountMergeStore.progressData = {
      current: 150,
      total: 300,
      table: 'operations'
    }
    mockAccountMergeStore.currentStep = 'execution'
    
    render(<AccountMergePage />)
    
    expect(screen.getByText('Étape actuelle: execution')).toBeInTheDocument()
    expect(screen.getByText('Table en cours:')).toBeInTheDocument()
    expect(screen.getByText('operations')).toBeInTheDocument()
    expect(screen.getByText('Progression: 150 / 300')).toBeInTheDocument()
  })

  it('displays merge history when available', () => {
    mockAccountMergeStore.mergeHistory = [
      {
        id: 1,
        mergeRequestId: 100,
        timestamp: new Date('2024-01-15T10:30:00'),
        operation: 'Fusion comptes 123 → 456',
        details: 'Fusion terminée avec succès'
      },
      {
        id: 2,
        mergeRequestId: 101,
        timestamp: new Date('2024-01-14T15:45:00'),
        operation: 'Fusion comptes 789 → 012',
        details: null
      }
    ]
    
    render(<AccountMergePage />)
    
    expect(screen.getByText('Fusion comptes 123 → 456')).toBeInTheDocument()
    expect(screen.getByText('Fusion comptes 789 → 012')).toBeInTheDocument()
    expect(screen.getByText('Fusion terminée avec succès')).toBeInTheDocument()
  })

  it('displays merge request information when available', () => {
    mockAccountMergeStore.mergeRequest = {
      id: 100,
      sourceAccountId: 123,
      targetAccountId: 456,
      status: 'completed',
      validatedBy: 'admin',
      validatedAt: new Date('2024-01-15T10:30:00'),
      chronoCode: 'CHR2024001'
    }
    
    render(<AccountMergePage />)
    
    expect(screen.getByText('ID:')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('Statut:')).toBeInTheDocument()
    expect(screen.getByText('completed')).toBeInTheDocument()
    expect(screen.getByText('Code chrono:')).toBeInTheDocument()
    expect(screen.getByText('CHR2024001')).toBeInTheDocument()
    expect(screen.getByText('Validé par:')).toBeInTheDocument()
    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('handles account validation form submission', async () => {
    render(<AccountMergePage />)
    
    const sourceInput = screen.getByPlaceholderText('Numéro de compte')
    const targetInputs = screen.getAllByPlaceholderText('Numéro de compte')
    const validateButton = screen.getByRole('button', { name: 'Valider les comptes' })
    
    fireEvent.change(sourceInput, { target: { value: '123' } })
    fireEvent.change(targetInputs[1], { target: { value: '456' } })
    fireEvent.click(validateButton)
    
    await waitFor(() => {
      expect(mockAccountMergeStore.validatePrerequisites).toHaveBeenCalled()
      expect(mockAccountMergeStore.loadAccounts).toHaveBeenCalledWith(123, 456)
    })
  })

  it('handles merge execution', async () => {
    mockAccountMergeStore.sourceAccount = {
      id: 123,
      status: 'active',
      balance: 1500,
      clientName: 'Test User',
      linkedAccounts: null
    }
    mockAccountMergeStore.targetAccount = {
      id: 456,
      status: 'active',
      balance: 2300,
      clientName: 'Test User 2',
      linkedAccounts: null
    }
    
    render(<AccountMergePage />)
    
    const executeButton = screen.getByRole('button', { name: 'Exécuter fusion' })
    fireEvent.click(executeButton)
    
    await waitFor(() => {
      expect(mockAccountMergeStore.executeMerge).toHaveBeenCalled()
    })
  })

  it('handles merge cancellation', async () => {
    mockAccountMergeStore.isProcessing = true
    
    render(<AccountMergePage />)
    
    const cancelButton = screen.getByRole('button', { name: 'Annuler' })
    fireEvent.click(cancelButton)
    
    await waitFor(() => {
      expect(mockAccountMergeStore.cancelMerge).toHaveBeenCalled()
    })
  })

  it('handles print ticket action', async () => {
    mockAccountMergeStore.mergeRequest = {
      id: 100,
      sourceAccountId: 123,
      targetAccountId: 456,
      status: 'completed',
      validatedBy: 'admin',
      validatedAt: new Date(),
      chronoCode: 'CHR2024001'
    }
    mockAccountMergeStore.currentStep = 'completion'
    
    render(<AccountMergePage />)
    
    const printButton = screen.getByRole('button', { name: 'Imprimer ticket' })
    fireEvent.click(printButton)
    
    await waitFor(() => {
      expect(mockAccountMergeStore.printMergeTicket).toHaveBeenCalledWith(100)
    })
  })

  it('handles history filtering', async () => {
    render(<AccountMergePage />)
    
    const dateInputs = screen.getAllByDisplayValue('')
    const filterButton = screen.getByRole('button', { name: 'Filtrer' })
    
    fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } })
    fireEvent.change(dateInputs[1], { target: { value: '2024-01-31' } })
    fireEvent.click(filterButton)
    
    await waitFor(() => {
      expect(mockAccountMergeStore.getMergeHistory).toHaveBeenCalledWith({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      })
    })
  })

  it('handles view logs action', async () => {
    mockAccountMergeStore.mergeHistory = [
      {
        id: 1,
        mergeRequestId: 100,
        timestamp: new Date('2024-01-15T10:30:00'),
        operation: 'Test Merge',
        details: null
      }
    ]
    
    render(<AccountMergePage />)
    
    const logsButton = screen.getByRole('button', { name: 'Logs' })
    fireEvent.click(logsButton)
    
    await waitFor(() => {
      expect(mockAccountMergeStore.getMergeLogs).toHaveBeenCalledWith(100)
    })
  })

  it('displays logs dialog when viewing logs', async () => {
    mockAccountMergeStore.mergeHistory = [
      {
        id: 1,
        mergeRequestId: 100,
        timestamp: new Date(),
        operation: 'Test Merge',
        details: null
      }
    ]
    mockAccountMergeStore.mergeLogs = [
      {
        id: 1,
        mergeId: 100,
        operation: 'transfer',
        tableName: 'accounts',
        recordCount: 150,
        timestamp: new Date('2024-01-15T10:30:00'),
        success: true
      }
    ]
    
    render(<AccountMergePage />)
    
    const logsButton = screen.getByRole('button', { name: 'Logs' })
    fireEvent.click(logsButton)
    
    await waitFor(() => {
      expect(screen.getByText('Logs de fusion - ID 100')).toBeInTheDocument()
      expect(screen.getByText('accounts')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument()
      expect(screen.getByText('Succès')).toBeInTheDocument()
    })
  })

  it('closes logs dialog when close button is clicked', async () => {
    mockAccountMergeStore.mergeHistory = [
      {
        id: 1,
        mergeRequestId: 100,
        timestamp: new Date(),
        operation: 'Test Merge',
        details: null
      }
    ]
    
    render(<AccountMergePage />)
    
    const logsButton = screen.getByRole('button', { name: 'Logs' })
    fireEvent.click(logsButton)
    
    await waitFor(() => {
      expect(screen.getByText('Logs de fusion - ID 100')).toBeInTheDocument()
    })
    
    const closeButton = screen.getByRole('button', { name: 'Fermer' })
    fireEvent.click(closeButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Logs de fusion - ID 100')).not.toBeInTheDocument()
    })
  })

  it('displays error state when error occurs', () => {
    mockAccountMergeStore.error = 'Erreur lors de la validation des comptes'
    
    render(<AccountMergePage />)
    
    expect(screen.getByText('Erreur lors de la validation des comptes')).toBeInTheDocument()
  })

  it('handles validation error when accounts are missing', async () => {
    render(<AccountMergePage />)
    
    const validateButton = screen.getByRole('button', { name: 'Valider les comptes' })
    fireEvent.click(validateButton)
    
    await waitFor(() => {
      expect(mockAccountMergeStore.setError).toHaveBeenCalledWith('Veuillez saisir les numéros de compte source et cible')
    })
  })

  it('calls reset on component unmount', () => {
    const { unmount } = render(<AccountMergePage />)
    
    unmount()
    
    expect(mockAccountMergeStore.reset).toHaveBeenCalled()
  })

  it('calls getMergeHistory on component mount', () => {
    render(<AccountMergePage />)
    
    expect(mockAccountMergeStore.getMergeHistory).toHaveBeenCalled()
  })

  it('displays empty state when no history is available', () => {
    mockAccountMergeStore.mergeHistory = []
    
    render(<AccountMergePage />)
    
    expect(screen.getByText('Aucun historique trouvé')).toBeInTheDocument()
  })

  it('displays empty state when no logs are available', async () => {
    mockAccountMergeStore.mergeHistory = [
      {
        id: 1,
        mergeRequestId: 100,
        timestamp: new Date(),
        operation: 'Test Merge',
        details: null
      }
    ]
    mockAccountMergeStore.mergeLogs = []
    
    render(<AccountMergePage />)
    
    const logsButton = screen.getByRole('button', { name: 'Logs' })
    fireEvent.click(logsButton)
    
    await waitFor(() => {
      expect(screen.getByText('Aucun log trouvé')).toBeInTheDocument()
    })
  })
})