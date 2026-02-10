// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FactureSearchPanel } from '../FactureSearchPanel';
import type { Facture } from '@/types/facture';

const mockFactures: Facture[] = [
  {
    id: 1,
    reference: 'FAC-2026-001',
    societe: 'SOC1',
    codeAdherent: 1234,
    filiation: 1,
    nomAdherent: 'Jean Dupont',
    type: 'facture',
    statut: 'emise',
    dateEmission: '2026-02-10',
    dateEcheance: null,
    lignes: [],
    totalHT: 100,
    totalTVA: 20,
    totalTTC: 120,
    devise: 'EUR',
    commentaire: '',
    operateur: 'OP1',
  },
];

const mockSearch = vi.fn();

vi.mock('@/services/api/endpoints-lot4', () => ({
  factureApi: {
    search: (...args: unknown[]) => mockSearch(...args),
  },
}));

describe('FactureSearchPanel', () => {
  beforeEach(() => {
    mockSearch.mockReset();
    mockSearch.mockResolvedValue({
      data: { data: { factures: [], total: 0 } },
    });
  });

  it('should render search input', () => {
    render(<FactureSearchPanel onSelectFacture={vi.fn()} />);
    expect(
      screen.getByPlaceholderText('Rechercher par reference ou adherent...'),
    ).toBeInTheDocument();
  });

  it('should render date filter inputs', () => {
    render(<FactureSearchPanel onSelectFacture={vi.fn()} />);
    expect(screen.getByText('Debut')).toBeInTheDocument();
    expect(screen.getByText('Fin')).toBeInTheDocument();
  });

  it('should show empty results message after search', async () => {
    render(<FactureSearchPanel onSelectFacture={vi.fn()} />);

    fireEvent.change(
      screen.getByPlaceholderText('Rechercher par reference ou adherent...'),
      { target: { value: 'inexistant' } },
    );

    await waitFor(
      () => {
        expect(screen.getByText('Aucune facture trouvee')).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('should display search results', async () => {
    mockSearch.mockResolvedValue({
      data: { data: { factures: mockFactures, total: 1 } },
    });

    render(<FactureSearchPanel onSelectFacture={vi.fn()} />);

    fireEvent.change(
      screen.getByPlaceholderText('Rechercher par reference ou adherent...'),
      { target: { value: 'FAC' } },
    );

    await waitFor(
      () => {
        expect(screen.getByText('FAC-2026-001')).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('should call onSelectFacture on click', async () => {
    mockSearch.mockResolvedValue({
      data: { data: { factures: mockFactures, total: 1 } },
    });

    const onSelect = vi.fn();
    render(<FactureSearchPanel onSelectFacture={onSelect} />);

    fireEvent.change(
      screen.getByPlaceholderText('Rechercher par reference ou adherent...'),
      { target: { value: 'FAC' } },
    );

    await waitFor(
      () => {
        expect(screen.getByText('FAC-2026-001')).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    fireEvent.click(screen.getByText('FAC-2026-001'));
    expect(onSelect).toHaveBeenCalledWith(mockFactures[0]);
  });
});
