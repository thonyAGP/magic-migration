// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PrinterSettings } from '../PrinterSettings';

const mockTestPrinter = vi.fn();

vi.mock('@/stores/parametresStore', () => ({
  useParametresStore: vi.fn(() => ({
    printers: [
      { id: 'PRT001', nom: 'Imprimante Caisse 1', type: 'escpos', adresse: '192.168.1.100', port: 9100, estDefaut: true, status: 'online' },
      { id: 'PRT002', nom: 'Imprimante Bureau', type: 'pdf', adresse: 'localhost', port: 0, estDefaut: false, status: 'offline' },
      { id: 'PRT003', nom: 'Imprimante Reseau', type: 'network', adresse: '192.168.1.101', port: 9100, estDefaut: false, status: 'error' },
    ],
    testPrinter: mockTestPrinter,
    isTestingPrinter: false,
  })),
}));

describe('PrinterSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTestPrinter.mockResolvedValue(true);
  });

  it('should render all printers', () => {
    render(<PrinterSettings />);

    expect(screen.getByText('Imprimante Caisse 1')).toBeInTheDocument();
    expect(screen.getByText('Imprimante Bureau')).toBeInTheDocument();
    expect(screen.getByText('Imprimante Reseau')).toBeInTheDocument();
  });

  it('should display correct status badges', () => {
    render(<PrinterSettings />);

    expect(screen.getByTestId('status-PRT001')).toHaveTextContent('En ligne');
    expect(screen.getByTestId('status-PRT002')).toHaveTextContent('Hors ligne');
    expect(screen.getByTestId('status-PRT003')).toHaveTextContent('Erreur');
  });

  it('should call testPrinter when test button clicked', async () => {
    render(<PrinterSettings />);

    fireEvent.click(screen.getByTestId('test-btn-PRT001'));

    await waitFor(() => {
      expect(mockTestPrinter).toHaveBeenCalledWith('PRT001');
    });
  });

  it('should mark default printer with star icon', () => {
    render(<PrinterSettings />);

    const printerRow1 = screen.getByTestId('printer-PRT001');
    expect(printerRow1.querySelector('[data-testid="default-star"]')).toBeInTheDocument();

    const printerRow2 = screen.getByTestId('printer-PRT002');
    expect(printerRow2.querySelector('[data-testid="default-star"]')).not.toBeInTheDocument();
  });

  it('should display printer type and address', () => {
    render(<PrinterSettings />);

    expect(screen.getByText(/ESC\/POS/)).toBeInTheDocument();
    expect(screen.getByText(/192\.168\.1\.100:9100/)).toBeInTheDocument();
    expect(screen.getByText(/PDF/)).toBeInTheDocument();
  });
});
