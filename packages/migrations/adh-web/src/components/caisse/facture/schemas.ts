import { z } from 'zod';

export const factureLigneSchema = z.object({
  codeArticle: z.string().min(1, 'Code article requis'),
  libelle: z.string().min(1, 'Libelle requis'),
  quantite: z.number().positive('Quantite doit etre positive'),
  prixUnitaireHT: z.number().min(0, 'Prix doit etre positif ou zero'),
  tauxTVA: z.number().min(0).max(100, 'Taux TVA invalide'),
});

export const factureCreateSchema = z.object({
  codeAdherent: z.number().positive('Code adherent requis'),
  filiation: z.number().min(0, 'Filiation invalide'),
  type: z.enum(['facture', 'avoir']),
  commentaire: z.string().max(500).optional(),
});

export const factureValidateSchema = z.object({
  commentaire: z.string().max(500).optional(),
});

export type FactureLigneFormData = z.infer<typeof factureLigneSchema>;
export type FactureCreateFormData = z.infer<typeof factureCreateSchema>;
export type FactureValidateFormData = z.infer<typeof factureValidateSchema>;
