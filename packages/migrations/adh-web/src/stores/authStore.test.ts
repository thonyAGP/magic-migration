import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    localStorage.clear();
  });

  it('should start with unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should authenticate when login is called', async () => {
    await useAuthStore.getState().login({
      login: 'caissier1',
      password: 'test',
      societe: 'ADH',
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).not.toBeNull();
    expect(state.user?.login).toBe('caissier1');
    expect(state.token).toBe('mock-token');
  });

  it('should clear state when logout is called', async () => {
    // Arrange
    await useAuthStore.getState().login({
      login: 'caissier1',
      password: 'test',
      societe: 'ADH',
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Act
    useAuthStore.getState().logout();

    // Assert
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set user and mark as authenticated when setUser is called', () => {
    const user = {
      id: 42,
      login: 'admin',
      nom: 'Admin',
      prenom: 'Test',
      role: 'admin' as const,
    };

    useAuthStore.getState().setUser(user);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should store token in localStorage when setToken is called', () => {
    useAuthStore.getState().setToken('jwt-abc-123');

    expect(useAuthStore.getState().token).toBe('jwt-abc-123');
    expect(localStorage.getItem('auth_token')).toBe('jwt-abc-123');
  });

  it('should remove auth_token from localStorage when logout is called', () => {
    localStorage.setItem('auth_token', 'old-token');
    useAuthStore.getState().logout();

    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
