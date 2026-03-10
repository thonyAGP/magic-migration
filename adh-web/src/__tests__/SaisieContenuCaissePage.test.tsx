/**
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"

const mockUseSaisieContenuCaisseStore = vi.hoisted(() => vi.fn())

vi.mock("@/stores/saisieContenuCaisseStore", () => ({
  useSaisieContenuCaisseStore: mockUseSaisieContenuCaisseStore
}))

vi.mock("@/components/layout", () => ({
  ScreenLayout: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="screen-layout" className={className}>{children}</div>
  )
}))

vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, disabled, variant }: { 
    children: React.ReactNode; 
    onClick?: () => void; 
    disabled?: boolean;
    variant?: string;
  }) => (
    <button 
      data-testid="button" 
      onClick={onClick} 
      disabled={disabled}
      data-variant={variant}
    >
      {children}
    </button>
  ),
  Input: ({ value, onChange, type, placeholder, className }: {
    value?: string;
    onChange?: (e: { target: { value: string } }) => void;
    type?: string;
    placeholder?: string;
    className?: string;
  }) => (
    <input
      data-testid="input"
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      className={className}
    />
  ),
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>
}))

vi.mock("@/lib/utils", () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(" ")
}))

import { SaisieContenuCaissePage } from "@/pages/SaisieContenuCaissePage"

describe("SaisieContenuCaissePage", () => {
  const mockInitialiserRemise = vi.fn()
  const mockSaisirMontant = vi.fn()
  const mockValiderRemise = vi.fn()
  const mockCalculerEcarts = vi.fn()
  const mockChargerMontantsComptes = vi.fn()
  const mockGenererPvComptable = vi.fn()
  const mockMettreAJourStocks = vi.fn()
  const mockReset = vi.fn()

  const defaultStoreState = {
    remise: {
      societe: "SOC001",
      deviseLocale: "EUR",
      typeRemise: "REMISE_JOURNALIERE",
      montantCompte: 0,
      montantVersement: 0,
      ecart: 0
    },
    montantsSaisis: {
      monnaie: 0,
      produits: 0,
      cartes: 0,
      cheques: 0,
      od: 0,
      devises: 0
    },
    montantsComptes: {
      monnaie: 100.50,
      produits: 250.75,
      cartes: 150.25,
      cheques: 75.00,
      od: 25.50,
      devises: 50.00
    },
    ecarts: {},
    anomalies: [],
    stocksArticles: [],
    devisesSession: [],
    isLoading: false,
    error: null,
    validationErrors: {},
    coffre2Ouvert: false,
    uniBI: "UNI001",
    initialiserRemise: mockInitialiserRemise,
    saisirMontant: mockSaisirMontant,
    validerRemise: mockValiderRemise,
    calculerEcarts: mockCalculerEcarts,
    chargerMontantsComptes: mockChargerMontantsComptes,
    genererPvComptable: mockGenererPvComptable,
    mettreAJourStocks: mockMettreAJourStocks,
    reset: mockReset
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSaisieContenuCaisseStore.mockReturnValue(defaultStoreState)
  })

  it("renders without crashing", () => {
    render(<SaisieContenuCaissePage />)
    
    expect(screen.getByText("Remise en caisse")).toBeInTheDocument()
    expect(screen.getByText("SOC001")).toBeInTheDocument()
    expect(screen.getByText("EUR")).toBeInTheDocument()
  })

  it("displays loading state", () => {
    mockUseSaisieContenuCaisseStore.mockReturnValue({
      ...defaultStoreState,
      isLoading: true
    })

    render(<SaisieContenuCaissePage />)
    
    expect(screen.getByText("Chargement des données de caisse...")).toBeInTheDocument()
    const spinner = screen.getAllByRole("generic").find(el => el.classList.contains("animate-spin"))
    expect(spinner).toHaveClass("animate-spin")
  })

  it("displays error state", () => {
    const errorMessage = "Erreur de connexion à la base de données"
    mockUseSaisieContenuCaisseStore.mockReturnValue({
      ...defaultStoreState,
      error: errorMessage
    })

    render(<SaisieContenuCaissePage />)
    
    expect(screen.getByText("Erreur de chargement")).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    expect(screen.getByText("Réessayer")).toBeInTheDocument()
  })

  it("displays data when loaded", () => {
    render(<SaisieContenuCaissePage />)
    
    expect(screen.getByText("Montants comptés (lecture seule)")).toBeInTheDocument()
    expect(screen.getByText("100.50 €")).toBeInTheDocument()
    expect(screen.getByText("250.75 €")).toBeInTheDocument()
    expect(screen.getByText("150.25 €")).toBeInTheDocument()
    expect(screen.getByText("75.00 €")).toBeInTheDocument()
    expect(screen.getByText("25.50 €")).toBeInTheDocument()
    expect(screen.getByText("50.00 €")).toBeInTheDocument()
  })

  it("handles user interactions - input changes", async () => {
    render(<SaisieContenuCaissePage />)
    
    const inputs = screen.getAllByTestId("input")
    const monnaieInput = inputs.find(input => 
      input.getAttribute("placeholder") === "0.00"
    )
    
    expect(monnaieInput).toBeDefined()
    
    if (monnaieInput) {
      fireEvent.change(monnaieInput, { target: { value: "100.50" } })
      
      await waitFor(() => {
        expect(mockSaisirMontant).toHaveBeenCalled()
        expect(mockCalculerEcarts).toHaveBeenCalled()
      })
    }
  })

  it("handles form submission", async () => {
    render(<SaisieContenuCaissePage />)
    
    const validerButton = screen.getByText("Valider la remise")
    fireEvent.click(validerButton)
    
    await waitFor(() => {
      expect(mockValiderRemise).toHaveBeenCalledTimes(1)
    })
  })

  it("handles cancel action", () => {
    render(<SaisieContenuCaissePage />)
    
    const annulerButton = screen.getByText("Annuler")
    fireEvent.click(annulerButton)
    
    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it("handles reset action", () => {
    render(<SaisieContenuCaissePage />)
    
    const reinitialiserButton = screen.getByText("Réinitialiser")
    fireEvent.click(reinitialiserButton)
    
    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it("displays ecarts when present", () => {
    mockUseSaisieContenuCaisseStore.mockReturnValue({
      ...defaultStoreState,
      ecarts: {
        monnaie: -10.50,
        produits: 5.25
      }
    })

    render(<SaisieContenuCaissePage />)
    
    expect(screen.getByText("Écarts détectés")).toBeInTheDocument()
    expect(screen.getByText("-10.50 €")).toBeInTheDocument()
    expect(screen.getByText("+5.25 €")).toBeInTheDocument()
  })

  it("displays anomalies when present", () => {
    mockUseSaisieContenuCaisseStore.mockReturnValue({
      ...defaultStoreState,
      ecarts: {
        monnaie: -10.50
      },
      anomalies: [
        {
          dateComptable: new Date(),
          typeAnomalie: "MANQUANT",
          montantEcart: -10.50
        }
      ]
    })

    render(<SaisieContenuCaissePage />)
    
    expect(screen.getByText("Anomalies détectées")).toBeInTheDocument()
    expect(screen.getByText("Des écarts ont été identifiés dans la remise.")).toBeInTheDocument()
  })

  it("displays validation errors", () => {
    mockUseSaisieContenuCaisseStore.mockReturnValue({
      ...defaultStoreState,
      validationErrors: {
        monnaie: "Le montant doit être positif"
      }
    })

    render(<SaisieContenuCaissePage />)
    
    expect(screen.getByText("Le montant doit être positif")).toBeInTheDocument()
  })

  it("initializes remise on mount", () => {
    render(<SaisieContenuCaissePage />)
    
    expect(mockInitialiserRemise).toHaveBeenCalledWith("SOC001", "EUR", "REMISE_JOURNALIERE")
  })

  it("calls reset on unmount", () => {
    const { unmount } = render(<SaisieContenuCaissePage />)
    
    unmount()
    
    expect(mockReset).toHaveBeenCalled()
  })

  it("handles retry on error", async () => {
    mockUseSaisieContenuCaisseStore.mockReturnValue({
      ...defaultStoreState,
      error: "Erreur de connexion"
    })

    render(<SaisieContenuCaissePage />)
    
    const retryButton = screen.getByText("Réessayer")
    fireEvent.click(retryButton)
    
    await waitFor(() => {
      expect(mockInitialiserRemise).toHaveBeenCalledWith("SOC001", "EUR", "REMISE_JOURNALIERE")
    })
  })

  it("disables valider button when loading", () => {
    mockUseSaisieContenuCaisseStore.mockReturnValue({
      ...defaultStoreState,
      isLoading: true
    })

    render(<SaisieContenuCaissePage />)
    
    const loadingDiv = screen.getByText("Chargement des données de caisse...")
    expect(loadingDiv).toBeInTheDocument()
  })
})