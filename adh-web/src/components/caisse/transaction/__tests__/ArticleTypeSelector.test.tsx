// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArticleTypeSelector } from '../ArticleTypeSelector';

describe('ArticleTypeSelector', () => {
  const defaultProps = {
    selected: 'default' as const,
    onSelect: vi.fn(),
    mode: 'GP' as const,
  };

  it('should render all article types for GP mode', () => {
    render(<ArticleTypeSelector {...defaultProps} />);

    expect(screen.getByText('Standard')).toBeDefined();
    expect(screen.getByText('VRL')).toBeDefined();
    expect(screen.getByText('VSL')).toBeDefined();
    expect(screen.getByText('Transfert')).toBeDefined();
    expect(screen.getByText('Liberation')).toBeDefined();
  });

  it('should hide GP-only types in Boutique mode', () => {
    render(<ArticleTypeSelector {...defaultProps} mode="Boutique" />);

    expect(screen.getByText('Standard')).toBeDefined();
    expect(screen.getByText('VRL')).toBeDefined();
    expect(screen.getByText('VSL')).toBeDefined();
    expect(screen.queryByText('Transfert')).toBeNull();
    expect(screen.queryByText('Liberation')).toBeNull();
  });

  it('should call onSelect when a non-stub type is clicked', () => {
    const onSelect = vi.fn();
    render(<ArticleTypeSelector {...defaultProps} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('VRL'));

    expect(onSelect).toHaveBeenCalledWith('VRL');
  });

  it('should not call onSelect for stub types', () => {
    const onSelect = vi.fn();
    render(<ArticleTypeSelector {...defaultProps} onSelect={onSelect} />);

    const transfertButton = screen.getByText('Transfert').closest('button');
    expect(transfertButton?.disabled).toBe(true);
  });

  it('should show "Bientot" badge on stub types', () => {
    render(<ArticleTypeSelector {...defaultProps} />);

    const badges = screen.getAllByText('Bientot');
    expect(badges.length).toBe(2); // TRF + PYR
  });

  it('should highlight selected type', () => {
    render(<ArticleTypeSelector {...defaultProps} selected="VRL" />);

    const vrlButton = screen.getByRole('radio', { checked: true });
    expect(vrlButton.textContent).toContain('VRL');
  });

  it('should disable all buttons when disabled prop is true', () => {
    render(<ArticleTypeSelector {...defaultProps} disabled />);

    const buttons = screen.getAllByRole('radio');
    const enabledButtons = buttons.filter((b) => !(b as HTMLButtonElement).disabled);
    expect(enabledButtons.length).toBe(0);
  });
});
