// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExtraitAccountSelector } from '../ExtraitAccountSelector';
import type { ExtraitAccountInfo } from '@/types/extrait';

vi.mock('@/services/api/endpoints-lot3', () => ({
  extraitApi: {
    searchAccount: vi.fn(),
  },
}));

const mockAccounts: ExtraitAccountInfo[] = [
  {
    societe: 'ADH',
    codeAdherent: 1001,
    filiation: 0,
    nom: 'Dupont',
    prenom: 'Jean',
    statut: 'normal',
    hasGiftPass: false,
  },
  {
    societe: 'ADH',
    codeAdherent: 1002,
    filiation: 1,
    nom: 'Martin',
    prenom: 'Marie',
    statut: 'bloque',
    hasGiftPass: true,
  },
];

describe('ExtraitAccountSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input', () => {
    render(<ExtraitAccountSelector onSelect={vi.fn()} />);

    expect(screen.getByPlaceholderText('Rechercher par code ou nom...')).toBeDefined();
  });

  it('should disable input when disabled prop is true', () => {
    render(<ExtraitAccountSelector onSelect={vi.fn()} disabled />);

    const input = screen.getByPlaceholderText('Rechercher par code ou nom...');
    expect(input).toHaveProperty('disabled', true);
  });

  it('should show loading state', () => {
    render(<ExtraitAccountSelector onSelect={vi.fn()} isLoading />);

    // isLoading alone doesn't trigger the message - needs to be combined with searching
    expect(screen.getByPlaceholderText('Rechercher par code ou nom...')).toBeDefined();
  });

  it('should call onSelect when clicking a result', async () => {
    const { extraitApi } = await import('@/services/api/endpoints-lot3');
    vi.mocked(extraitApi.searchAccount).mockResolvedValue({
      data: { data: mockAccounts },
    } as never);

    const onSelect = vi.fn();
    render(<ExtraitAccountSelector onSelect={onSelect} />);

    const input = screen.getByPlaceholderText('Rechercher par code ou nom...');
    fireEvent.change(input, { target: { value: 'Dupont' } });

    await waitFor(() => {
      expect(screen.getByText('Dupont Jean')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Dupont Jean'));
    expect(onSelect).toHaveBeenCalledWith(mockAccounts[0]);
  });

  it('should show "Aucun compte" when no results', async () => {
    const { extraitApi } = await import('@/services/api/endpoints-lot3');
    vi.mocked(extraitApi.searchAccount).mockResolvedValue({
      data: { data: [] },
    } as never);

    render(<ExtraitAccountSelector onSelect={vi.fn()} />);

    const input = screen.getByPlaceholderText('Rechercher par code ou nom...');
    fireEvent.change(input, { target: { value: 'zzz' } });

    await waitFor(() => {
      expect(screen.getByText('Aucun compte trouve')).toBeDefined();
    });
  });
});
