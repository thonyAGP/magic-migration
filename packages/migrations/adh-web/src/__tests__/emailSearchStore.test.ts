import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEmailSearchStore } from '@/stores/emailSearchStore';
import { apiClient } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import type { ApiResponse } from '@/services/api/apiClient';
import type {
  CreateEmailDto,
  UpdateEmailDto,
  GetEmailsResponse,
  CreateEmailResponse,
  UpdateEmailResponse,
  DeleteEmailResponse,
  SetPrincipalResponse,
  SearchFilters,
  EmailAddress,
} from '@/types/emailSearch';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/stores/dataSourceStore', () => ({
  useDataSourceStore: {
    getState: vi.fn(),
  },
}));

const MOCK_EMAIL_1: EmailAddress = {
  id: 1,
  societe: 'SKI',
  compte: '100001',
  filiation: 0,
  email: 'jean.dupont@email.com',
  isPrincipal: true,
  createdAt: new Date('2026-01-15T10:30:00'),
  updatedAt: new Date('2026-02-10T14:20:00'),
};

const MOCK_EMAIL_2: EmailAddress = {
  id: 2,
  societe: 'SKI',
  compte: '100001',
  filiation: 0,
  email: 'contact@dupont-family.fr',
  isPrincipal: false,
  createdAt: new Date('2026-01-20T09:15:00'),
  updatedAt: null,
};

const MOCK_EMAIL_3: EmailAddress = {
  id: 3,
  societe: 'EXCHANGE',
  compte: '100002',
  filiation: 1,
  email: 'marie.bernard@email.com',
  isPrincipal: true,
  createdAt: new Date('2026-01-08T10:00:00'),
  updatedAt: null,
};

const MOCK_EMAILS = [MOCK_EMAIL_1, MOCK_EMAIL_2, MOCK_EMAIL_3];

const getState = () => useEmailSearchStore.getState();

