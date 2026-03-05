/// <vitest-environment jsdom />

import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"

const { mockStore, mockSetState } = vi.hoisted(() => {
  const store = {
    historyEntries: [],
    isLoading: false,
    error: null,
    currentEntry: null,
    writeHistoryEntry: vi.fn(),
    formatFullName: vi.fn((nom: string, prenom: string) => `${prenom} ${nom}`),
    setCurrentEntry: vi.fn(),
    loadHistoryEntries: vi.fn(),
    reset: vi.fn(),
    setState: vi.fn()
  }
  return {
    mockStore: store,
    mockSetState: vi.fn()
  }
})

vi.mock("@/stores/fusionSeparationHistoryStore", () => {
  const mockHook = (() => mockStore) as typeof mockStore & { setState: typeof mockSetState }
  mockHook.setState = mockSetState
  return { useFusionSeparationHistoryStore: mockHook }
})

import { FusionSeparationHistoryPage } from "@/pages/FusionSeparationHistoryPage"
import type { FusionSeparationHistoryEntry } from "@/types/fusionSeparationHistory"

describe("FusionSeparationHistoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.historyEntries = []
    mockStore.isLoading = false
    mockStore.error = null
    mockStore.currentEntry = null
  })

  it("renders without crashing", () => {
    render(<FusionSeparationHistoryPage />)
    expect(screen.getByText("Fusion Separation History")).toBeInTheDocument()
  })

  it("displays loading state", () => {
    mockStore.isLoading = true
    render(<FusionSeparationHistoryPage />)
    expect(screen.getByText("Loading fusion separation history...")).toBeInTheDocument()
  })

  it("loads history entries on mount", () => {
    render(<FusionSeparationHistoryPage />)
    expect(mockStore.loadHistoryEntries).toHaveBeenCalled()
  })

  it("displays error state", () => {
    mockStore.error = "Failed to load data"
    render(<FusionSeparationHistoryPage />)
    expect(screen.getByText("Failed to load data")).toBeInTheDocument()
  })

  it("displays all form fields", () => {
    render(<FusionSeparationHistoryPage />)
    
    expect(screen.getByLabelText(/chrono ef/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/société/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/compte reference/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/filiation reference/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/compte pointe old/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/filiation pointe old/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/compte pointe new/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/filiation pointe new/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/type ef/i)).toBeInTheDocument()
    expect(screen.getByLabelText("Nom *")).toBeInTheDocument()
    expect(screen.getByLabelText("Prénom *")).toBeInTheDocument()
  })

  it("handles form input changes", () => {
    render(<FusionSeparationHistoryPage />)
    
    const chronoInput = screen.getByLabelText(/chrono ef/i)
    fireEvent.change(chronoInput, { target: { value: "123" } })
    expect(chronoInput).toHaveValue(123)

    const societeInput = screen.getByLabelText(/société/i)
    fireEvent.change(societeInput, { target: { value: "Test Company" } })
    expect(societeInput).toHaveValue("Test Company")

    const typeSelect = screen.getByLabelText(/type ef/i)
    fireEvent.change(typeSelect, { target: { value: "SEPARATION" } })
    expect(typeSelect).toHaveValue("SEPARATION")
  })

  it("validates required fields on submit", async () => {
    render(<FusionSeparationHistoryPage />)
    
    const submitButton = screen.getByText("Write History Entry")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/chrono ef is required/i)).toBeInTheDocument()
    })
  })

  it("validates numeric fields", async () => {
    render(<FusionSeparationHistoryPage />)
    
    fireEvent.change(screen.getByLabelText(/chrono ef/i), { target: { value: "-1" } })
    fireEvent.change(screen.getByLabelText(/société/i), { target: { value: "Test Company" } })
    fireEvent.change(screen.getByLabelText(/compte reference/i), { target: { value: "456" } })
    fireEvent.change(screen.getByLabelText(/filiation reference/i), { target: { value: "789" } })
    fireEvent.change(screen.getByLabelText(/compte pointe old/i), { target: { value: "111" } })
    fireEvent.change(screen.getByLabelText(/filiation pointe old/i), { target: { value: "222" } })
    fireEvent.change(screen.getByLabelText(/compte pointe new/i), { target: { value: "333" } })
    fireEvent.change(screen.getByLabelText(/filiation pointe new/i), { target: { value: "444" } })
    fireEvent.change(screen.getByLabelText("Nom *"), { target: { value: "Doe" } })
    fireEvent.change(screen.getByLabelText("Prénom *"), { target: { value: "John" } })
    
    const submitButton = screen.getByText("Write History Entry")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/chrono ef must be a positive number/i)).toBeInTheDocument()
    })
  })

  it("submits form with valid data", async () => {
    mockStore.writeHistoryEntry.mockResolvedValue(undefined)
    
    render(<FusionSeparationHistoryPage />)
    
    fireEvent.change(screen.getByLabelText(/chrono ef/i), { target: { value: "123" } })
    fireEvent.change(screen.getByLabelText(/société/i), { target: { value: "Test Company" } })
    fireEvent.change(screen.getByLabelText(/compte reference/i), { target: { value: "456" } })
    fireEvent.change(screen.getByLabelText(/filiation reference/i), { target: { value: "789" } })
    fireEvent.change(screen.getByLabelText(/compte pointe old/i), { target: { value: "111" } })
    fireEvent.change(screen.getByLabelText(/filiation pointe old/i), { target: { value: "222" } })
    fireEvent.change(screen.getByLabelText(/compte pointe new/i), { target: { value: "333" } })
    fireEvent.change(screen.getByLabelText(/filiation pointe new/i), { target: { value: "444" } })
    fireEvent.change(screen.getByLabelText("Nom *"), { target: { value: "Doe" } })
    fireEvent.change(screen.getByLabelText("Prénom *"), { target: { value: "John" } })

    const submitButton = screen.getByText("Write History Entry")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockStore.writeHistoryEntry).toHaveBeenCalledWith({
        chronoEF: 123,
        societe: "Test Company",
        compteReference: 456,
        filiationReference: 789,
        comptePointeOld: 111,
        filiationPointeOld: 222,
        comptePointeNew: 333,
        filiationPointeNew: 444,
        typeEF: "FUSION",
        nom: "Doe",
        prenom: "John"
      })
    })
  })

  it("displays success message after successful submit", async () => {
    mockStore.writeHistoryEntry.mockResolvedValue(undefined)
    
    render(<FusionSeparationHistoryPage />)
    
    const chronoInput = screen.getByLabelText(/chrono ef/i) as HTMLInputElement
    
    fireEvent.change(screen.getByLabelText(/chrono ef/i), { target: { value: "123" } })
    fireEvent.change(screen.getByLabelText(/société/i), { target: { value: "Test Company" } })
    fireEvent.change(screen.getByLabelText(/compte reference/i), { target: { value: "456" } })
    fireEvent.change(screen.getByLabelText(/filiation reference/i), { target: { value: "789" } })
    fireEvent.change(screen.getByLabelText(/compte pointe old/i), { target: { value: "111" } })
    fireEvent.change(screen.getByLabelText(/filiation pointe old/i), { target: { value: "222" } })
    fireEvent.change(screen.getByLabelText(/compte pointe new/i), { target: { value: "333" } })
    fireEvent.change(screen.getByLabelText(/filiation pointe new/i), { target: { value: "444" } })
    fireEvent.change(screen.getByLabelText("Nom *"), { target: { value: "Doe" } })
    fireEvent.change(screen.getByLabelText("Prénom *"), { target: { value: "John" } })

    const submitButton = screen.getByText("Write History Entry")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockStore.writeHistoryEntry).toHaveBeenCalled()
      expect(chronoInput.value).toBe("")
    })
  })

  it("handles submit error", async () => {
    mockStore.writeHistoryEntry.mockRejectedValue(new Error("Network error"))
    
    render(<FusionSeparationHistoryPage />)
    
    fireEvent.change(screen.getByLabelText(/chrono ef/i), { target: { value: "123" } })
    fireEvent.change(screen.getByLabelText(/société/i), { target: { value: "Test Company" } })
    fireEvent.change(screen.getByLabelText(/compte reference/i), { target: { value: "456" } })
    fireEvent.change(screen.getByLabelText(/filiation reference/i), { target: { value: "789" } })
    fireEvent.change(screen.getByLabelText(/compte pointe old/i), { target: { value: "111" } })
    fireEvent.change(screen.getByLabelText(/filiation pointe old/i), { target: { value: "222" } })
    fireEvent.change(screen.getByLabelText(/compte pointe new/i), { target: { value: "333" } })
    fireEvent.change(screen.getByLabelText(/filiation pointe new/i), { target: { value: "444" } })
    fireEvent.change(screen.getByLabelText("Nom *"), { target: { value: "Doe" } })
    fireEvent.change(screen.getByLabelText("Prénom *"), { target: { value: "John" } })

    const submitButton = screen.getByText("Write History Entry")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to write history entry/i)).toBeInTheDocument()
    })
  })

  it("clears form when clear button is clicked", () => {
    render(<FusionSeparationHistoryPage />)
    
    const chronoInput = screen.getByLabelText(/chrono ef/i) as HTMLInputElement
    const societeInput = screen.getByLabelText(/société/i)
    
    fireEvent.change(chronoInput, { target: { value: "123" } })
    fireEvent.change(societeInput, { target: { value: "Test Company" } })

    const clearButton = screen.getByText("Clear Form")
    fireEvent.click(clearButton)

    expect(chronoInput.value).toBe("")
    expect(societeInput).toHaveValue("")
  })

  it("displays current entry when available", () => {
    const mockEntry: FusionSeparationHistoryEntry = {
      chronoEF: 123,
      societe: "Test Company",
      compteReference: 456,
      filiationReference: 789,
      comptePointeOld: 111,
      filiationPointeOld: 222,
      comptePointeNew: 333,
      filiationPointeNew: 444,
      typeEF: "FUSION",
      nom: "Doe",
      prenom: "John"
    }

    mockStore.currentEntry = mockEntry
    mockStore.formatFullName.mockReturnValue("John Doe")

    render(<FusionSeparationHistoryPage />)

    expect(screen.getByText("Current Entry")).toBeInTheDocument()
    expect(screen.getByText(/123/)).toBeInTheDocument()
    expect(screen.getByText(/Test Company/)).toBeInTheDocument()
    expect(screen.getByText((content, element) => {
      return element?.textContent === "Type: FUSION"
    })).toBeInTheDocument()
  })

  it("displays history entries when available", () => {
    const mockEntries: FusionSeparationHistoryEntry[] = [
      {
        chronoEF: 123,
        societe: "Company A",
        compteReference: 456,
        filiationReference: 789,
        comptePointeOld: 111,
        filiationPointeOld: 222,
        comptePointeNew: 333,
        filiationPointeNew: 444,
        typeEF: "FUSION",
        nom: "Doe",
        prenom: "John"
      },
      {
        chronoEF: 124,
        societe: "Company B",
        compteReference: 457,
        filiationReference: 790,
        comptePointeOld: 112,
        filiationPointeOld: 223,
        comptePointeNew: 334,
        filiationPointeNew: 445,
        typeEF: "SEPARATION",
        nom: "Smith",
        prenom: "Jane"
      }
    ]

    mockStore.historyEntries = mockEntries
    mockStore.formatFullName.mockImplementation((nom: string, prenom: string) => `${prenom} ${nom}`)

    render(<FusionSeparationHistoryPage />)

    expect(screen.getByText("Recent History Entries (2)")).toBeInTheDocument()
    
    const companyAElements = screen.getAllByText(/Company A/i)
    expect(companyAElements.length).toBeGreaterThan(0)
    
    const companyBElements = screen.getAllByText(/Company B/i)
    expect(companyBElements.length).toBeGreaterThan(0)
  })

  it("displays no entries message when list is empty", () => {
    mockStore.historyEntries = []
    render(<FusionSeparationHistoryPage />)
    
    expect(screen.getByText("No history entries found")).toBeInTheDocument()
  })

  it("clears validation error when input changes", async () => {
    render(<FusionSeparationHistoryPage />)
    
    const submitButton = screen.getByText("Write History Entry")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/chrono ef is required/i)).toBeInTheDocument()
    })

    const chronoInput = screen.getByLabelText(/chrono ef/i)
    fireEvent.change(chronoInput, { target: { value: "123" } })

    expect(screen.queryByText(/chrono ef is required/i)).not.toBeInTheDocument()
  })

  it("calls reset on unmount", () => {
    const { unmount } = render(<FusionSeparationHistoryPage />)
    
    unmount()
    
    expect(mockStore.reset).toHaveBeenCalled()
  })
})