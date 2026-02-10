import { z } from 'zod';

export const separationAccountSchema = z.object({
  codeAdherent: z.number().positive('Code adherent requis'),
  filiation: z.number().min(0, 'Filiation invalide'),
});

export const separationConfirmSchema = z.object({
  confirmation: z.literal(true, {
    errorMap: () => ({ message: 'Confirmation requise' }),
  }),
});

export type SeparationAccountFormData = z.infer<typeof separationAccountSchema>;
export type SeparationConfirmFormData = z.infer<typeof separationConfirmSchema>;
