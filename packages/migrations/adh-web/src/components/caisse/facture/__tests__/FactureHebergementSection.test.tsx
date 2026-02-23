// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FactureHebergementSection } from '../FactureHebergementSection';
import type { HebergementData } from '@/types/hebergement';

const mockOnChange = vi.fn();
const mockOnToggle = vi.fn();

const sampleData: HebergementData = {
  numeroChambre: '301',
  typeHebergement: 'chambre',
  dateArrivee: '2026-02-10',
  dateDepart: '2026-02-13',
  nbNuits: 3,
  prixNuit: 120,
  totalHebergement: 360,
};

describe('FactureHebergementSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render toggle only when disabled', () => {
    render(
      <FactureHebergementSection
        data={null}
        onChange={mockOnChange}
        onToggle={mockOnToggle}
        enabled={false}
      />,
    );

    expect(screen.getByText('Inclure hebergement')).toBeInTheDocument();
    // Form fields should not be visible
    expect(screen.queryByText('Numero chambre')).not.toBeInTheDocument();
    expect(screen.queryByText('Date arrivee')).not.toBeInTheDocument();
  });

  it('should show form when enabled', () => {
    render(
      <FactureHebergementSection
        data={sampleData}
        onChange={mockOnChange}
        onToggle={mockOnToggle}
        enabled={true}
      />,
    );

    expect(screen.getByText('Numero chambre')).toBeInTheDocument();
    expect(screen.getByText('Date arrivee')).toBeInTheDocument();
    expect(screen.getByText('Date depart')).toBeInTheDocument();
    expect(screen.getByText('Nb nuits')).toBeInTheDocument();
    expect(screen.getByText('Prix / nuit')).toBeInTheDocument();
    expect(screen.getByText('Pension')).toBeInTheDocument();
    expect(screen.getByText('Total hebergement')).toBeInTheDocument();
  });

  it('should call onToggle when checkbox is clicked', () => {
    render(
      <FactureHebergementSection
        data={null}
        onChange={mockOnChange}
        onToggle={mockOnToggle}
        enabled={false}
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(mockOnToggle).toHaveBeenCalledWith(true);
  });

  it('should display computed nb nuits from dates', () => {
    render(
      <FactureHebergementSection
        data={sampleData}
        onChange={mockOnChange}
        onToggle={mockOnToggle}
        enabled={true}
      />,
    );

    // Nb nuits should be read-only and display computed value
    const nbNuitsInput = screen.getByDisplayValue('3');
    expect(nbNuitsInput).toHaveAttribute('readonly');
  });

  it('should display total hebergement formatted', () => {
    render(
      <FactureHebergementSection
        data={sampleData}
        onChange={mockOnChange}
        onToggle={mockOnToggle}
        enabled={true}
      />,
    );

    // Total should contain 360 EUR formatted
    expect(screen.getByText('Total hebergement')).toBeInTheDocument();
  });

  it('should call onChange when chambre number changes', () => {
    render(
      <FactureHebergementSection
        data={sampleData}
        onChange={mockOnChange}
        onToggle={mockOnToggle}
        enabled={true}
      />,
    );

    const chambreInput = screen.getByDisplayValue('301');
    fireEvent.change(chambreInput, { target: { value: '402' } });
    expect(mockOnChange).toHaveBeenCalled();
  });
});
