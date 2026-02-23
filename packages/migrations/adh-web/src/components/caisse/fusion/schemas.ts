import { z } from 'zod';

export const fusionAccountSchema = z.object({
  codeAdherent: z.number().positive('Code adherent requis'),
  filiation: z.number().min(0, 'Filiation invalide'),
});

export const fusionConfirmSchema = z.object({
  confirmation: z.literal(true, {
    errorMap: () => ({ message: 'Confirmation requise' }),
  }),
});

export type FusionAccountFormData = z.infer<typeof fusionAccountSchema>;
export type FusionConfirmFormData = z.infer<typeof fusionConfirmSchema>;
