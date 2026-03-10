/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach } from "vitest"
import type { HistoFusionSeparationCriteria, DeletionResult } from "@/types/historyCleanup"

const { mockStore, mockSetState } = vi.hoisted(() => {
  const store = {
    isLoading: false,
    error: null,
    deletionCriteria: null,
    deletionResult: null,
    deleteHistoFusionSeparationSaisie: vi.fn(),
    validateDeletionCriteria: vi.fn(),
    reset: vi.fn(),
    setState: vi.fn()
  }
  return {
    mockStore: store,
    mockSetState: vi.fn()
  }
})

vi.mock("@/stores/historyCleanupStore", () => {
  const mockHook = (() => mockStore) as typeof mockStore & { setState: typeof mockSetState }
  mockHook.setState = mockSetState
  return { useHistoryCleanupStore: mockHook }
})

vi.mock("@/stores/dataSourceStore", () => ({
  useDataSourceStore: () => ({
    getState: () => ({ isRealApi: false })
  })
}))

import { HistoryCleanupPage } from "@/pages/HistoryCleanupPage"

describe("HistoryCleanupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.isLoading = false
    mockStore.error = null
    mockStore.deletionCriteria = null
    mockStore.deletionResult = null
    
    // Reset URL to avoid session context interference
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
        href: 'http://localhost'
      },
      writable: true
    })
  })

  it("renders without crashing", () => {
    render(<HistoryCleanupPage />)
    
    expect(screen.getByText("History Cleanup Service")).toBeInTheDocument()
    expect(screen.getByText(/Deletion Criteria/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Enter chrono EF")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Enter societe code")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Enter compte reference")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Enter filiation reference")).toBeInTheDocument()
  })

  it("displays loading state", () => {
    mockStore.isLoading = true
    
    render(<HistoryCleanupPage />)
    
    expect(screen.getByText("Validating...")).toBeInTheDocument()
    expect(screen.getByText("Processing...")).toBeInTheDocument()
    
    const validateButton = screen.getByText("Validating...")
    const deleteButton = screen.getByText("Processing...")
    expect(validateButton).toBeDisabled()
    expect(deleteButton).toBeDisabled()
  })

  it("displays error state", () => {
    mockStore.error = "Failed to delete records"
    
    render(<HistoryCleanupPage />)
    
    expect(screen.getByText("Error")).toBeInTheDocument()
    expect(screen.getByText("Failed to delete records")).toBeInTheDocument()
    
    const errorSection = screen.getByText("Failed to delete records").closest("div")
    expect(errorSection).toHaveClass("bg-red-50")
  })

  it("displays deletion criteria when available", () => {
    const criteria: HistoFusionSeparationCriteria = {
      chronoEF: 123,
      societe: "TEST",
      compteReference: 456,
      filiationReference: 789
    }
    mockStore.deletionCriteria = criteria
    
    render(<HistoryCleanupPage />)
    
    expect(screen.getByText("Applied Criteria")).toBeInTheDocument()
    expect(screen.getByText("Chrono EF: 123")).toBeInTheDocument()
    expect(screen.getByText("Societe: TEST")).toBeInTheDocument()
    expect(screen.getByText("Compte Reference: 456")).toBeInTheDocument()
    expect(screen.getByText("Filiation Reference: 789")).toBeInTheDocument()
  })

  it("displays deletion result when available", () => {
    const result: DeletionResult = {
      recordsDeleted: 5,
      success: true,
      timestamp: "2024-01-01T12:00:00Z"
    }
    mockStore.deletionResult = result
    
    render(<HistoryCleanupPage />)
    
    expect(screen.getByText("Deletion Complete")).toBeInTheDocument()
    expect(screen.getByText("5")).toBeInTheDocument()
    expect(screen.getByText("Yes")).toBeInTheDocument()
    
    const successSection = screen.getByText("Deletion Complete").closest("div")
    expect(successSection).toHaveClass("bg-green-50")
  })

  it("handles form input changes", () => {
    render(<HistoryCleanupPage />)
    
    const chronoInput = screen.getByPlaceholderText("Enter chrono EF")
    const societeInput = screen.getByPlaceholderText("Enter societe code")
    const compteInput = screen.getByPlaceholderText("Enter compte reference")
    const filiationInput = screen.getByPlaceholderText("Enter filiation reference")
    
    fireEvent.change(chronoInput, { target: { value: "123" } })
    fireEvent.change(societeInput, { target: { value: "TEST" } })
    fireEvent.change(compteInput, { target: { value: "456" } })
    fireEvent.change(filiationInput, { target: { value: "789" } })
    
    expect(chronoInput).toHaveValue(123)
    expect(societeInput).toHaveValue("TEST")
    expect(compteInput).toHaveValue(456)
    expect(filiationInput).toHaveValue(789)
  })

  it("validates criteria when validate button is clicked", async () => {
    mockStore.validateDeletionCriteria.mockResolvedValue(true)
    
    render(<HistoryCleanupPage />)
    
    const chronoInput = screen.getByPlaceholderText("Enter chrono EF")
    fireEvent.change(chronoInput, { target: { value: "123" } })
    
    const validateButton = screen.getByText("Validate Criteria")
    fireEvent.click(validateButton)
    
    await waitFor(() => {
      expect(mockStore.validateDeletionCriteria).toHaveBeenCalledWith({
        chronoEF: 123
      })
    })
    
    expect(screen.getByText("Status: Criteria Valid")).toBeInTheDocument()
  })

  it("handles validation failure", async () => {
    mockStore.validateDeletionCriteria.mockResolvedValue(false)
    
    render(<HistoryCleanupPage />)
    
    const chronoInput = screen.getByPlaceholderText("Enter chrono EF")
    fireEvent.change(chronoInput, { target: { value: "123" } })
    
    const validateButton = screen.getByText("Validate Criteria")
    fireEvent.click(validateButton)
    
    await waitFor(() => {
      expect(screen.getByText("Status: Invalid Criteria")).toBeInTheDocument()
    })
  })

  it("clears form when clear button is clicked", () => {
    render(<HistoryCleanupPage />)
    
    const chronoInput = screen.getByPlaceholderText("Enter chrono EF") as HTMLInputElement
    const societeInput = screen.getByPlaceholderText("Enter societe code") as HTMLInputElement
    
    fireEvent.change(chronoInput, { target: { value: "123" } })
    fireEvent.change(societeInput, { target: { value: "TEST" } })
    
    const clearButton = screen.getByText("Clear")
    fireEvent.click(clearButton)
    
    expect(chronoInput.value).toBe("")
    expect(societeInput.value).toBe("")
    expect(screen.getByText("Status: Not Validated")).toBeInTheDocument()
  })

  it("shows confirmation dialog when delete button is clicked", async () => {
    mockStore.validateDeletionCriteria.mockResolvedValue(true)
    
    render(<HistoryCleanupPage />)
    
    const chronoInput = screen.getByPlaceholderText("Enter chrono EF")
    fireEvent.change(chronoInput, { target: { value: "123" } })
    
    const validateButton = screen.getByText("Validate Criteria")
    fireEvent.click(validateButton)
    
    await waitFor(() => {
      expect(screen.getByText("Status: Criteria Valid")).toBeInTheDocument()
    })
    
    const deleteButton = screen.getByText("Delete Records")
    fireEvent.click(deleteButton)
    
    expect(screen.getByText("Confirm Deletion")).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to delete the history records matching the specified criteria/)).toBeInTheDocument()
  })

  it("performs deletion when confirmed", async () => {
    mockStore.validateDeletionCriteria.mockResolvedValue(true)
    mockStore.deleteHistoFusionSeparationSaisie.mockResolvedValue({
      recordsDeleted: 3,
      success: true,
      timestamp: "2024-01-01T12:00:00Z"
    })
    
    render(<HistoryCleanupPage />)
    
    const chronoInput = screen.getByPlaceholderText("Enter chrono EF")
    fireEvent.change(chronoInput, { target: { value: "123" } })
    
    const validateButton = screen.getByText("Validate Criteria")
    fireEvent.click(validateButton)
    
    await waitFor(() => {
      expect(screen.getByText("Status: Criteria Valid")).toBeInTheDocument()
    })
    
    const deleteButton = screen.getByText("Delete Records")
    fireEvent.click(deleteButton)
    
    const confirmButton = screen.getByText("Confirm Delete")
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(mockStore.deleteHistoFusionSeparationSaisie).toHaveBeenCalledWith({
        chronoEF: 123
      })
    })
  })

  it("cancels deletion when cancel button is clicked", async () => {
    mockStore.validateDeletionCriteria.mockResolvedValue(true)
    
    render(<HistoryCleanupPage />)
    
    const chronoInput = screen.getByPlaceholderText("Enter chrono EF")
    fireEvent.change(chronoInput, { target: { value: "123" } })
    
    const validateButton = screen.getByText("Validate Criteria")
    fireEvent.click(validateButton)
    
    await waitFor(() => {
      expect(screen.getByText("Status: Criteria Valid")).toBeInTheDocument()
    })
    
    const deleteButton = screen.getByText("Delete Records")
    fireEvent.click(deleteButton)
    
    const cancelButton = screen.getByText("Cancel")
    fireEvent.click(cancelButton)
    
    expect(screen.queryByText("Confirm Deletion")).not.toBeInTheDocument()
    expect(mockStore.deleteHistoFusionSeparationSaisie).not.toHaveBeenCalled()
  })

  it("disables validate button when no criteria is provided", () => {
    render(<HistoryCleanupPage />)
    
    const validateButton = screen.getByText("Validate Criteria")
    expect(validateButton).toBeDisabled()
  })

  it("enables validate button when criteria is provided", () => {
    render(<HistoryCleanupPage />)
    
    const chronoInput = screen.getByPlaceholderText("Enter chrono EF")
    fireEvent.change(chronoInput, { target: { value: "123" } })
    
    const validateButton = screen.getByText("Validate Criteria")
    expect(validateButton).not.toBeDisabled()
  })

  it("calls reset on unmount", () => {
    const { unmount } = render(<HistoryCleanupPage />)
    
    unmount()
    
    expect(mockStore.reset).toHaveBeenCalled()
  })
})