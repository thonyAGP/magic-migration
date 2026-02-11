import { z } from 'zod';

export const passCreationSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(100),
  prenom: z.string().min(1, 'Prenom requis').max(100),
  dateNaissance: z.string().min(1, 'Date de naissance requise'),
  villageCode: z.string().min(1, 'Village requis'),
  typePass: z.string().min(1, 'Type de pass requis'),
  plafondJournalier: z.number().positive('Le plafond doit etre positif'),
  dateDebut: z.string().min(1, 'Date de debut requise'),
  dateFin: z.string().min(1, 'Date de fin requise'),
}).refine(
  (data) => data.dateFin > data.dateDebut,
  { message: 'La date de fin doit etre posterieure a la date de debut', path: ['dateFin'] },
);

export type PassCreationFormData = z.infer<typeof passCreationSchema>;
