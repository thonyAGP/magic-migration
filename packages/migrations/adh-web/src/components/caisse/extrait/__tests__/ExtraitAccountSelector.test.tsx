// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ExtraitAccountSelector } from '../ExtraitAccountSelector';
import type { ExtraitAccountInfo } from '@/types/extrait';

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
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render search input', () => {
    render(
      <ExtraitAccountSelector
        onSelect={vi.fn()}
        onSearch={vi.fn()}
      />,
    );

    expect(screen.getByPlaceholderText('Rechercher par code ou nom...')).toBeDefined();
  });

  it('should disable input when disabled prop is true', () => {
    render(
      <ExtraitAccountSelector
        onSelect={vi.fn()}
        onSearch={vi.fn()}
        disabled
      />,
    );

    const input = screen.getByPlaceholderText('Rechercher par code ou nom...');
    expect(input).toHaveProperty('disabled', true);
  });

  it('should show loading state', () => {
    render(
      <ExtraitAccountSelector
        onSelect={vi.fn()}
        onSearch={vi.fn()}
        isLoading
      />,
    );

    expect(screen.getByPlaceholderText('Rechercher par code ou nom...')).toBeDefined();
  });

  it('should call onSearch and display results', async () => {
    const onSearch = vi.fn();
    const onSelect = vi.fn();

    render(
      <ExtraitAccountSelector
        onSelect={onSelect}
        onSearch={onSearch}
        searchResults={mockAccounts}
      />,
    );

    const input = screen.getByPlaceholderText('Rechercher par code ou nom...');
    await act(() => {
      fireEvent.change(input, { target: { value: 'Dupont' } });
    });

    await act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(onSearch).toHaveBeenCalledWith('Dupont');
    expect(screen.getByText('Dupont Jean')).toBeDefined();

    fireEvent.click(screen.getByText('Dupont Jean'));
    expect(onSelect).toHaveBeenCalledWith(mockAccounts[0]);
  });

  it('should show "Aucun compte" when no results', async () => {
    const onSearch = vi.fn();

    render(
      <ExtraitAccountSelector
        onSelect={vi.fn()}
        onSearch={onSearch}
        searchResults={[]}
      />,
    );

    const input = screen.getByPlaceholderText('Rechercher par code ou nom...');
    await act(() => {
      fireEvent.change(input, { target: { value: 'zzz' } });
    });

    await act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByText('Aucun compte trouve')).toBeDefined();
  });
});
