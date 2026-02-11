import { z } from 'zod';

// Validation caracteres interdits (IDE 84)
const SAFE_TEXT_REGEX = /^[a-zA-Z0-9\s\-_.,:;!?'éèêëàâäîïôöùûüçÉÈÊËÀÂÄÎÏÔÖÙÛÜÇ€]+$/;

export const safeTextSchema = z.string().regex(SAFE_TEXT_REGEX, 'Caractères spéciaux non autorisés');

// Schema ligne GP
const transactionLineGPSchema = z.object({
  description: z.string().min(1, 'Description obligatoire').regex(SAFE_TEXT_REGEX, 'Caractères spéciaux non autorisés'),
  quantite: z.number().positive('Quantite doit etre superieure a 0'),
  prixUnitaire: z.number().min(0, 'Prix unitaire doit etre positif ou nul'),
  montant: z.number(),
  devise: z.string().min(1, 'Devise obligatoire'),
});

// Schema ligne Boutique (codeProduit obligatoire)
const transactionLineBoutiqueSchema = z.object({
  description: z.string().min(1, 'Description obligatoire').regex(SAFE_TEXT_REGEX, 'Caractères spéciaux non autorisés'),
  quantite: z.number().positive('Quantite doit etre superieure a 0'),
  prixUnitaire: z.number().min(0, 'Prix unitaire doit etre positif ou nul'),
  montant: z.number(),
  devise: z.string().min(1, 'Devise obligatoire'),
  codeProduit: z.string().min(1, 'Code produit requis en mode Boutique'),
});

// Identite VRL
const vrlIdentitySchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prenom requis'),
  typeDocument: z.string().min(1, 'Type de document requis'),
  numeroDocument: z.string().min(1, 'Numero de document requis'),
});

// Schema GP : articleType obligatoire, VRL identity conditionnelle, forfait conditionnel
export const transactionLot2GPSchema = z
  .object({
    compteNumero: z.string().min(1, 'Numero de compte requis'),
    compteNom: z.string().min(1, 'Nom de compte requis'),
    articleType: z.enum(['VRL', 'VSL', 'ANN', 'TRF', 'PYR', 'default']),
    devise: z.string().min(1, 'Devise obligatoire'),
    lignes: z
      .array(transactionLineGPSchema)
      .min(1, 'Au moins une ligne requise'),
    commentaire: z.string().regex(SAFE_TEXT_REGEX, 'Caractères spéciaux non autorisés').optional().or(z.literal('')),
    vrlIdentity: vrlIdentitySchema.optional(),
    forfaitDateDebut: z.string().optional(),
    forfaitDateFin: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.articleType === 'VRL' && !data.vrlIdentity) return false;
      return true;
    },
    {
      message: 'Identite VRL requise pour les articles VRL',
      path: ['vrlIdentity'],
    },
  );

// Schema Boutique : codeProduit obligatoire par ligne
export const transactionLot2BoutiqueSchema = z.object({
  compteNumero: z.string().min(1, 'Numero de compte requis'),
  compteNom: z.string().min(1, 'Nom de compte requis'),
  devise: z.string().min(1, 'Devise obligatoire'),
  lignes: z
    .array(transactionLineBoutiqueSchema)
    .min(1, 'Au moins une ligne requise'),
  commentaire: z.string().regex(SAFE_TEXT_REGEX, 'Caractères spéciaux non autorisés').optional().or(z.literal('')),
});

// Schema paiement
export const paymentSchema = z
  .object({
    mop: z
      .array(
        z.object({
          code: z.string().min(1, 'Code MOP requis'),
          montant: z.number().positive('Montant doit etre positif'),
        }),
      )
      .min(1, 'Au moins un moyen de paiement requis'),
    totalTransaction: z.number().positive('Total doit etre positif'),
  })
  .refine(
    (data) => {
      const totalMOP = data.mop.reduce((sum, m) => sum + m.montant, 0);
      return Math.abs(totalMOP - data.totalTransaction) < 0.01;
    },
    {
      message:
        'Le total des reglements doit correspondre au total de la transaction',
    },
  );

// Schema bilateral
export const bilateralPaymentSchema = z
  .object({
    compteSource: z.number().positive('Compte source requis'),
    compteDestination: z.number().positive('Compte destination requis'),
    montantSource: z.number().positive('Montant source requis'),
    montantDestination: z.number().positive('Montant destination requis'),
  })
  .refine(
    (data) => data.compteSource !== data.compteDestination,
    {
      message: 'Les comptes source et destination doivent etre differents',
    },
  );

export type TransactionLot2GPInput = z.infer<typeof transactionLot2GPSchema>;
export type TransactionLot2BoutiqueInput = z.infer<
  typeof transactionLot2BoutiqueSchema
>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type BilateralPaymentInput = z.infer<typeof bilateralPaymentSchema>;
