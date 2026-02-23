import { z } from 'zod';

export const changeOperationSchema = z.object({
  type: z.enum(['achat', 'vente']),
  deviseCode: z.string().min(1, 'Devise requise').max(3),
  montant: z.number().positive('Montant doit etre positif'),
  taux: z.number().positive('Taux doit etre positif'),
  modePaiement: z.string().min(1, 'Mode de paiement requis'),
});

export const cancellationSchema = z.object({
  motif: z.string().min(3, 'Motif requis (3 caracteres min)').max(200),
});

export type ChangeOperationFormData = z.infer<typeof changeOperationSchema>;
export type CancellationFormData = z.infer<typeof cancellationSchema>;
