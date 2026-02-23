// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PassAffiliateSelector } from '../PassAffiliateSelector';
import type { Affiliate } from '@/types/clubmedpass';

const mockAffiliates: Affiliate[] = [
  { id: 'aff-1', nom: 'Dupont', prenom: 'Marie', dateNaissance: '1985-03-15', lienParente: 'conjoint', isActive: true },
  { id: 'aff-2', nom: 'Dupont', prenom: 'Lucas', dateNaissance: '2012-07-22', lienParente: 'enfant', isActive: false },
];

describe('PassAffiliateSelector', () => {
  const onAdd = vi.fn();
  const onRemove = vi.fn();
  const onToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state with 0 affiliates', () => {
    render(
      <PassAffiliateSelector
        passId="1"
        affiliates={[]}
        onAdd={onAdd}
        onRemove={onRemove}
        onToggle={onToggle}
      />,
    );

    expect(screen.getByText('Aucun affilie enregistre')).toBeDefined();
    expect(screen.getByText('Affilies (0)')).toBeDefined();
  });

  it('should render list of 2 affiliates', () => {
    render(
      <PassAffiliateSelector
        passId="1"
        affiliates={mockAffiliates}
        onAdd={onAdd}
        onRemove={onRemove}
        onToggle={onToggle}
      />,
    );

    expect(screen.getByText('Affilies (2)')).toBeDefined();
    expect(screen.getByText('Marie Dupont')).toBeDefined();
    expect(screen.getByText('Lucas Dupont')).toBeDefined();
    expect(screen.getByText('Conjoint')).toBeDefined();
    expect(screen.getByText('Enfant')).toBeDefined();
  });

  it('should add an affiliate via form', () => {
    render(
      <PassAffiliateSelector
        passId="1"
        affiliates={[]}
        onAdd={onAdd}
        onRemove={onRemove}
        onToggle={onToggle}
      />,
    );

    // Open form
    fireEvent.click(screen.getByText('Ajouter'));

    // Fill in fields
    fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Martin' } });
    fireEvent.change(screen.getByLabelText('Prenom'), { target: { value: 'Sophie' } });

    // Submit
    fireEvent.click(screen.getByText('Ajouter'));

    expect(onAdd).toHaveBeenCalledWith({
      nom: 'Martin',
      prenom: 'Sophie',
      dateNaissance: '',
      lienParente: 'conjoint',
    });
  });

  it('should show validation error when name/prenom missing', () => {
    render(
      <PassAffiliateSelector
        passId="1"
        affiliates={[]}
        onAdd={onAdd}
        onRemove={onRemove}
        onToggle={onToggle}
      />,
    );

    // Open form
    fireEvent.click(screen.getByText('Ajouter'));
    // Submit without filling
    fireEvent.click(screen.getByText('Ajouter'));

    expect(screen.getByText('Nom et prenom sont requis')).toBeDefined();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('should toggle affiliate active/inactive', () => {
    render(
      <PassAffiliateSelector
        passId="1"
        affiliates={mockAffiliates}
        onAdd={onAdd}
        onRemove={onRemove}
        onToggle={onToggle}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(onToggle).toHaveBeenCalledWith('aff-1', false);
  });

  it('should remove an affiliate', () => {
    render(
      <PassAffiliateSelector
        passId="1"
        affiliates={mockAffiliates}
        onAdd={onAdd}
        onRemove={onRemove}
        onToggle={onToggle}
      />,
    );

    const deleteButtons = screen.getAllByLabelText(/Supprimer/);
    fireEvent.click(deleteButtons[0]);

    expect(onRemove).toHaveBeenCalledWith('aff-1');
  });

  it('should show loading state', () => {
    const { container } = render(
      <PassAffiliateSelector
        passId="1"
        affiliates={[]}
        onAdd={onAdd}
        onRemove={onRemove}
        onToggle={onToggle}
        isLoading
      />,
    );

    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });
});
