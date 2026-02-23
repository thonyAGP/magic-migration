import { z } from 'zod';

const transactionLineSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description obligatoire'),
  quantite: z.number().min(1, 'Quantite doit etre superieure a 0'),
  prixUnitaire: z.number().min(0, 'Prix unitaire doit etre positif ou nul'),
  montant: z.number(),
  devise: z.string().min(1, 'Devise obligatoire'),
  codeProduit: z.string().optional(),
});

const baseSchema = z.object({
  compteNumero: z.string().min(1, 'Numero de compte obligatoire'),
  compteNom: z.string().min(1, 'Nom du compte obligatoire'),
  devise: z
    .string()
    .length(3, 'Code devise sur 3 caracteres')
    .regex(/^[A-Z]{3}$/, 'Code devise invalide (ex: EUR, USD)'),
  dateTransaction: z.string().min(1, 'Date obligatoire'),
  lignes: z.array(transactionLineSchema).min(1, 'Au moins une ligne obligatoire'),
  commentaire: z.string().max(500, 'Commentaire limite a 500 caracteres').optional().default(''),
  mode: z.enum(['GP', 'Boutique']),
});

export const transactionGPSchema = baseSchema.refine(
  (data) => {
    const total = data.lignes.reduce((sum, l) => sum + l.montant, 0);
    return total > 0;
  },
  { message: 'Le montant total doit etre superieur a 0', path: ['lignes'] },
);

export const transactionBoutiqueSchema = baseSchema
  .refine(
    (data) =>
      data.lignes.every(
        (l) => l.codeProduit !== undefined && l.codeProduit !== '',
      ),
    {
      message: 'Code produit obligatoire pour chaque ligne en mode Boutique',
      path: ['lignes'],
    },
  )
  .refine(
    (data) => {
      const total = data.lignes.reduce((sum, l) => sum + l.montant, 0);
      return total > 0;
    },
    { message: 'Le montant total doit etre superieur a 0', path: ['lignes'] },
  );

export type TransactionFormSchema = z.infer<typeof baseSchema>;
