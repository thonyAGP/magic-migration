// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FusionGarantieChoice } from '../FusionGarantieChoice';
import type { GarantieItem } from '@/types/fusion';

const garantiesSource: GarantieItem[] = [
  { id: 'g-src-1', article: 'Serviette plage', description: 'Serviette plage XL', montant: 25.00, dateDepot: '2026-01-15', compteOrigine: 'source' },
  { id: 'g-src-2', article: 'Casier vestiaire', description: 'Casier vestiaire B12', montant: 10.00, dateDepot: '2026-01-20', compteOrigine: 'source' },
];

const garantiesDestination: GarantieItem[] = [
  { id: 'g-dst-1', article: 'Planche surf', description: 'Planche surf 7ft', montant: 150.00, dateDepot: '2026-01-10', compteOrigine: 'destination' },
  { id: 'g-dst-2', article: 'Masque plongee', description: 'Masque plongee pro', montant: 35.00, dateDepot: '2026-01-12', compteOrigine: 'destination' },
];

describe('FusionGarantieChoice', () => {
  it('should render source and destination garanties', () => {
    render(
      <FusionGarantieChoice
        open={true}
        onClose={vi.fn()}
        garantiesSource={garantiesSource}
        garantiesDestination={garantiesDestination}
        onValidate={vi.fn()}
      />,
    );
    expect(screen.getByText('Serviette plage')).toBeInTheDocument();
    expect(screen.getByText('Casier vestiaire')).toBeInTheDocument();
    expect(screen.getByText('Planche surf')).toBeInTheDocument();
    expect(screen.getByText('Masque plongee')).toBeInTheDocument();
  });

  it('should have destination garanties checked by default', () => {
    render(
      <FusionGarantieChoice
        open={true}
        onClose={vi.fn()}
        garantiesSource={garantiesSource}
        garantiesDestination={garantiesDestination}
        onValidate={vi.fn()}
      />,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    // src1, src2, dst1, dst2 -> dst1 and dst2 should be checked
    expect(checkboxes[0]).not.toBeChecked(); // source 1
    expect(checkboxes[1]).not.toBeChecked(); // source 2
    expect(checkboxes[2]).toBeChecked(); // destination 1
    expect(checkboxes[3]).toBeChecked(); // destination 2
  });

  it('should toggle checkboxes on click', () => {
    render(
      <FusionGarantieChoice
        open={true}
        onClose={vi.fn()}
        garantiesSource={garantiesSource}
        garantiesDestination={garantiesDestination}
        onValidate={vi.fn()}
      />,
    );
    const checkboxes = screen.getAllByRole('checkbox');

    // Toggle source 1 on
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();

    // Toggle destination 1 off
    fireEvent.click(checkboxes[2]);
    expect(checkboxes[2]).not.toBeChecked();
  });

  it('should display total of selected garanties', () => {
    render(
      <FusionGarantieChoice
        open={true}
        onClose={vi.fn()}
        garantiesSource={garantiesSource}
        garantiesDestination={garantiesDestination}
        onValidate={vi.fn()}
      />,
    );
    // Default: dst1 (150) + dst2 (35) = 185.00
    expect(screen.getByText('185.00 EUR')).toBeInTheDocument();
  });

  it('should update total when toggling', () => {
    render(
      <FusionGarantieChoice
        open={true}
        onClose={vi.fn()}
        garantiesSource={garantiesSource}
        garantiesDestination={garantiesDestination}
        onValidate={vi.fn()}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    // Add source 1 (25) -> 185 + 25 = 210
    fireEvent.click(checkboxes[0]);
    expect(screen.getByText('210.00 EUR')).toBeInTheDocument();
  });

  it('should call onValidate with selected ids', () => {
    const onValidate = vi.fn();
    render(
      <FusionGarantieChoice
        open={true}
        onClose={vi.fn()}
        garantiesSource={garantiesSource}
        garantiesDestination={garantiesDestination}
        onValidate={onValidate}
      />,
    );

    fireEvent.click(screen.getByText('Valider selection'));
    expect(onValidate).toHaveBeenCalledOnce();
    const ids = onValidate.mock.calls[0][0] as string[];
    expect(ids).toContain('g-dst-1');
    expect(ids).toContain('g-dst-2');
    expect(ids).not.toContain('g-src-1');
    expect(ids).not.toContain('g-src-2');
  });

  it('should not render when closed', () => {
    render(
      <FusionGarantieChoice
        open={false}
        onClose={vi.fn()}
        garantiesSource={garantiesSource}
        garantiesDestination={garantiesDestination}
        onValidate={vi.fn()}
      />,
    );
    expect(screen.queryByText('Choix des garanties a conserver')).not.toBeInTheDocument();
  });

  it('should show empty message when no garanties', () => {
    render(
      <FusionGarantieChoice
        open={true}
        onClose={vi.fn()}
        garantiesSource={[]}
        garantiesDestination={garantiesDestination}
        onValidate={vi.fn()}
      />,
    );
    expect(screen.getByText('Aucune garantie')).toBeInTheDocument();
  });
});
