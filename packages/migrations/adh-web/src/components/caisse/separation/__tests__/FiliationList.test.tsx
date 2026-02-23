// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FiliationList } from '../FiliationList';
import type { Filiation } from '../types';

const mockFiliations: Filiation[] = [
  { id: 'fil-1', nom: 'Dupont', prenom: 'Sophie', typeRelation: 'conjoint', compteId: '1001-1' },
  { id: 'fil-2', nom: 'Dupont', prenom: 'Lucas', typeRelation: 'enfant', compteId: '1001-2' },
  { id: 'fil-3', nom: 'Dupont', prenom: 'Pierre', typeRelation: 'parent', compteId: '1001-3' },
];

describe('FiliationList', () => {
  it('should render nothing when filiations is empty', () => {
    const { container } = render(
      <FiliationList accountId="1001" filiations={[]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render 1 filiation', () => {
    render(
      <FiliationList accountId="1001" filiations={[mockFiliations[0]]} />,
    );
    expect(screen.getByText('Filiations (1)')).toBeDefined();
    expect(screen.getByText('Dupont Sophie')).toBeDefined();
    expect(screen.getByText('Conjoint')).toBeDefined();
  });

  it('should render 3 filiations with correct count', () => {
    render(
      <FiliationList accountId="1001" filiations={mockFiliations} />,
    );
    expect(screen.getByText('Filiations (3)')).toBeDefined();
    expect(screen.getByText('Dupont Sophie')).toBeDefined();
    expect(screen.getByText('Dupont Lucas')).toBeDefined();
    expect(screen.getByText('Dupont Pierre')).toBeDefined();
  });

  it('should display relation badges', () => {
    render(
      <FiliationList accountId="1001" filiations={mockFiliations} />,
    );
    expect(screen.getByText('Conjoint')).toBeDefined();
    expect(screen.getByText('Enfant')).toBeDefined();
    expect(screen.getByText('Parent')).toBeDefined();
  });

  it('should call onSelectFiliation on click', () => {
    const onSelect = vi.fn();
    render(
      <FiliationList
        accountId="1001"
        filiations={mockFiliations}
        onSelectFiliation={onSelect}
      />,
    );
    fireEvent.click(screen.getByText('Dupont Sophie'));
    expect(onSelect).toHaveBeenCalledWith('fil-1');
  });

  it('should not call callback when onSelectFiliation is not provided', () => {
    render(
      <FiliationList accountId="1001" filiations={mockFiliations} />,
    );
    // Buttons should be disabled (not clickable)
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveProperty('disabled', true);
  });
});
