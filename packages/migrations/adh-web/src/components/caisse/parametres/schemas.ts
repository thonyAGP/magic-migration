import { z } from 'zod';

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
    newPassword: z
      .string()
      .min(8, 'Minimum 8 caracteres')
      .regex(/[A-Z]/, 'Au moins une majuscule')
      .regex(/[0-9]/, 'Au moins un chiffre'),
    confirmPassword: z.string().min(1, 'Confirmation requise'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export const caisseConfigSchema = z.object({
  deviseDefaut: z.string().min(1, 'Devise requise'),
  modeOffline: z.boolean(),
  autoLogoutMinutes: z.number().min(1).max(480),
  imprimanteDefaut: z.string().optional(),
  formatTicket: z.string().optional(),
});

export const networkConfigSchema = z.object({
  apiUrl: z.string().url('URL API invalide'),
  timeout: z.number().min(1000).max(60000),
  retryCount: z.number().min(0).max(10),
  retryDelay: z.number().min(100).max(30000),
  websocketUrl: z.string().url('URL WebSocket invalide'),
  heartbeatInterval: z.number().min(5000).max(120000),
});

export type PasswordFormData = z.infer<typeof passwordSchema>;
export type CaisseConfigFormData = z.infer<typeof caisseConfigSchema>;
export type NetworkConfigFormData = z.infer<typeof networkConfigSchema>;
