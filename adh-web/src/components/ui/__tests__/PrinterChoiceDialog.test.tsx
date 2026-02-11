import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrinterChoiceDialog } from '../PrinterChoiceDialog';

describe('PrinterChoiceDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onSelect: vi.fn(),
  };

  it('should render dialog with title when open', () => {
    render(<PrinterChoiceDialog {...defaultProps} />);

    expect(screen.getByText('Imprimer le ticket')).toBeInTheDocument();
    expect(screen.getByText("Choisissez le mode d'impression")).toBeInTheDocument();
  });

  it('should render three print options', () => {
    render(<PrinterChoiceDialog {...defaultProps} />);

    expect(screen.getByText('PDF Navigateur')).toBeInTheDocument();
    expect(screen.getByText('PDF Telechargement')).toBeInTheDocument();
    expect(screen.getByText('Ticket thermique')).toBeInTheDocument();
  });

  it('should call onSelect with pdf-browser when clicking PDF Navigateur', () => {
    const onSelect = vi.fn();
    render(<PrinterChoiceDialog {...defaultProps} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('PDF Navigateur'));

    expect(onSelect).toHaveBeenCalledWith('pdf-browser');
  });

  it('should call onSelect with pdf-download when clicking PDF Telechargement', () => {
    const onSelect = vi.fn();
    render(<PrinterChoiceDialog {...defaultProps} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('PDF Telechargement'));

    expect(onSelect).toHaveBeenCalledWith('pdf-download');
  });

  it('should disable ESC/POS option when isEscPosAvailable is false', () => {
    render(<PrinterChoiceDialog {...defaultProps} isEscPosAvailable={false} />);

    const escPosButton = screen.getByText('Ticket thermique').closest('button');
    expect(escPosButton).toBeDisabled();
  });

  it('should enable ESC/POS option when isEscPosAvailable is true', () => {
    render(<PrinterChoiceDialog {...defaultProps} isEscPosAvailable={true} />);

    const escPosButton = screen.getByText('Ticket thermique').closest('button');
    expect(escPosButton).not.toBeDisabled();
  });

  it('should call onSelect with escpos when clicking enabled Ticket thermique', () => {
    const onSelect = vi.fn();
    render(<PrinterChoiceDialog {...defaultProps} onSelect={onSelect} isEscPosAvailable={true} />);

    fireEvent.click(screen.getByText('Ticket thermique'));

    expect(onSelect).toHaveBeenCalledWith('escpos');
  });

  it('should not render when open is false', () => {
    render(<PrinterChoiceDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Imprimer le ticket')).not.toBeInTheDocument();
  });
});
