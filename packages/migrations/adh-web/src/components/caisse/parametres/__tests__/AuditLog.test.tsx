// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuditLog } from '../AuditLog';

const mockLoadAuditLogs = vi.fn();

vi.mock('@/stores/parametresStore', () => ({
  useParametresStore: vi.fn(() => ({
    auditLogs: [
      { id: 'AUD001', timestamp: '2026-02-10T09:15:00Z', userId: 'USR001', userName: 'Jean Dupont', action: 'Ouverture session', module: 'Session', details: 'Session ouverte caisse 1', ipAddress: '192.168.1.50', severity: 'info' },
      { id: 'AUD002', timestamp: '2026-02-10T09:45:00Z', userId: 'USR001', userName: 'Jean Dupont', action: 'Erreur impression', module: 'Imprimante', details: 'Timeout imprimante', ipAddress: '192.168.1.50', severity: 'warning' },
      { id: 'AUD003', timestamp: '2026-02-10T10:00:00Z', userId: 'USR002', userName: 'Marie Martin', action: 'Tentative connexion echouee', module: 'Auth', details: 'Mot de passe incorrect', ipAddress: '192.168.1.51', severity: 'error' },
    ],
    auditTotal: 3,
    loadAuditLogs: mockLoadAuditLogs,
    isLoadingAudit: false,
  })),
}));

describe('AuditLog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render audit entries in table', () => {
    render(<AuditLog />);

    expect(screen.getByTestId('audit-table')).toBeInTheDocument();
    expect(screen.getByTestId('audit-row-AUD001')).toBeInTheDocument();
    expect(screen.getByTestId('audit-row-AUD002')).toBeInTheDocument();
    expect(screen.getByTestId('audit-row-AUD003')).toBeInTheDocument();
  });

  it('should display severity badges with correct text', () => {
    render(<AuditLog />);

    expect(screen.getByTestId('severity-AUD001')).toHaveTextContent('Info');
    expect(screen.getByTestId('severity-AUD002')).toHaveTextContent('Avertissement');
    expect(screen.getByTestId('severity-AUD003')).toHaveTextContent('Erreur');
  });

  it('should load audit logs on initial render', () => {
    render(<AuditLog />);

    expect(mockLoadAuditLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        pageSize: 10,
      }),
    );
  });

  it('should display pagination controls', () => {
    render(<AuditLog />);

    expect(screen.getByTestId('audit-prev')).toBeInTheDocument();
    expect(screen.getByTestId('audit-next')).toBeInTheDocument();
    expect(screen.getByText(/3 entrees/)).toBeInTheDocument();
  });

  it('should filter by severity when select changes', () => {
    const { container } = render(<AuditLog />);

    // The Select component wraps <select> in a div, so query by the select element directly
    const selects = container.querySelectorAll('select');
    // The severity select is the last (and only) select element in the filters
    const severitySelect = selects[0] as HTMLSelectElement;
    fireEvent.change(severitySelect, { target: { value: 'error' } });

    expect(mockLoadAuditLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        page: 1,
      }),
    );
  });
});
