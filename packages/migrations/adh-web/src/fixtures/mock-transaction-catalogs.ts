import type {
  MoyenPaiementCatalog,
  ForfaitData,
  EditionConfig,
  PreCheckResult,
} from '@/types/transaction-lot2';

export const MOCK_MOP_CATALOG: MoyenPaiementCatalog[] = [
  {
    code: 'ESP',
    libelle: 'Especes',
    type: 'especes',
    classe: 'A',
    estTPE: false,
  },
  {
    code: 'CB',
    libelle: 'Carte bancaire',
    type: 'carte',
    classe: 'B',
    estTPE: true,
  },
  {
    code: 'CHQ',
    libelle: 'Cheque',
    type: 'cheque',
    classe: 'C',
    estTPE: false,
  },
  {
    code: 'VIR',
    libelle: 'Virement',
    type: 'virement',
    classe: 'D',
    estTPE: false,
  },
  {
    code: 'AMX',
    libelle: 'American Express',
    type: 'carte',
    classe: 'B',
    estTPE: true,
  },
];

export const MOCK_FORFAITS: ForfaitData[] = [
  {
    code: 'SKI6',
    libelle: 'Ski 6 jours',
    dateDebut: new Date().toISOString().slice(0, 10),
    dateFin: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    articleType: 'VRL',
    prixParJour: 45,
    prixForfait: 270,
  },
  {
    code: 'SKI7',
    libelle: 'Ski 7 jours',
    dateDebut: new Date().toISOString().slice(0, 10),
    dateFin: new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10),
    articleType: 'VRL',
    prixParJour: 40,
    prixForfait: 280,
  },
  {
    code: 'SPA3',
    libelle: 'Spa 3 jours',
    dateDebut: new Date().toISOString().slice(0, 10),
    dateFin: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    articleType: 'VSL',
    prixParJour: 60,
    prixForfait: 180,
  },
];

export const MOCK_EDITION_CONFIG: EditionConfig = {
  format: 'PMS28',
  printerId: 1,
  printerName: 'Imprimante Caisse 1',
};

export const MOCK_PRE_CHECK: PreCheckResult = {
  canSell: true,
};
