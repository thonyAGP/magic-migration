// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock apiClient before importing endpoints
vi.mock('../apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { apiClient } from '../apiClient';
import { transactionLot2Api } from '../endpoints-lot2';
import type { CreateTransactionLot2Request } from '../types-lot2';

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);

describe('transactionLot2Api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('preCheck', () => {
    it('should call GET /transactions/pre-check', async () => {
      mockGet.mockResolvedValueOnce({
        data: { data: { canSell: true }, success: true },
      });

      await transactionLot2Api.preCheck();

      expect(mockGet).toHaveBeenCalledWith('/transactions/pre-check');
    });
  });

  describe('getMoyenPaiements', () => {
    it('should call GET /moyen-paiements', async () => {
      mockGet.mockResolvedValueOnce({
        data: { data: [], success: true },
      });

      await transactionLot2Api.getMoyenPaiements();

      expect(mockGet).toHaveBeenCalledWith('/moyen-paiements');
    });
  });

  describe('getForfaits', () => {
    it('should call GET /forfaits with articleType query param', async () => {
      mockGet.mockResolvedValueOnce({
        data: { data: [], success: true },
      });

      await transactionLot2Api.getForfaits('VRL');

      expect(mockGet).toHaveBeenCalledWith('/forfaits?articleType=VRL');
    });

    it('should call GET /forfaits with default articleType', async () => {
      mockGet.mockResolvedValueOnce({
        data: { data: [], success: true },
      });

      await transactionLot2Api.getForfaits('default');

      expect(mockGet).toHaveBeenCalledWith('/forfaits?articleType=default');
    });
  });

  describe('getEditionConfig', () => {
    it('should call GET /terminal/edition-config', async () => {
      mockGet.mockResolvedValueOnce({
        data: { data: { format: 'PMS28', printerId: 1, printerName: 'Test' }, success: true },
      });

      await transactionLot2Api.getEditionConfig();

      expect(mockGet).toHaveBeenCalledWith('/terminal/edition-config');
    });
  });

  describe('create', () => {
    it('should call POST /transactions with request data', async () => {
      const request: CreateTransactionLot2Request = {
        sessionId: 1,
        type: 'vente_gp',
        mode: 'GP',
        compteId: 1001,
        articleType: 'default',
        lignes: [
          {
            description: 'Test article',
            quantite: 1,
            prixUnitaire: 50,
            devise: 'EUR',
          },
        ],
      };

      mockPost.mockResolvedValueOnce({
        data: { data: { id: 42 }, success: true },
      });

      await transactionLot2Api.create(request);

      expect(mockPost).toHaveBeenCalledWith('/transactions', request);
    });

    it('should include optional commentaire', async () => {
      const request: CreateTransactionLot2Request = {
        sessionId: 1,
        type: 'vente_boutique',
        mode: 'Boutique',
        compteId: 2002,
        articleType: 'VSL',
        lignes: [],
        commentaire: 'Client VIP',
      };

      mockPost.mockResolvedValueOnce({
        data: { data: { id: 43 }, success: true },
      });

      await transactionLot2Api.create(request);

      expect(mockPost).toHaveBeenCalledWith('/transactions', request);
    });
  });

  describe('checkGiftPass', () => {
    it('should call POST /transactions/:id/check-giftpass', async () => {
      const data = { societe: 'SOC1', compte: 1001, filiation: 1 };

      mockPost.mockResolvedValueOnce({
        data: { data: { balance: 100, available: true, devise: 'EUR' }, success: true },
      });

      await transactionLot2Api.checkGiftPass(42, data);

      expect(mockPost).toHaveBeenCalledWith(
        '/transactions/42/check-giftpass',
        data,
      );
    });
  });

  describe('checkResortCredit', () => {
    it('should call POST /transactions/:id/check-resort-credit', async () => {
      const data = { societe: 'SOC1', compte: 1001, filiation: 1 };

      mockPost.mockResolvedValueOnce({
        data: { data: { balance: 200, available: true, devise: 'EUR' }, success: true },
      });

      await transactionLot2Api.checkResortCredit(42, data);

      expect(mockPost).toHaveBeenCalledWith(
        '/transactions/42/check-resort-credit',
        data,
      );
    });
  });

  describe('complete', () => {
    it('should call POST /transactions/:id/complete with unilateral payment', async () => {
      const data = {
        mop: [{ code: 'ESP', montant: 100 }],
        paymentSide: 'unilateral' as const,
      };

      mockPost.mockResolvedValueOnce({
        data: { data: undefined, success: true },
      });

      await transactionLot2Api.complete(42, data);

      expect(mockPost).toHaveBeenCalledWith(
        '/transactions/42/complete',
        data,
      );
    });

    it('should call POST /transactions/:id/complete with bilateral payment', async () => {
      const data = {
        mop: [{ code: 'VIR', montant: 500 }],
        paymentSide: 'bilateral' as const,
        bilateral: {
          compteSource: 1001,
          compteDestination: 2002,
          montantSource: 500,
          montantDestination: 500,
        },
      };

      mockPost.mockResolvedValueOnce({
        data: { data: undefined, success: true },
      });

      await transactionLot2Api.complete(42, data);

      expect(mockPost).toHaveBeenCalledWith(
        '/transactions/42/complete',
        data,
      );
    });

    it('should include optional forfait and vrlIdentity', async () => {
      const data = {
        mop: [{ code: 'CB', montant: 280 }],
        paymentSide: 'unilateral' as const,
        forfait: {
          dateDebut: '2026-02-10',
          dateFin: '2026-02-17',
        },
        vrlIdentity: {
          nom: 'Dupont',
          prenom: 'Jean',
          typeDocument: 'CNI',
          numeroDocument: '123456',
        },
      };

      mockPost.mockResolvedValueOnce({
        data: { data: undefined, success: true },
      });

      await transactionLot2Api.complete(42, data);

      expect(mockPost).toHaveBeenCalledWith(
        '/transactions/42/complete',
        data,
      );
    });
  });

  describe('recoverTPE', () => {
    it('should call POST /transactions/:id/recover-tpe', async () => {
      const data = {
        newMOP: [{ code: 'ESP', montant: 100 }],
      };

      mockPost.mockResolvedValueOnce({
        data: { data: undefined, success: true },
      });

      await transactionLot2Api.recoverTPE(42, data);

      expect(mockPost).toHaveBeenCalledWith(
        '/transactions/42/recover-tpe',
        data,
      );
    });
  });
});
