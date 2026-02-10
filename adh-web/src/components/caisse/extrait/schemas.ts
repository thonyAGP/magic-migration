import { z } from 'zod';

export const searchAccountSchema = z.object({
  query: z.string().min(1, 'Saisir un code ou un nom').max(100),
});

export const printExtraitSchema = z.object({
  format: z.enum(['cumule', 'date', 'imputation', 'nom', 'date_imp', 'service']),
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),
});

export type SearchAccountFormData = z.infer<typeof searchAccountSchema>;
export type PrintExtraitFormData = z.infer<typeof printExtraitSchema>;
