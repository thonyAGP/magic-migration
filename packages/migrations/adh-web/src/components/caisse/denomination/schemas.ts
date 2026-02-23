import { z } from 'zod';

export const denominationCountSchema = z.object({
  denominationId: z.number().int().positive(),
  quantite: z.number().int().min(0, 'Quantite doit etre positive ou nulle'),
});

export const countingSubmitSchema = z.object({
  sessionId: z.number().int().positive(),
  type: z.enum(['ouverture', 'fermeture']),
  counts: z.array(denominationCountSchema).min(1, 'Au moins une denomination requise'),
});

export type DenominationCountInput = z.infer<typeof denominationCountSchema>;
export type CountingSubmitInput = z.infer<typeof countingSubmitSchema>;
