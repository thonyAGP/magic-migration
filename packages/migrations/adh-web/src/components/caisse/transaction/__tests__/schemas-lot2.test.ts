import { describe, it, expect } from 'vitest';
import {
  transactionLot2GPSchema,
  transactionLot2BoutiqueSchema,
  paymentSchema,
  bilateralPaymentSchema,
} from '../schemas-lot2';

describe('transactionLot2GPSchema', () => {
  const validGPData = {
    compteNumero: '12345',
    compteNom: 'Dupont Jean',
    articleType: 'default' as const,
    devise: 'EUR',
    lignes: [
      {
        description: 'Forfait ski',
        quantite: 1,
        prixUnitaire: 280,
        montant: 280,
        devise: 'EUR',
      },
    ],
  };

  it('should validate a correct GP transaction', () => {
    const result = transactionLot2GPSchema.safeParse(validGPData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.compteNumero).toBe('12345');
      expect(result.data.articleType).toBe('default');
    }
  });

  it('should validate with optional commentaire', () => {
    const result = transactionLot2GPSchema.safeParse({
      ...validGPData,
      commentaire: 'Note de test',
    });

    expect(result.success).toBe(true);
  });

  it('should validate all articleType values', () => {
    const types = ['VRL', 'VSL', 'TRF', 'PYR', 'default'] as const;
    for (const articleType of types) {
      const data = { ...validGPData, articleType };
      if (articleType === 'VRL') {
        data.vrlIdentity = {
          nom: 'Dupont',
          prenom: 'Jean',
          typeDocument: 'CNI',
          numeroDocument: 'ABC123',
        };
      }
      const result = transactionLot2GPSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it('should reject missing compteNumero', () => {
    const result = transactionLot2GPSchema.safeParse({
      compteNom: validGPData.compteNom,
      articleType: validGPData.articleType,
      devise: validGPData.devise,
      lignes: validGPData.lignes,
    });

    expect(result.success).toBe(false);
  });

  it('should reject empty compteNumero', () => {
    const result = transactionLot2GPSchema.safeParse({
      ...validGPData,
      compteNumero: '',
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing articleType', () => {
    const result = transactionLot2GPSchema.safeParse({
      compteNumero: validGPData.compteNumero,
      compteNom: validGPData.compteNom,
      devise: validGPData.devise,
      lignes: validGPData.lignes,
    });

    expect(result.success).toBe(false);
  });

  it('should reject invalid articleType', () => {
    const result = transactionLot2GPSchema.safeParse({
      ...validGPData,
      articleType: 'INVALID',
    });

    expect(result.success).toBe(false);
  });

  it('should reject empty lignes array', () => {
    const result = transactionLot2GPSchema.safeParse({
      ...validGPData,
      lignes: [],
    });

    expect(result.success).toBe(false);
  });

  it('should reject ligne with zero quantite', () => {
    const result = transactionLot2GPSchema.safeParse({
      ...validGPData,
      lignes: [
        {
          description: 'Test',
          quantite: 0,
          prixUnitaire: 100,
          montant: 0,
          devise: 'EUR',
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('should reject ligne with negative prixUnitaire', () => {
    const result = transactionLot2GPSchema.safeParse({
      ...validGPData,
      lignes: [
        {
          description: 'Test',
          quantite: 1,
          prixUnitaire: -10,
          montant: -10,
          devise: 'EUR',
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  describe('VRL identity conditional validation', () => {
    it('should reject VRL articleType without vrlIdentity', () => {
      const result = transactionLot2GPSchema.safeParse({
        ...validGPData,
        articleType: 'VRL',
      });

      expect(result.success).toBe(false);
    });

    it('should accept VRL articleType with valid vrlIdentity', () => {
      const result = transactionLot2GPSchema.safeParse({
        ...validGPData,
        articleType: 'VRL',
        vrlIdentity: {
          nom: 'Dupont',
          prenom: 'Jean',
          typeDocument: 'CNI',
          numeroDocument: 'ABC123456',
        },
      });

      expect(result.success).toBe(true);
    });

    it('should reject VRL with incomplete vrlIdentity', () => {
      const result = transactionLot2GPSchema.safeParse({
        ...validGPData,
        articleType: 'VRL',
        vrlIdentity: {
          nom: 'Dupont',
          prenom: '',
          typeDocument: 'CNI',
          numeroDocument: 'ABC123',
        },
      });

      expect(result.success).toBe(false);
    });

    it('should accept non-VRL articleType without vrlIdentity', () => {
      const result = transactionLot2GPSchema.safeParse({
        ...validGPData,
        articleType: 'VSL',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('forfait dates', () => {
    it('should accept optional forfait dates', () => {
      const result = transactionLot2GPSchema.safeParse({
        ...validGPData,
        forfaitDateDebut: '2026-02-10',
        forfaitDateFin: '2026-02-16',
      });

      expect(result.success).toBe(true);
    });

    it('should accept without forfait dates', () => {
      const result = transactionLot2GPSchema.safeParse(validGPData);

      expect(result.success).toBe(true);
    });
  });
});

describe('transactionLot2BoutiqueSchema', () => {
  const validBoutiqueData = {
    compteNumero: '12345',
    compteNom: 'Dupont Jean',
    devise: 'EUR',
    lignes: [
      {
        description: 'T-shirt Club Med',
        quantite: 2,
        prixUnitaire: 35,
        montant: 70,
        devise: 'EUR',
        codeProduit: 'TSH001',
      },
    ],
  };

  it('should validate a correct Boutique transaction', () => {
    const result =
      transactionLot2BoutiqueSchema.safeParse(validBoutiqueData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lignes[0].codeProduit).toBe('TSH001');
    }
  });

  it('should validate with multiple lignes', () => {
    const result = transactionLot2BoutiqueSchema.safeParse({
      ...validBoutiqueData,
      lignes: [
        {
          description: 'T-shirt',
          quantite: 1,
          prixUnitaire: 35,
          montant: 35,
          devise: 'EUR',
          codeProduit: 'TSH001',
        },
        {
          description: 'Casquette',
          quantite: 2,
          prixUnitaire: 15,
          montant: 30,
          devise: 'EUR',
          codeProduit: 'CAP002',
        },
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lignes).toHaveLength(2);
    }
  });

  it('should reject ligne without codeProduit', () => {
    const result = transactionLot2BoutiqueSchema.safeParse({
      ...validBoutiqueData,
      lignes: [
        {
          description: 'T-shirt',
          quantite: 1,
          prixUnitaire: 35,
          montant: 35,
          devise: 'EUR',
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('should reject ligne with empty codeProduit', () => {
    const result = transactionLot2BoutiqueSchema.safeParse({
      ...validBoutiqueData,
      lignes: [
        {
          description: 'T-shirt',
          quantite: 1,
          prixUnitaire: 35,
          montant: 35,
          devise: 'EUR',
          codeProduit: '',
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('should reject empty lignes array', () => {
    const result = transactionLot2BoutiqueSchema.safeParse({
      ...validBoutiqueData,
      lignes: [],
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing compteNom', () => {
    const result = transactionLot2BoutiqueSchema.safeParse({
      compteNumero: validBoutiqueData.compteNumero,
      devise: validBoutiqueData.devise,
      lignes: validBoutiqueData.lignes,
    });

    expect(result.success).toBe(false);
  });
});

describe('paymentSchema', () => {
  it('should validate when MOP total matches transaction total', () => {
    const result = paymentSchema.safeParse({
      mop: [
        { code: 'ESP', montant: 100 },
        { code: 'CB', montant: 180 },
      ],
      totalTransaction: 280,
    });

    expect(result.success).toBe(true);
  });

  it('should validate with single MOP matching total', () => {
    const result = paymentSchema.safeParse({
      mop: [{ code: 'ESP', montant: 280 }],
      totalTransaction: 280,
    });

    expect(result.success).toBe(true);
  });

  it('should accept rounding difference within 0.01', () => {
    const result = paymentSchema.safeParse({
      mop: [
        { code: 'ESP', montant: 100.005 },
        { code: 'CB', montant: 179.999 },
      ],
      totalTransaction: 280,
    });

    expect(result.success).toBe(true);
  });

  it('should reject when MOP total does not match transaction total', () => {
    const result = paymentSchema.safeParse({
      mop: [{ code: 'ESP', montant: 100 }],
      totalTransaction: 280,
    });

    expect(result.success).toBe(false);
  });

  it('should reject empty MOP array', () => {
    const result = paymentSchema.safeParse({
      mop: [],
      totalTransaction: 100,
    });

    expect(result.success).toBe(false);
  });

  it('should reject MOP with zero montant', () => {
    const result = paymentSchema.safeParse({
      mop: [{ code: 'ESP', montant: 0 }],
      totalTransaction: 0,
    });

    expect(result.success).toBe(false);
  });

  it('should reject MOP with empty code', () => {
    const result = paymentSchema.safeParse({
      mop: [{ code: '', montant: 100 }],
      totalTransaction: 100,
    });

    expect(result.success).toBe(false);
  });

  it('should reject negative totalTransaction', () => {
    const result = paymentSchema.safeParse({
      mop: [{ code: 'ESP', montant: -100 }],
      totalTransaction: -100,
    });

    expect(result.success).toBe(false);
  });
});

describe('bilateralPaymentSchema', () => {
  it('should validate with different source and destination accounts', () => {
    const result = bilateralPaymentSchema.safeParse({
      compteSource: 100,
      compteDestination: 200,
      montantSource: 280,
      montantDestination: 280,
    });

    expect(result.success).toBe(true);
  });

  it('should reject identical source and destination accounts', () => {
    const result = bilateralPaymentSchema.safeParse({
      compteSource: 100,
      compteDestination: 100,
      montantSource: 280,
      montantDestination: 280,
    });

    expect(result.success).toBe(false);
  });

  it('should reject zero compteSource', () => {
    const result = bilateralPaymentSchema.safeParse({
      compteSource: 0,
      compteDestination: 200,
      montantSource: 280,
      montantDestination: 280,
    });

    expect(result.success).toBe(false);
  });

  it('should reject negative montantSource', () => {
    const result = bilateralPaymentSchema.safeParse({
      compteSource: 100,
      compteDestination: 200,
      montantSource: -280,
      montantDestination: 280,
    });

    expect(result.success).toBe(false);
  });

  it('should reject zero montantDestination', () => {
    const result = bilateralPaymentSchema.safeParse({
      compteSource: 100,
      compteDestination: 200,
      montantSource: 280,
      montantDestination: 0,
    });

    expect(result.success).toBe(false);
  });

  it('should allow different montant values for source and destination', () => {
    const result = bilateralPaymentSchema.safeParse({
      compteSource: 100,
      compteDestination: 200,
      montantSource: 280,
      montantDestination: 310, // different currency conversion
    });

    expect(result.success).toBe(true);
  });
});
