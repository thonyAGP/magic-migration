// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAccountOpsStore } from '../accountOpsStore';

vi.mock('@/services/api/endpoints-lot6', () => ({
  accountOpsApi: {
    changeAccount: vi.fn(),
    getSolde: vi.fn(),
    getPhoneInfo: vi.fn(),
    updatePhone: vi.fn(),
  },
}));

vi.mock('../dataSourceStore', () => ({
  useDataSourceStore: {
    getState: vi.fn(() => ({ isRealApi: false })),
  },
}));

import { accountOpsApi } from '@/services/api/endpoints-lot6';
import { useDataSourceStore } from '../dataSourceStore';

describe('useAccountOpsStore', () => {
  beforeEach(() => {
    useAccountOpsStore.setState({
      opType: 'changement',
      form: { codeAdherent: '', filiation: '0', telephone: '', portable: '' },
      resultMessage: null,
      error: null,
      isLoading: false,
    });
    vi.clearAllMocks();
    vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);
  });

  describe('initial state', () => {
    it('should have default values', () => {
      const state = useAccountOpsStore.getState();
      expect(state.opType).toBe('changement');
      expect(state.form).toEqual({ codeAdherent: '', filiation: '0', telephone: '', portable: '' });
      expect(state.resultMessage).toBeNull();
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setForm', () => {
    it('should update a form field', () => {
      useAccountOpsStore.getState().setForm('codeAdherent', '1001');
      expect(useAccountOpsStore.getState().form.codeAdherent).toBe('1001');
    });

    it('should clear error and resultMessage on form change', () => {
      useAccountOpsStore.setState({ error: 'some error', resultMessage: 'some result' });
      useAccountOpsStore.getState().setForm('codeAdherent', '1002');
      expect(useAccountOpsStore.getState().error).toBeNull();
      expect(useAccountOpsStore.getState().resultMessage).toBeNull();
    });
  });

  describe('setOpType', () => {
    it('should change operation type', () => {
      useAccountOpsStore.getState().setOpType('solde');
      expect(useAccountOpsStore.getState().opType).toBe('solde');
    });

    it('should clear error and resultMessage', () => {
      useAccountOpsStore.setState({ error: 'err', resultMessage: 'msg' });
      useAccountOpsStore.getState().setOpType('telephone');
      expect(useAccountOpsStore.getState().error).toBeNull();
      expect(useAccountOpsStore.getState().resultMessage).toBeNull();
    });
  });

  describe('executeOperation - mock mode', () => {
    it('should return error if code adherent invalid', async () => {
      useAccountOpsStore.setState({ form: { codeAdherent: 'abc', filiation: '0', telephone: '', portable: '' } });
      await useAccountOpsStore.getState().executeOperation('ADH');
      expect(useAccountOpsStore.getState().error).toBe('Code adherent invalide');
    });

    it('should handle changement in mock mode', async () => {
      useAccountOpsStore.setState({
        opType: 'changement',
        form: { codeAdherent: '1001', filiation: '0', telephone: '', portable: '' },
      });
      await useAccountOpsStore.getState().executeOperation('ADH');
      expect(useAccountOpsStore.getState().resultMessage).toContain('Changement de compte effectue');
      expect(useAccountOpsStore.getState().isLoading).toBe(false);
    });

    it('should handle solde in mock mode', async () => {
      useAccountOpsStore.setState({
        opType: 'solde',
        form: { codeAdherent: '1001', filiation: '0', telephone: '', portable: '' },
      });
      await useAccountOpsStore.getState().executeOperation('ADH');
      expect(useAccountOpsStore.getState().resultMessage).toMatch(/Solde: \d+\.\d+ EUR/);
      expect(useAccountOpsStore.getState().isLoading).toBe(false);
    });

    it('should handle telephone load in mock mode', async () => {
      useAccountOpsStore.setState({
        opType: 'telephone',
        form: { codeAdherent: '1001', filiation: '0', telephone: '', portable: '' },
      });
      await useAccountOpsStore.getState().executeOperation('ADH');
      const state = useAccountOpsStore.getState();
      expect(state.form.telephone).toBe('01 23 45 67 89');
      expect(state.form.portable).toBe('06 12 34 56 78');
      expect(state.resultMessage).toContain('chargees');
    });

    it('should handle telephone update in mock mode', async () => {
      useAccountOpsStore.setState({
        opType: 'telephone',
        form: { codeAdherent: '1001', filiation: '0', telephone: '09 87 65 43 21', portable: '' },
      });
      await useAccountOpsStore.getState().executeOperation('ADH');
      expect(useAccountOpsStore.getState().resultMessage).toContain('mis a jour');
    });
  });

  describe('executeOperation - API mode', () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
    });

    it('should call changeAccount API', async () => {
      useAccountOpsStore.setState({
        opType: 'changement',
        form: { codeAdherent: '1001', filiation: '0', telephone: '', portable: '' },
      });
      vi.mocked(accountOpsApi.changeAccount).mockResolvedValue({
        data: { data: { success: true } },
      } as never);

      await useAccountOpsStore.getState().executeOperation('ADH');

      expect(accountOpsApi.changeAccount).toHaveBeenCalledWith('ADH', 1001, 0);
      expect(useAccountOpsStore.getState().resultMessage).toContain('succes');
    });

    it('should call getSolde API', async () => {
      useAccountOpsStore.setState({
        opType: 'solde',
        form: { codeAdherent: '1001', filiation: '0', telephone: '', portable: '' },
      });
      vi.mocked(accountOpsApi.getSolde).mockResolvedValue({
        data: { data: { solde: 1250.50, devise: 'EUR' } },
      } as never);

      await useAccountOpsStore.getState().executeOperation('ADH');

      expect(accountOpsApi.getSolde).toHaveBeenCalledWith('ADH', 1001, 0);
      expect(useAccountOpsStore.getState().resultMessage).toBe('Solde: 1250.50 EUR');
    });

    it('should call updatePhone API when phone provided', async () => {
      useAccountOpsStore.setState({
        opType: 'telephone',
        form: { codeAdherent: '1001', filiation: '0', telephone: '01 00 00 00 00', portable: '' },
      });
      vi.mocked(accountOpsApi.updatePhone).mockResolvedValue({
        data: { data: undefined },
      } as never);

      await useAccountOpsStore.getState().executeOperation('ADH');

      expect(accountOpsApi.updatePhone).toHaveBeenCalledWith('ADH', 1001, 0, '01 00 00 00 00', '');
      expect(useAccountOpsStore.getState().resultMessage).toContain('mis a jour');
    });

    it('should call getPhoneInfo API when no phone provided', async () => {
      useAccountOpsStore.setState({
        opType: 'telephone',
        form: { codeAdherent: '1001', filiation: '0', telephone: '', portable: '' },
      });
      vi.mocked(accountOpsApi.getPhoneInfo).mockResolvedValue({
        data: { data: { telephone: '01 11 22 33 44', portable: '06 55 66 77 88' } },
      } as never);

      await useAccountOpsStore.getState().executeOperation('ADH');

      expect(accountOpsApi.getPhoneInfo).toHaveBeenCalledWith('ADH', 1001, 0);
      expect(useAccountOpsStore.getState().form.telephone).toBe('01 11 22 33 44');
    });

    it('should set error on API failure', async () => {
      useAccountOpsStore.setState({
        opType: 'changement',
        form: { codeAdherent: '1001', filiation: '0', telephone: '', portable: '' },
      });
      vi.mocked(accountOpsApi.changeAccount).mockRejectedValue(new Error('Network error'));

      await useAccountOpsStore.getState().executeOperation('ADH');

      expect(useAccountOpsStore.getState().error).toBe('Network error');
      expect(useAccountOpsStore.getState().isLoading).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial', () => {
      useAccountOpsStore.setState({
        opType: 'solde',
        form: { codeAdherent: '1001', filiation: '1', telephone: '01', portable: '06' },
        resultMessage: 'test',
        error: 'err',
        isLoading: true,
      });

      useAccountOpsStore.getState().reset();

      const state = useAccountOpsStore.getState();
      expect(state.opType).toBe('changement');
      expect(state.form.codeAdherent).toBe('');
      expect(state.resultMessage).toBeNull();
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });
});
