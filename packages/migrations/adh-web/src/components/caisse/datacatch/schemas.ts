import { z } from 'zod';

export const customerSearchSchema = z
  .object({
    nom: z.string().optional(),
    prenom: z.string().optional(),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    telephone: z.string().optional(),
  })
  .refine(
    (data) => data.nom || data.prenom || data.email || data.telephone,
    { message: 'Au moins un critere de recherche requis' },
  );

export const personalInfoSchema = z.object({
  civilite: z.enum(['M', 'Mme', 'Autre']),
  nom: z.string().min(1, 'Nom requis').max(100),
  prenom: z.string().min(1, 'Prenom requis').max(100),
  dateNaissance: z.string().min(1, 'Date de naissance requise'),
  nationalite: z.string().min(1, 'Nationalite requise').max(50),
  typeIdentite: z.enum(['passeport', 'carte_identite', 'permis']),
  numeroIdentite: z.string().min(1, "Numero d'identite requis").max(50),
});

export const addressSchema = z.object({
  adresse: z.string().min(1, 'Adresse requise').max(200),
  complement: z.string().max(200).optional().default(''),
  codePostal: z.string().min(1, 'Code postal requis').max(10),
  ville: z.string().min(1, 'Ville requise').max(100),
  pays: z.string().min(1, 'Pays requis').max(50),
  telephone: z.string().min(1, 'Telephone requis').max(20),
  email: z.string().email('Email invalide'),
});

export const preferencesSchema = z.object({
  languePreferee: z.string().min(1, 'Langue requise'),
  consentementMarketing: z.boolean(),
  newsletter: z.boolean(),
  consentementCommunication: z.boolean(),
  activitesPreferees: z.array(z.string()),
});

export type CustomerSearchFormData = z.infer<typeof customerSearchSchema>;
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type PreferencesFormData = z.infer<typeof preferencesSchema>;
