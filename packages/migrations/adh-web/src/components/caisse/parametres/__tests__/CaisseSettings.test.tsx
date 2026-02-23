// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CaisseSettings } from '../CaisseSettings';

const mockSaveCaisseConfig = vi.fn();

vi.mock('@/stores/parametresStore', () => ({
  useParametresStore: vi.fn(() => ({
    caisseConfig: {
      id: 'CAI001',
      nom: 'Caisse 1',
      deviseDefaut: 'EUR',
      modeOffline: false,
      autoLogoutMinutes: 30,
      imprimanteDefaut: 'PRT001',
      formatTicket: 'standard',
    },
    printers: [
      { id: 'PRT001', nom: 'Imprimante Caisse 1', type: 'escpos', adresse: '192.168.1.100', port: 9100, estDefaut: true, status: 'online' },
      { id: 'PRT002', nom: 'Imprimante Bureau', type: 'pdf', adresse: 'localhost', port: 0, estDefaut: false, status: 'online' },
    ],
    saveCaisseConfig: mockSaveCaisseConfig,
    isSaving: false,
  })),
}));

describe('CaisseSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSaveCaisseConfig.mockResolvedValue(true);
  });

  it('should render with current config values', () => {
    const { container } = render(<CaisseSettings />);

    const deviseSelect = container.querySelector('#devise-defaut') as HTMLSelectElement;
    expect(deviseSelect.value).toBe('EUR');

    const autoLogout = container.querySelector('#auto-logout') as HTMLInputElement;
    expect(autoLogout.value).toBe('30');
  });

  it('should render devise select with all options', () => {
    const { container } = render(<CaisseSettings />);

    const deviseSelect = container.querySelector('#devise-defaut') as HTMLSelectElement;
    expect(deviseSelect.options.length).toBe(4);
    expect(deviseSelect.options[0].value).toBe('EUR');
    expect(deviseSelect.options[1].value).toBe('USD');
  });

  it('should render mode offline checkbox unchecked', () => {
    const { container } = render(<CaisseSettings />);

    const checkbox = container.querySelector('#mode-offline') as HTMLInputElement;
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.checked).toBe(false);
  });

  it('should render imprimante select with printer options', () => {
    const { container } = render(<CaisseSettings />);

    const printerSelect = container.querySelector('#imprimante-defaut') as HTMLSelectElement;
    expect(printerSelect).toBeInTheDocument();
    expect(screen.getByText('Imprimante Caisse 1')).toBeInTheDocument();
    expect(screen.getByText('Imprimante Bureau')).toBeInTheDocument();
  });

  it('should call saveCaisseConfig on submit', async () => {
    render(<CaisseSettings />);

    fireEvent.click(screen.getByRole('button', { name: /sauvegarder/i }));

    await waitFor(() => {
      expect(mockSaveCaisseConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          deviseDefaut: 'EUR',
          modeOffline: false,
          autoLogoutMinutes: 30,
        }),
      );
    });
  });

  it('should display success message after save', async () => {
    render(<CaisseSettings />);

    fireEvent.click(screen.getByRole('button', { name: /sauvegarder/i }));

    await waitFor(() => {
      expect(screen.getByTestId('caisse-message')).toHaveTextContent('Configuration sauvegardee');
    });
  });
});
