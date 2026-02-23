import { z } from 'zod';

export const garantieDepotSchema = z.object({
  codeAdherent: z.number().positive('Code adherent requis'),
  filiation: z.number().min(0, 'Filiation invalide'),
  montant: z.number().positive('Montant doit etre positif'),
  devise: z.string().min(1, 'Devise requise').max(3),
  description: z.string().min(3, 'Description requise (3 car. min)').max(500),
  dateExpiration: z.string().optional(),
});

export const garantieVersementSchema = z.object({
  montant: z.number().positive('Montant doit etre positif'),
  motif: z.string().min(3, 'Motif requis (3 car. min)').max(200),
});

export const garantieRetraitSchema = z.object({
  montant: z.number().positive('Montant doit etre positif'),
  motif: z.string().min(3, 'Motif requis (3 car. min)').max(200),
});

export const garantieCancelSchema = z.object({
  motif: z.string().min(3, 'Motif requis (3 car. min)').max(200),
});

export type GarantieDepotFormData = z.infer<typeof garantieDepotSchema>;
export type GarantieVersementFormData = z.infer<typeof garantieVersementSchema>;
export type GarantieRetraitFormData = z.infer<typeof garantieRetraitSchema>;
export type GarantieCancelFormData = z.infer<typeof garantieCancelSchema>;
