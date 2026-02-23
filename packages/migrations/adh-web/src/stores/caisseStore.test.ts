import { describe, it, expect, beforeEach } from 'vitest';
import { useCaisseStore } from './caisseStore';
import type { Denomination, CaisseConfig } from '@/types';

const mockDenominations: Denomination[] = [
  { id: 1, deviseCode: 'EUR', valeur: 50, type: 'billet', libelle: '50 EUR' },
  { id: 2, deviseCode: 'EUR', valeur: 20, type: 'billet', libelle: '20 EUR' },
  { id: 3, deviseCode: 'EUR', valeur: 2, type: 'piece', libelle: '2 EUR' },
  { id: 4, deviseCode: 'USD', valeur: 100, type: 'billet', libelle: '100 USD' },
];

const mockConfig: CaisseConfig = {
  id: 1,
  numero: 'C001',
  societe: 'ADH',
  libelle: 'Caisse principale',
  devisePrincipale: 'EUR',
  devisesAutorisees: ['EUR', 'USD'],
};

describe('useCaisseStore', () => {
  beforeEach(() => {
    useCaisseStore.setState({
      config: null,
      denominations: [],
      counting: [],
    });
  });

  it('should start with empty state', () => {
    const state = useCaisseStore.getState();
    expect(state.config).toBeNull();
    expect(state.denominations).toEqual([]);
    expect(state.counting).toEqual([]);
  });

  it('should store config when setConfig is called', () => {
    useCaisseStore.getState().setConfig(mockConfig);

    expect(useCaisseStore.getState().config).toEqual(mockConfig);
  });

  it('should store denominations when setDenominations is called', () => {
    useCaisseStore.getState().setDenominations(mockDenominations);

    expect(useCaisseStore.getState().denominations).toHaveLength(4);
  });

  it('should add a new count entry when updateCount is called for a new denomination', () => {
    useCaisseStore.getState().setDenominations(mockDenominations);
    useCaisseStore.getState().updateCount(1, 3);

    const counting = useCaisseStore.getState().counting;
    expect(counting).toHaveLength(1);
    expect(counting[0]).toEqual({
      denominationId: 1,
      quantite: 3,
      total: 150, // 3 * 50 EUR
    });
  });

  it('should update existing count when updateCount targets the same denomination', () => {
    useCaisseStore.getState().setDenominations(mockDenominations);
    useCaisseStore.getState().updateCount(1, 3);
    useCaisseStore.getState().updateCount(1, 5);

    const counting = useCaisseStore.getState().counting;
    expect(counting).toHaveLength(1);
    expect(counting[0].quantite).toBe(5);
    expect(counting[0].total).toBe(250); // 5 * 50 EUR
  });

  it('should handle multiple denominations independently', () => {
    useCaisseStore.getState().setDenominations(mockDenominations);
    useCaisseStore.getState().updateCount(1, 2); // 2x 50 EUR = 100
    useCaisseStore.getState().updateCount(2, 5); // 5x 20 EUR = 100
    useCaisseStore.getState().updateCount(3, 10); // 10x 2 EUR = 20

    const counting = useCaisseStore.getState().counting;
    expect(counting).toHaveLength(3);
  });

  it('should not add count when denomination does not exist', () => {
    useCaisseStore.getState().setDenominations(mockDenominations);
    useCaisseStore.getState().updateCount(999, 5);

    expect(useCaisseStore.getState().counting).toEqual([]);
  });

  it('should clear all counts when resetCounting is called', () => {
    useCaisseStore.getState().setDenominations(mockDenominations);
    useCaisseStore.getState().updateCount(1, 3);
    useCaisseStore.getState().updateCount(2, 5);
    useCaisseStore.getState().resetCounting();

    expect(useCaisseStore.getState().counting).toEqual([]);
  });

  it('should calculate total by devise correctly with getTotalByDevise', () => {
    useCaisseStore.getState().setDenominations(mockDenominations);
    useCaisseStore.getState().updateCount(1, 2); // 2x 50 EUR = 100
    useCaisseStore.getState().updateCount(2, 5); // 5x 20 EUR = 100
    useCaisseStore.getState().updateCount(4, 3); // 3x 100 USD = 300

    const eurTotal = useCaisseStore.getState().getTotalByDevise('EUR');
    const usdTotal = useCaisseStore.getState().getTotalByDevise('USD');

    expect(eurTotal).toBe(200); // 100 + 100
    expect(usdTotal).toBe(300);
  });

  it('should return 0 for devise with no counts', () => {
    useCaisseStore.getState().setDenominations(mockDenominations);

    expect(useCaisseStore.getState().getTotalByDevise('GBP')).toBe(0);
  });

  describe('getCounting', () => {
    it('should return only entries with quantite > 0', () => {
      useCaisseStore.getState().setDenominations(mockDenominations);
      useCaisseStore.getState().updateCount(1, 3);
      useCaisseStore.getState().updateCount(2, 0);
      useCaisseStore.getState().updateCount(3, 5);

      const result = useCaisseStore.getState().getCounting();

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { denominationId: 1, quantite: 3 },
        { denominationId: 3, quantite: 5 },
      ]);
    });

    it('should return empty array when no counts exist', () => {
      const result = useCaisseStore.getState().getCounting();

      expect(result).toEqual([]);
    });

    it('should strip total from returned entries', () => {
      useCaisseStore.getState().setDenominations(mockDenominations);
      useCaisseStore.getState().updateCount(1, 2);

      const result = useCaisseStore.getState().getCounting();

      expect(result[0]).toEqual({ denominationId: 1, quantite: 2 });
      expect(result[0]).not.toHaveProperty('total');
    });
  });

  describe('isLoadingDenominations', () => {
    it('should start as false', () => {
      expect(useCaisseStore.getState().isLoadingDenominations).toBe(false);
    });
  });
});
