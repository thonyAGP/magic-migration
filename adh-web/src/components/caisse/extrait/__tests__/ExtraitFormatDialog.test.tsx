// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExtraitFormatDialog } from '../ExtraitFormatDialog';

describe('ExtraitFormatDialog', () => {
  it('should render 6 format buttons when open', () => {
    render(
      <ExtraitFormatDialog
        open={true}
        onClose={vi.fn()}
        onSelectFormat={vi.fn()}
      />,
    );

    expect(screen.getByText('Cumule')).toBeDefined();
    expect(screen.getByText('Par date')).toBeDefined();
    expect(screen.getByText('Par imputation')).toBeDefined();
    expect(screen.getByText('Par nom')).toBeDefined();
    expect(screen.getByText('Date + Imputation')).toBeDefined();
    expect(screen.getByText('Par service')).toBeDefined();
  });

  it('should not render content when closed', () => {
    render(
      <ExtraitFormatDialog
        open={false}
        onClose={vi.fn()}
        onSelectFormat={vi.fn()}
      />,
    );

    expect(screen.queryByText('Cumule')).toBeNull();
  });

  it('should call onSelectFormat with correct format', () => {
    const onSelectFormat = vi.fn();
    render(
      <ExtraitFormatDialog
        open={true}
        onClose={vi.fn()}
        onSelectFormat={onSelectFormat}
      />,
    );

    fireEvent.click(screen.getByText('Par date'));
    expect(onSelectFormat).toHaveBeenCalledWith('date');

    fireEvent.click(screen.getByText('Cumule'));
    expect(onSelectFormat).toHaveBeenCalledWith('cumule');
  });

  it('should show printing overlay when isPrinting', () => {
    render(
      <ExtraitFormatDialog
        open={true}
        onClose={vi.fn()}
        onSelectFormat={vi.fn()}
        isPrinting
      />,
    );

    expect(screen.getByText('Impression en cours...')).toBeDefined();
  });

  it('should disable buttons when isPrinting', () => {
    render(
      <ExtraitFormatDialog
        open={true}
        onClose={vi.fn()}
        onSelectFormat={vi.fn()}
        isPrinting
      />,
    );

    const buttons = screen.getAllByRole('button').filter(
      (btn) => btn.textContent && ['Cumule', 'Par date', 'Par imputation', 'Par nom', 'Date + Imputation', 'Par service'].includes(btn.textContent),
    );
    buttons.forEach((btn) => {
      expect(btn).toHaveProperty('disabled', true);
    });
  });
});
