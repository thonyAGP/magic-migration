// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserSettings } from '../UserSettings';

const mockUpdatePassword = vi.fn();

vi.mock('@/stores/parametresStore', () => ({
  useParametresStore: vi.fn(() => ({
    profile: {
      id: 'USR001',
      login: 'jdupont',
      nom: 'Dupont',
      prenom: 'Jean',
      role: 'caissier',
      lastLogin: '2026-02-10T08:30:00Z',
      passwordExpiry: '2026-05-10',
    },
    updatePassword: mockUpdatePassword,
    isSaving: false,
  })),
}));

describe('UserSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdatePassword.mockResolvedValue(true);
  });

  it('should render profile info in read-only mode', () => {
    render(<UserSettings />);

    expect(screen.getByTestId('profile-nom')).toHaveTextContent('Dupont');
    expect(screen.getByTestId('profile-prenom')).toHaveTextContent('Jean');
    expect(screen.getByTestId('profile-login')).toHaveTextContent('jdupont');
    expect(screen.getByTestId('profile-role')).toHaveTextContent('caissier');
  });

  it('should render password change form', () => {
    render(<UserSettings />);

    expect(screen.getByLabelText('Mot de passe actuel')).toBeInTheDocument();
    expect(screen.getByLabelText('Nouveau mot de passe')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmer le mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /changer le mot de passe/i })).toBeInTheDocument();
  });

  it('should show validation error when passwords do not match', async () => {
    render(<UserSettings />);

    fireEvent.change(screen.getByLabelText('Mot de passe actuel'), { target: { value: 'OldPass1' } });
    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: 'NewPass1A' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'DifferentPass1' } });
    fireEvent.click(screen.getByRole('button', { name: /changer le mot de passe/i }));

    await waitFor(() => {
      expect(screen.getByText('Les mots de passe ne correspondent pas')).toBeInTheDocument();
    });
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  it('should show validation error when new password is too short', async () => {
    render(<UserSettings />);

    fireEvent.change(screen.getByLabelText('Mot de passe actuel'), { target: { value: 'OldPass1' } });
    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: 'Ab1' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'Ab1' } });
    fireEvent.click(screen.getByRole('button', { name: /changer le mot de passe/i }));

    await waitFor(() => {
      expect(screen.getByText(/minimum 8 caracteres/i)).toBeInTheDocument();
    });
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  it('should call updatePassword on valid submit', async () => {
    render(<UserSettings />);

    fireEvent.change(screen.getByLabelText('Mot de passe actuel'), { target: { value: 'OldPass1' } });
    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: 'NewPass1A' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'NewPass1A' } });
    fireEvent.click(screen.getByRole('button', { name: /changer le mot de passe/i }));

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith('OldPass1', 'NewPass1A', 'NewPass1A');
    });
  });

  it('should display success message after password change', async () => {
    mockUpdatePassword.mockResolvedValue(true);
    render(<UserSettings />);

    fireEvent.change(screen.getByLabelText('Mot de passe actuel'), { target: { value: 'OldPass1' } });
    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: 'NewPass1A' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'NewPass1A' } });
    fireEvent.click(screen.getByRole('button', { name: /changer le mot de passe/i }));

    await waitFor(() => {
      expect(screen.getByTestId('password-message')).toHaveTextContent('Mot de passe modifie avec succes');
    });
  });

  it('should display error message when password change fails', async () => {
    mockUpdatePassword.mockResolvedValue(false);
    render(<UserSettings />);

    fireEvent.change(screen.getByLabelText('Mot de passe actuel'), { target: { value: 'OldPass1' } });
    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: 'NewPass1A' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'NewPass1A' } });
    fireEvent.click(screen.getByRole('button', { name: /changer le mot de passe/i }));

    await waitFor(() => {
      expect(screen.getByTestId('password-message')).toHaveTextContent('Erreur lors du changement de mot de passe');
    });
  });
});
