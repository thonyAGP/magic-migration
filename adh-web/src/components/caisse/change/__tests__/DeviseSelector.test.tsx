// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeviseSelector } from '../DeviseSelector';
import type { Devise } from '@/types/change';

const mockDevises: Devise[] = [
  { code: 'USD', libelle: 'Dollar US', symbole: '$', tauxActuel: 1.0856, nbDecimales: 2 },
  { code: 'GBP', libelle: 'Livre Sterling', symbole: '\u00a3', tauxActuel: 0.8534, nbDecimales: 2 },
  { code: 'CHF', libelle: 'Franc Suisse', symbole: 'CHF', tauxActuel: 0.9412, nbDecimales: 2 },
];

describe('DeviseSelector', () => {
  it('should render devises list', () => {
    render(
      <DeviseSelector
        devises={mockDevises}
        selected={null}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('GBP')).toBeInTheDocument();
    expect(screen.getByText('CHF')).toBeInTheDocument();
  });

  it('should filter devises by search', () => {
    render(
      <DeviseSelector
        devises={mockDevises}
        selected={null}
        onSelect={vi.fn()}
      />,
    );
    const input = screen.getByPlaceholderText('Rechercher devise...');
    fireEvent.change(input, { target: { value: 'dollar' } });
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.queryByText('GBP')).not.toBeInTheDocument();
    expect(screen.queryByText('CHF')).not.toBeInTheDocument();
  });

  it('should call onSelect when devise clicked', () => {
    const onSelect = vi.fn();
    render(
      <DeviseSelector
        devises={mockDevises}
        selected={null}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText('USD'));
    expect(onSelect).toHaveBeenCalledWith('USD');
  });

  it('should show empty state when no match', () => {
    render(
      <DeviseSelector
        devises={mockDevises}
        selected={null}
        onSelect={vi.fn()}
      />,
    );
    const input = screen.getByPlaceholderText('Rechercher devise...');
    fireEvent.change(input, { target: { value: 'xyz' } });
    expect(screen.getByText('Aucune devise trouvee')).toBeInTheDocument();
  });

  it('should highlight selected devise', () => {
    const { container } = render(
      <DeviseSelector
        devises={mockDevises}
        selected="USD"
        onSelect={vi.fn()}
      />,
    );
    const selected = container.querySelector('[class*="bg-primary"]');
    expect(selected).toBeInTheDocument();
  });
});
