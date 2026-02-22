import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/stores/gestionCaisseStore", () => ({
  useGestionCaisseStore: vi.fn(),
}));

import { GestionCaissePage } from "@/pages/GestionCaissePage";
import { useGestionCaisseStore } from "@/stores/gestionCaisseStore";

describe("GestionCaissePage", () => {
  const mockStore = {
    isLoading: false,
    error: null,
    session: {
      operateur: { nom: "Jean Dupont", code: "JD001" },
      dateComptable: "2026-02-22",
      statut: "OUVERTE" as const,
      montantOuverture: 500.0,
      montantActuel: 1250.5,
      montantFermeture: null,
      ecart: 0,
    },
    mouvements: [
      {
        id: "1",
        type: "VENTE",
        montant: 150.5,
        devise: "EUR",
        timestamp: "2026-02-22T10:30:00Z",
        description: "Vente produit",
      },
      {
        id: "2",
        type: "APPORT",
        montant: 600.0,
        devise: "EUR",
        timestamp: "2026-02-22T09:00:00Z",
        description: "Apport coffre",
      },
    ],
    alertes: {
      sessionsConcurrentes: [],
      integriteCoffre: true,
    },
    ouvrirSession: vi.fn(),
    fermerSession: vi.fn(),
    apportCoffre: vi.fn(),
    apportProduit: vi.fn(),
    remiseCoffre: vi.fn(),
    loadSession: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGestionCaisseStore).mockReturnValue(mockStore);
  });

  it("renders without crashing", () => {
    render(<GestionCaissePage />);
    expect(screen.getByText(/gestion de caisse/i)).toBeInTheDocument();
  });

  it("displays loading state", () => {
    vi.mocked(useGestionCaisseStore).mockReturnValue({
      ...mockStore,
      isLoading: true,
      session: null,
    });

    render(<GestionCaissePage />);
    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it("displays session data when loaded", () => {
    render(<GestionCaissePage />);

    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    expect(screen.getByText("2026-02-22")).toBeInTheDocument();
    expect(screen.getByText(/ouverte/i)).toBeInTheDocument();
    expect(screen.getByText(/500\.00/)).toBeInTheDocument();
    expect(screen.getByText(/1250\.50/)).toBeInTheDocument();
  });

  it("displays mouvements grid", () => {
    render(<GestionCaissePage />);

    expect(screen.getByText("Vente produit")).toBeInTheDocument();
    expect(screen.getByText("Apport coffre")).toBeInTheDocument();
    expect(screen.getByText(/150\.50/)).toBeInTheDocument();
    expect(screen.getByText(/600\.00/)).toBeInTheDocument();
  });

  it("handles apport coffre action", async () => {
    render(<GestionCaissePage />);

    const apportBtn = screen.getByRole("button", { name: /apport coffre/i });
    fireEvent.click(apportBtn);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const montantInput = screen.getByLabelText(/montant/i);
    fireEvent.change(montantInput, { target: { value: "200" } });

    const confirmBtn = screen.getByRole("button", { name: /confirmer/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockStore.apportCoffre).toHaveBeenCalledWith(
        expect.objectContaining({ montant: 200 })
      );
    });
  });

  it("handles fermer session action", async () => {
    render(<GestionCaissePage />);

    const fermerBtn = screen.getByRole("button", { name: /fermer session/i });
    fireEvent.click(fermerBtn);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const confirmBtn = screen.getByRole("button", { name: /confirmer/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockStore.fermerSession).toHaveBeenCalled();
    });
  });

  it("displays error state", () => {
    vi.mocked(useGestionCaisseStore).mockReturnValue({
      ...mockStore,
      error: "Erreur de chargement",
    });

    render(<GestionCaissePage />);
    expect(screen.getByText(/erreur de chargement/i)).toBeInTheDocument();
  });

  it("displays alertes when sessions concurrentes present", () => {
    vi.mocked(useGestionCaisseStore).mockReturnValue({
      ...mockStore,
      alertes: {
        sessionsConcurrentes: [
          { operateur: "Marie Martin", dateOuverture: "2026-02-22T08:00:00Z" },
        ],
        integriteCoffre: true,
      },
    });

    render(<GestionCaissePage />);
    expect(
      screen.getByText(/session concurrente détectée/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Marie Martin")).toBeInTheDocument();
  });

  it("displays integrite coffre warning when false", () => {
    vi.mocked(useGestionCaisseStore).mockReturnValue({
      ...mockStore,
      alertes: {
        sessionsConcurrentes: [],
        integriteCoffre: false,
      },
    });

    render(<GestionCaissePage />);
    expect(
      screen.getByText(/problème d'intégrité coffre/i)
    ).toBeInTheDocument();
  });

  it("loads session on mount", () => {
    render(<GestionCaissePage />);
    expect(mockStore.loadSession).toHaveBeenCalled();
  });

  it("disables actions when session not opened", () => {
    vi.mocked(useGestionCaisseStore).mockReturnValue({
      ...mockStore,
      session: {
        ...mockStore.session,
        statut: "FERMEE" as const,
      },
    });

    render(<GestionCaissePage />);

    const apportBtn = screen.getByRole("button", { name: /apport coffre/i });
    expect(apportBtn).toBeDisabled();
  });

  it("displays ecart when session closed", () => {
    vi.mocked(useGestionCaisseStore).mockReturnValue({
      ...mockStore,
      session: {
        ...mockStore.session,
        statut: "FERMEE" as const,
        montantFermeture: 1250.0,
        ecart: -0.5,
      },
    });

    render(<GestionCaissePage />);
    expect(screen.getByText(/écart/i)).toBeInTheDocument();
    expect(screen.getByText(/-0\.50/)).toBeInTheDocument();
  });
});