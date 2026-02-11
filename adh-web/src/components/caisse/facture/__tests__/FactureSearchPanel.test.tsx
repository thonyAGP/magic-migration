// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

describe('FactureSearchPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render search input', () => {
    render(
      <FactureSearchPanel
        onSelectFacture={vi.fn()}
        onSearch={vi.fn()}
      />,
    );
    expect(
      screen.getByPlaceholderText('Rechercher par reference ou adherent...'),
    ).toBeDefined();
  });

  it('should render date filter inputs', () => {
    render(
      <FactureSearchPanel
        onSelectFacture={vi.fn()}
        onSearch={vi.fn()}
      />,
    );
    expect(screen.getByText('Debut')).toBeDefined();
    expect(screen.getByText('Fin')).toBeDefined();
  });

  it('should show empty results message after search', async () => {
    render(
      <FactureSearchPanel
        onSelectFacture={vi.fn()}
        onSearch={vi.fn()}
        searchResults={[]}
      />,
    );

    await act(() => {
      fireEvent.change(
        screen.getByPlaceholderText('Rechercher par reference ou adherent...'),
        { target: { value: 'inexistant' } },
      );
    });

    await act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByText('Aucune facture trouvee')).toBeDefined();
  });

  it('should display search results', async () => {
    const onSearch = vi.fn();

    render(
      <FactureSearchPanel
        onSelectFacture={vi.fn()}
        onSearch={onSearch}
        searchResults={mockFactures}
      />,
    );

    await act(() => {
      fireEvent.change(
        screen.getByPlaceholderText('Rechercher par reference ou adherent...'),
        { target: { value: 'FAC' } },
      );
    });

    await act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(onSearch).toHaveBeenCalled();
    expect(screen.getByText('FAC-2026-001')).toBeDefined();
  });

  it('should call onSelectFacture on click', async () => {
    const onSelect = vi.fn();

    render(
      <FactureSearchPanel
        onSelectFacture={onSelect}
        onSearch={vi.fn()}
        searchResults={mockFactures}
      />,
    );

    await act(() => {
      fireEvent.change(
        screen.getByPlaceholderText('Rechercher par reference ou adherent...'),
        { target: { value: 'FAC' } },
      );
    });

    await act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByText('FAC-2026-001')).toBeDefined();

    fireEvent.click(screen.getByText('FAC-2026-001'));
    expect(onSelect).toHaveBeenCalledWith(mockFactures[0]);
  });
});
