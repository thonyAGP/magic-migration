import { describe, it, expect } from 'vitest';
import type {
  MoyenPaiementCatalog,
  ForfaitData,
  VRLIdentity,
  PreCheckResult,
  EditionConfig,
  GiftPassResult,
  ResortCreditResult,
  TPERecoveryData,
  SelectedMOP,
  TransactionLinePayload,
  TransactionDraft,
} from '@/types/transaction-lot2';
import type { ArticleType, PaymentSide } from '@/types/transaction';

describe('transaction-lot2 types', () => {
  describe('ArticleType', () => {
    it('should accept all valid article types', () => {
      const types: ArticleType[] = ['VRL', 'VSL', 'TRF', 'PYR', 'default'];

      expect(types).toHaveLength(5);
      expect(types).toContain('VRL');
      expect(types).toContain('TRF');
    });
  });

  describe('PaymentSide', () => {
    it('should accept unilateral and bilateral', () => {
      const sides: PaymentSide[] = ['unilateral', 'bilateral'];

      expect(sides).toHaveLength(2);
    });
  });

  describe('MoyenPaiementCatalog', () => {
    it('should satisfy the type shape for especes', () => {
      const mop: MoyenPaiementCatalog = {
        code: 'ESP',
        libelle: 'Especes',
        type: 'especes',
        classe: 'A',
        estTPE: false,
      };

      expect(mop.code).toBe('ESP');
      expect(mop.estTPE).toBe(false);
      expect(mop.maxMontant).toBeUndefined();
    });

    it('should satisfy the type shape for carte with maxMontant', () => {
      const mop: MoyenPaiementCatalog = {
        code: 'CB',
        libelle: 'Carte Bancaire',
        type: 'carte',
        classe: 'B',
        estTPE: true,
        maxMontant: 5000,
      };

      expect(mop.estTPE).toBe(true);
      expect(mop.maxMontant).toBe(5000);
    });
  });

  describe('ForfaitData', () => {
    it('should satisfy the type shape', () => {
      const forfait: ForfaitData = {
        code: 'SKI7',
        libelle: 'Forfait Ski 7 jours',
        dateDebut: '2026-02-10',
        dateFin: '2026-02-17',
        articleType: 'VRL',
        prixParJour: 45,
        prixForfait: 280,
      };

      expect(forfait.articleType).toBe('VRL');
      expect(forfait.prixForfait).toBeLessThan(forfait.prixParJour * 7);
    });
  });

  describe('VRLIdentity', () => {
    it('should satisfy the type shape', () => {
      const identity: VRLIdentity = {
        nom: 'Dupont',
        prenom: 'Jean',
        typeDocument: 'CNI',
        numeroDocument: '123456789',
      };

      expect(identity.nom).toBe('Dupont');
      expect(identity.typeDocument).toBe('CNI');
    });
  });

  describe('PreCheckResult', () => {
    it('should allow selling when canSell is true', () => {
      const result: PreCheckResult = {
        canSell: true,
      };

      expect(result.canSell).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should provide reason when canSell is false', () => {
      const result: PreCheckResult = {
        canSell: false,
        reason: 'Reseau cloture',
      };

      expect(result.canSell).toBe(false);
      expect(result.reason).toBe('Reseau cloture');
    });
  });

  describe('EditionConfig', () => {
    it('should satisfy PMS28 format', () => {
      const config: EditionConfig = {
        format: 'PMS28',
        printerId: 1,
        printerName: 'Imprimante Caisse GP',
      };

      expect(config.format).toBe('PMS28');
    });

    it('should satisfy PMS584 format', () => {
      const config: EditionConfig = {
        format: 'PMS584',
        printerId: 2,
        printerName: 'Imprimante Boutique',
      };

      expect(config.format).toBe('PMS584');
    });

    it('should satisfy LEX format', () => {
      const config: EditionConfig = {
        format: 'LEX',
        printerId: 3,
        printerName: 'Imprimante LEX',
      };

      expect(config.format).toBe('LEX');
    });
  });

  describe('GiftPassResult', () => {
    it('should satisfy the type shape when available', () => {
      const result: GiftPassResult = {
        balance: 150.5,
        available: true,
        devise: 'EUR',
      };

      expect(result.available).toBe(true);
      expect(result.balance).toBeGreaterThan(0);
    });

    it('should satisfy the type shape when unavailable', () => {
      const result: GiftPassResult = {
        balance: 0,
        available: false,
        devise: 'EUR',
      };

      expect(result.available).toBe(false);
    });
  });

  describe('ResortCreditResult', () => {
    it('should satisfy the type shape', () => {
      const result: ResortCreditResult = {
        balance: 200,
        available: true,
        devise: 'EUR',
      };

      expect(result.balance).toBe(200);
      expect(result.devise).toBe('EUR');
    });
  });

  describe('TPERecoveryData', () => {
    it('should satisfy the type shape', () => {
      const recovery: TPERecoveryData = {
        transactionId: 42,
        montant: 99.9,
        mopCode: 'CB',
        erreurTPE: 'TIMEOUT',
      };

      expect(recovery.transactionId).toBe(42);
      expect(recovery.erreurTPE).toBe('TIMEOUT');
    });
  });

  describe('SelectedMOP', () => {
    it('should satisfy the type shape', () => {
      const mop: SelectedMOP = {
        code: 'ESP',
        montant: 50,
      };

      expect(mop.code).toBe('ESP');
      expect(mop.montant).toBe(50);
    });
  });

  describe('TransactionLinePayload', () => {
    it('should satisfy the type shape without codeProduit', () => {
      const line: TransactionLinePayload = {
        description: 'Forfait ski',
        quantite: 1,
        prixUnitaire: 280,
        devise: 'EUR',
      };

      expect(line.codeProduit).toBeUndefined();
    });

    it('should satisfy the type shape with codeProduit', () => {
      const line: TransactionLinePayload = {
        description: 'T-shirt boutique',
        quantite: 2,
        prixUnitaire: 25,
        devise: 'EUR',
        codeProduit: 'TSHIRT-001',
      };

      expect(line.codeProduit).toBe('TSHIRT-001');
    });
  });

  describe('TransactionDraft', () => {
    it('should satisfy the minimal type shape', () => {
      const draft: TransactionDraft = {
        compteId: 1001,
        compteNom: 'Dupont Jean',
        articleType: 'default',
        lignes: [
          {
            description: 'Article test',
            quantite: 1,
            prixUnitaire: 100,
            devise: 'EUR',
          },
        ],
        mop: [{ code: 'ESP', montant: 100 }],
        paymentSide: 'unilateral',
        devise: 'EUR',
        montantTotal: 100,
      };

      expect(draft.compteId).toBe(1001);
      expect(draft.lignes).toHaveLength(1);
      expect(draft.mop).toHaveLength(1);
      expect(draft.montantTotal).toBe(100);
    });

    it('should satisfy the full type shape with optionals', () => {
      const draft: TransactionDraft = {
        compteId: 2002,
        compteNom: 'Martin Claire',
        articleType: 'VRL',
        lignes: [
          {
            description: 'Forfait semaine',
            quantite: 1,
            prixUnitaire: 280,
            devise: 'EUR',
            codeProduit: 'SKI-7J',
          },
        ],
        mop: [
          { code: 'CB', montant: 200 },
          { code: 'ESP', montant: 80 },
        ],
        paymentSide: 'unilateral',
        giftPass: { balance: 50, available: true, devise: 'EUR' },
        resortCredit: { balance: 30, available: true, devise: 'EUR' },
        forfait: {
          code: 'SKI7',
          libelle: 'Forfait Ski 7 jours',
          dateDebut: '2026-02-10',
          dateFin: '2026-02-17',
          articleType: 'VRL',
          prixParJour: 45,
          prixForfait: 280,
        },
        vrlIdentity: {
          nom: 'Martin',
          prenom: 'Claire',
          typeDocument: 'Passeport',
          numeroDocument: 'FR123456',
        },
        commentaire: 'Client VIP',
        devise: 'EUR',
        montantTotal: 280,
      };

      expect(draft.giftPass?.available).toBe(true);
      expect(draft.forfait?.prixForfait).toBe(280);
      expect(draft.vrlIdentity?.nom).toBe('Martin');
      expect(draft.commentaire).toBe('Client VIP');
    });

    it('should support bilateral payment side', () => {
      const draft: TransactionDraft = {
        compteId: 3003,
        compteNom: 'Societe XYZ',
        articleType: 'TRF',
        lignes: [],
        mop: [{ code: 'VIR', montant: 500 }],
        paymentSide: 'bilateral',
        devise: 'EUR',
        montantTotal: 500,
      };

      expect(draft.paymentSide).toBe('bilateral');
      expect(draft.articleType).toBe('TRF');
    });
  });
});
