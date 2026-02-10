import { z } from 'zod';

export const passValidationSchema = z.object({
  numeroPass: z.string().min(1, 'Numero de pass requis').max(20),
  montantTransaction: z.number().positive('Montant doit etre positif'),
});

export const passScanSchema = z.object({
  numeroPass: z.string().min(1, 'Numero de pass requis').max(20),
});

export type PassValidationFormData = z.infer<typeof passValidationSchema>;
export type PassScanFormData = z.infer<typeof passScanSchema>;
