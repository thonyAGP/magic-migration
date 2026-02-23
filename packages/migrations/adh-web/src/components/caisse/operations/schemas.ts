import { z } from 'zod';

export const apportCoffreSchema = z.object({
  montant: z.number().positive('Montant doit etre positif'),
  deviseCode: z.string().min(1),
  motif: z.string().min(1, 'Motif obligatoire'),
});

export const apportProduitsSchema = z.object({
  produits: z.array(z.object({
    codeProduit: z.string().min(1, 'Code produit obligatoire'),
    libelle: z.string().min(1, 'Libelle obligatoire'),
    quantite: z.number().int().positive('Quantite positive requise'),
    prixUnitaire: z.number().positive('Prix unitaire positif requis'),
  })).min(1, 'Au moins un produit'),
});

export const remiseCoffreSchema = z.object({
  montant: z.number().positive('Montant doit etre positif'),
  deviseCode: z.string().min(1),
  motif: z.string().min(1, 'Motif obligatoire'),
});

export const telecollecteSchema = z.object({
  terminalId: z.string().min(1, 'Terminal obligatoire'),
});

export const regularisationSchema = z.object({
  montantEcart: z.number(),
  motif: z.string().min(3, 'Motif minimum 3 caracteres'),
  typeRegularisation: z.union([
    z.literal('ajustement_positif'),
    z.literal('ajustement_negatif'),
  ]),
});
