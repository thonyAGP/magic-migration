import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DenominationRow } from '../DenominationRow';
import type { DenominationCatalog } from '@/types/denomination';

const billetDenom: DenominationCatalog = {
  id: 1,
  deviseCode: 'EUR',
  valeur: 50,
  type: 'billet',
  libelle: '50 EUR',
  ordre: 1,
};

const pieceDenom: DenominationCatalog = {
  id: 3,
  deviseCode: 'EUR',
  valeur: 2,
  type: 'piece',
  libelle: '2 EUR',
  ordre: 5,
};

describe('DenominationRow', () => {
  it('should render denomination label and value', () => {
    const onChange = vi.fn();
    render(
      <DenominationRow denomination={billetDenom} count={0} onChange={onChange} />,
    );

    expect(screen.getByText('50 EUR')).toBeInTheDocument();
  });

  it('should render billet denomination with banknote icon', () => {
    const onChange = vi.fn();
    const { container } = render(
      <DenominationRow denomination={billetDenom} count={0} onChange={onChange} />,
    );

    // Banknote icon should be present (Lucide renders SVG)
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThanOrEqual(1);
  });

  it('should render piece denomination', () => {
    const onChange = vi.fn();
    render(
      <DenominationRow denomination={pieceDenom} count={0} onChange={onChange} />,
    );

    expect(screen.getByText('2 EUR')).toBeInTheDocument();
  });

  it('should display input with correct count value', () => {
    const onChange = vi.fn();
    render(
      <DenominationRow denomination={billetDenom} count={3} onChange={onChange} />,
    );

    const input = screen.getByRole('spinbutton', { name: /quantite 50 eur/i });
    expect(input).toHaveValue(3);
  });

  it('should call onChange with incremented value when plus button is clicked', () => {
    const onChange = vi.fn();
    render(
      <DenominationRow denomination={billetDenom} count={2} onChange={onChange} />,
    );

    const plusBtn = screen.getByRole('button', { name: /ajouter un 50 eur/i });
    fireEvent.click(plusBtn);

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('should call onChange with decremented value when minus button is clicked', () => {
    const onChange = vi.fn();
    render(
      <DenominationRow denomination={billetDenom} count={5} onChange={onChange} />,
    );

    const minusBtn = screen.getByRole('button', { name: /retirer un 50 eur/i });
    fireEvent.click(minusBtn);

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('should disable minus button when count is zero', () => {
    const onChange = vi.fn();
    render(
      <DenominationRow denomination={billetDenom} count={0} onChange={onChange} />,
    );

    const minusBtn = screen.getByRole('button', { name: /retirer un 50 eur/i });
    expect(minusBtn).toBeDisabled();
  });

  it('should call onChange with parsed value when input changes', () => {
    const onChange = vi.fn();
    render(
      <DenominationRow denomination={billetDenom} count={0} onChange={onChange} />,
    );

    const input = screen.getByRole('spinbutton', { name: /quantite 50 eur/i });
    fireEvent.change(input, { target: { value: '7' } });

    expect(onChange).toHaveBeenCalledWith(7);
  });

  it('should clamp negative input to zero', () => {
    const onChange = vi.fn();
    render(
      <DenominationRow denomination={billetDenom} count={0} onChange={onChange} />,
    );

    const input = screen.getByRole('spinbutton', { name: /quantite 50 eur/i });
    fireEvent.change(input, { target: { value: '-5' } });

    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('should highlight row when count is greater than zero', () => {
    const onChange = vi.fn();
    const { container } = render(
      <DenominationRow denomination={billetDenom} count={3} onChange={onChange} />,
    );

    const row = container.firstChild as HTMLElement;
    expect(row.className).toContain('bg-primary/5');
  });

  it('should not highlight row when count is zero', () => {
    const onChange = vi.fn();
    const { container } = render(
      <DenominationRow denomination={billetDenom} count={0} onChange={onChange} />,
    );

    const row = container.firstChild as HTMLElement;
    expect(row.className).toContain('bg-surface');
  });

  it('should disable all controls when readOnly is true', () => {
    const onChange = vi.fn();
    render(
      <DenominationRow
        denomination={billetDenom}
        count={3}
        onChange={onChange}
        readOnly
      />,
    );

    const input = screen.getByRole('spinbutton', { name: /quantite 50 eur/i });
    const plusBtn = screen.getByRole('button', { name: /ajouter un 50 eur/i });

    expect(input).toBeDisabled();
    expect(plusBtn).toBeDisabled();
  });

  it('should display calculated total for current count', () => {
    const onChange = vi.fn();
    render(
      <DenominationRow denomination={billetDenom} count={4} onChange={onChange} />,
    );

    // 4 * 50 EUR = 200 EUR formatted in fr-FR
    expect(screen.getByText(/200,00/)).toBeInTheDocument();
  });
});