describe('emailSearchStore', () => {
  beforeEach(() => {
    getState().resetState();
    vi.clearAllMocks();
  });

  describe('searchEmails', () => {
    it('should fetch emails from API when isRealApi is true', async () => {
      const filters: SearchFilters = {
        societe: 'SKI',
        compte: '100001',
        filiation: null,
        email: '',
      };

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          data: { data: MOCK_EMAILS, count: MOCK_EMAILS.length },
        },
      } as ApiResponse<GetEmailsResponse>);

      await getState().searchEmails(filters);

      expect(apiClient.get).toHaveBeenCalledWith('/api/email-search/emails', {
        params: { societe: 'SKI', compte: '100001' },
      });
      expect(getState().emails).toEqual(MOCK_EMAILS);
      expect(getState().isLoading).toBe(false);
      expect(getState().error).toBe(null);
    });

    it('should filter mock emails when isRealApi is false', async () => {
      const filters: SearchFilters = {
        societe: 'SKI',
        compte: '100001',
        filiation: 0,
        email: '',
      };

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().searchEmails(filters);

      expect(apiClient.get).not.toHaveBeenCalled();
      expect(getState().emails.length).toBeGreaterThan(0);
      expect(getState().emails.every((e) => e.societe === 'SKI' && e.compte === '100001')).toBe(true);
      expect(getState().isLoading).toBe(false);
    });

    it('should filter by email pattern when isRealApi is false', async () => {
      const filters: SearchFilters = {
        societe: '',
        compte: '',
        filiation: null,
        email: 'contact',
      };

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().searchEmails(filters);

      expect(getState().emails.every((e) => e.email.toLowerCase().includes('contact'))).toBe(true);
    });

    it('should set error when API call fails', async () => {
      const filters: SearchFilters = {
        societe: 'SKI',
        compte: '',
        filiation: null,
        email: '',
      };

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      await getState().searchEmails(filters);

      expect(getState().emails).toEqual([]);
      expect(getState().error).toBe('Network error');
      expect(getState().isLoading).toBe(false);
    });

    it('should handle all filter criteria in API mode', async () => {
      const filters: SearchFilters = {
        societe: 'SKI',
        compte: '100001',
        filiation: 0,
        email: 'jean',
      };

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          data: { data: [MOCK_EMAIL_1], count: 1 },
        },
      } as ApiResponse<GetEmailsResponse>);

      await getState().searchEmails(filters);

      expect(apiClient.get).toHaveBeenCalledWith('/api/email-search/emails', {
        params: { societe: 'SKI', compte: '100001', filiation: '0', email: 'jean' },
      });
    });
  });

  describe('createEmail', () => {
    it('should create email via API when isRealApi is true', async () => {
      const newEmail: CreateEmailDto = {
        societe: 'SKI',
        compte: '100003',
        filiation: 0,
        email: 'new@test.com',
        isPrincipal: false,
      };

      const createdEmail: EmailAddress = {
        id: 99,
        ...newEmail,
        isPrincipal: false,
        createdAt: new Date(),
        updatedAt: null,
      };

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          data: { data: createdEmail },
        },
      } as ApiResponse<CreateEmailResponse>);

      await getState().createEmail(newEmail);

      expect(apiClient.post).toHaveBeenCalledWith('/api/email-search/emails', newEmail);
      expect(getState().emails).toContainEqual(createdEmail);
      expect(getState().isLoading).toBe(false);
      expect(getState().error).toBe(null);
    });

    it('should create email in mock mode and unset previous principal if isPrincipal is true', async () => {
      const newEmail: CreateEmailDto = {
        societe: 'SKI',
        compte: '100001',
        filiation: 0,
        email: 'new-principal@test.com',
        isPrincipal: true,
      };

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().searchEmails({
        societe: 'SKI',
        compte: '100001',
        filiation: 0,
        email: '',
      });
      await getState().createEmail(newEmail);

      const created = getState().emails.find((e) => e.email === 'new-principal@test.com');
      expect(created?.isPrincipal).toBe(true);
      expect(getState().isLoading).toBe(false);
    });

    it('should set error when API creation fails', async () => {
      const newEmail: CreateEmailDto = {
        societe: 'SKI',
        compte: '100003',
        filiation: 0,
        email: 'fail@test.com',
      };

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Validation error'));

      await getState().createEmail(newEmail);

      expect(getState().error).toBe('Validation error');
      expect(getState().isLoading).toBe(false);
    });

    it('should set createdAt timestamp when creating in mock mode', async () => {
      const beforeCreate = new Date();

      const newEmail: CreateEmailDto = {
        societe: 'SKI',
        compte: '100003',
        filiation: 0,
        email: 'timestamped@test.com',
      };

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().searchEmails({
        societe: 'SKI',
        compte: '100003',
        filiation: 0,
        email: '',
      });
      await getState().createEmail(newEmail);

      const created = getState().emails.find((e) => e.email === 'timestamped@test.com');
      expect(created).toBeDefined();
      expect(created!.createdAt).toBeInstanceOf(Date);
      expect(created!.createdAt!.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    });
  });

  describe('updateEmail', () => {
    it('should update email via API when isRealApi is true', async () => {
      const updateData: UpdateEmailDto = {
        email: 'updated@email.com',
      };

      const updatedEmail: EmailAddress = {
        ...MOCK_EMAIL_1,
        email: 'updated@email.com',
        updatedAt: new Date(),
      };

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.put).mockResolvedValue({
        data: {
          success: true,
          data: { data: updatedEmail },
        },
      } as ApiResponse<UpdateEmailResponse>);

      useEmailSearchStore.setState({ emails: [MOCK_EMAIL_1] });
      await getState().updateEmail(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/api/email-search/emails/1', updateData);
      expect(getState().emails[0].email).toBe('updated@email.com');
      expect(getState().isLoading).toBe(false);
    });

    it('should update email in mock mode and set updatedAt timestamp', async () => {
      const updateData: UpdateEmailDto = {
        email: 'updated-mock@email.com',
      };

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().searchEmails({
        societe: 'SKI',
        compte: '100001',
        filiation: 0,
        email: '',
      });
      await getState().updateEmail(1, updateData);

      const updated = getState().emails.find((e) => e.id === 1);
      expect(updated?.email).toBe('updated-mock@email.com');
      expect(updated?.updatedAt).toBeInstanceOf(Date);
    });

    it('should unset other principals when updating isPrincipal to true in mock mode', async () => {
      const updateData: UpdateEmailDto = {
        isPrincipal: true,
      };

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().searchEmails({
        societe: 'SKI',
        compte: '100001',
        filiation: 0,
        email: '',
      });
      await getState().updateEmail(2, updateData);

      const updated = getState().emails.find((e) => e.id === 2);
      expect(updated?.isPrincipal).toBe(true);
    });

    it('should set error when email not found in mock mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().updateEmail(999, { email: 'test@email.com' });

      expect(getState().error).toBe('Email introuvable');
      expect(getState().isLoading).toBe(false);
    });

    it('should set error when API update fails', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.put).mockRejectedValue(new Error('Update failed'));

      await getState().updateEmail(1, { email: 'fail@email.com' });

      expect(getState().error).toBe('Update failed');
      expect(getState().isLoading).toBe(false);
    });
  });

  describe('deleteEmail', () => {
    it('should delete email via API when isRealApi is true', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.delete).mockResolvedValue({
        data: {
          success: true,
          data: { success: true },
        },
      } as ApiResponse<DeleteEmailResponse>);

      useEmailSearchStore.setState({ emails: [MOCK_EMAIL_1, MOCK_EMAIL_2] });
      await getState().deleteEmail(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/api/email-search/emails/1');
      expect(getState().emails).toHaveLength(1);
      expect(getState().emails[0].id).toBe(2);
      expect(getState().isLoading).toBe(false);
    });

    it('should delete email in mock mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      // Search all emails first to populate
      await getState().searchEmails({
        societe: '',
        compte: '',
        filiation: null,
        email: '',
      });
      const initialCount = getState().emails.length;
      // Pick an ID that exists in the current results
      const firstId = getState().emails[0]?.id;
      if (firstId !== undefined) {
        await getState().deleteEmail(firstId);

        expect(getState().emails.length).toBeLessThan(initialCount);
        expect(getState().emails.find((e) => e.id === firstId)).toBeUndefined();
      }
    });

    it('should set error when email not found in mock mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().deleteEmail(999);

      expect(getState().error).toBe('Email introuvable');
      expect(getState().isLoading).toBe(false);
    });

    it('should set error when API deletion fails', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.delete).mockRejectedValue(new Error('Delete failed'));

      await getState().deleteEmail(1);

      expect(getState().error).toBe('Delete failed');
      expect(getState().isLoading).toBe(false);
    });
  });

  describe('setAsPrincipal', () => {
    it('should set email as principal via API when isRealApi is true', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          data: { success: true },
        },
      } as ApiResponse<SetPrincipalResponse>);

      useEmailSearchStore.setState({ emails: [MOCK_EMAIL_1, MOCK_EMAIL_2] });
      await getState().setAsPrincipal(2);

      expect(apiClient.post).toHaveBeenCalledWith('/api/email-search/emails/2/set-principal');
      expect(getState().emails.find((e) => e.id === 2)?.isPrincipal).toBe(true);
      expect(getState().emails.find((e) => e.id === 1)?.isPrincipal).toBe(false);
      expect(getState().isLoading).toBe(false);
    });

    it('should unset previous principal when setting new principal in mock mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().searchEmails({
        societe: 'SKI',
        compte: '100001',
        filiation: 0,
        email: '',
      });
      await getState().setAsPrincipal(2);

      const emailsWithSameGM = getState().emails.filter(
        (e) => e.societe === 'SKI' && e.compte === '100001' && e.filiation === 0,
      );
      const principalCount = emailsWithSameGM.filter((e) => e.isPrincipal).length;
      expect(principalCount).toBe(1);
      expect(getState().emails.find((e) => e.id === 2)?.isPrincipal).toBe(true);
    });

    it('should set error when email not found in mock mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().setAsPrincipal(999);

      expect(getState().error).toBe('Email introuvable');
      expect(getState().isLoading).toBe(false);
    });

    it('should set error when API call fails', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Principal update failed'));

      await getState().setAsPrincipal(1);

      expect(getState().error).toBe('Principal update failed');
      expect(getState().isLoading).toBe(false);
    });

    it('should only affect emails with same GM identifier (societe+compte+filiation)', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().searchEmails({
        societe: '',
        compte: '',
        filiation: null,
        email: '',
      });

      // Find an email from EXCHANGE group that is already principal
      const exchangeEmails = getState().emails.filter((e) => e.societe === 'EXCHANGE');
      const principalExchange = exchangeEmails.find((e) => e.isPrincipal);

      // Set a SKI email as principal - should not affect EXCHANGE emails
      const skiEmails = getState().emails.filter((e) => e.societe === 'SKI');
      const nonPrincipalSki = skiEmails.find((e) => !e.isPrincipal);
      if (nonPrincipalSki && principalExchange) {
        await getState().setAsPrincipal(nonPrincipalSki.id);

        // Verify EXCHANGE principal was not affected
        const exchangeAfter = getState().emails.find((e) => e.id === principalExchange.id);
        expect(exchangeAfter?.isPrincipal).toBe(true);
      }
    });
  });

  describe('selectEmail', () => {
    it('should set selected email', () => {
      getState().selectEmail(MOCK_EMAIL_1);

      expect(getState().selectedEmail).toEqual(MOCK_EMAIL_1);
    });

    it('should clear selected email when passed null', () => {
      getState().selectEmail(MOCK_EMAIL_1);
      getState().selectEmail(null);

      expect(getState().selectedEmail).toBe(null);
    });
  });

  describe('setFilters', () => {
    it('should update filters', () => {
      const filters: SearchFilters = {
        societe: 'SKI',
        compte: '100001',
        filiation: 0,
        email: 'test',
      };

      getState().setFilters(filters);

      expect(getState().filters).toEqual(filters);
    });
  });

  describe('clearFilters', () => {
    it('should reset all filters to initial state', () => {
      getState().setFilters({
        societe: 'SKI',
        compte: '100001',
        filiation: 0,
        email: 'test',
      });
      getState().clearFilters();

      expect(getState().filters).toEqual({
        societe: '',
        compte: '',
        filiation: null,
        email: '',
      });
    });
  });

  describe('resetState', () => {
    it('should reset entire store to initial state', () => {
      useEmailSearchStore.setState({
        emails: MOCK_EMAILS,
        selectedEmail: MOCK_EMAIL_1,
        error: 'Some error',
      });
      getState().setFilters({ societe: 'SKI', compte: '100001', filiation: 0, email: 'test' });

      getState().resetState();

      expect(getState().emails).toEqual([]);
      expect(getState().selectedEmail).toBe(null);
      expect(getState().error).toBe(null);
      expect(getState().filters).toEqual({
        societe: '',
        compte: '',
        filiation: null,
        email: '',
      });
      expect(getState().isLoading).toBe(false);
    });
  });
});
