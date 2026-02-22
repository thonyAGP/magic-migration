import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Input, Button } from '@/components/ui';
import { useAuthenticationStore } from '@/stores/authenticationStore';

export const AuthenticationPage = () => {
  const navigate = useNavigate();

  const matricule = useAuthenticationStore((s) => s.matricule);
  const isLoading = useAuthenticationStore((s) => s.isLoading);
  const error = useAuthenticationStore((s) => s.error);
  const getMatricule = useAuthenticationStore((s) => s.getMatricule);
  const setMatricule = useAuthenticationStore((s) => s.setMatricule);
  const setError = useAuthenticationStore((s) => s.setError);
  const reset = useAuthenticationStore((s) => s.reset);

  const [login, setLogin] = useState('');

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!login.trim()) {
        setError('Le login est requis');
        return;
      }
      await getMatricule(login.trim());
    },
    [login, getMatricule, setError],
  );

  const handleBack = useCallback(() => {
    navigate('/caisse/menu');
  }, [navigate]);

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-md mx-auto">
        <div>
          <h2 className="text-xl font-semibold">Authentification</h2>
          <p className="text-on-surface-muted text-sm mt-1">
            Récupération du matricule par login
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login" className="block text-sm font-medium mb-1">
              Login
            </label>
            <Input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Saisir le login"
              disabled={isLoading}
            />
          </div>

          {matricule && (
            <div className="bg-green-50 border border-green-200 px-4 py-3 rounded-md">
              <p className="text-sm font-medium text-green-800">
                Matricule: <span className="font-mono">{matricule}</span>
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-between">
            <Button
              type="button"
              onClick={handleBack}
              variant="secondary"
              disabled={isLoading}
            >
              Retour
            </Button>
            <Button type="submit" disabled={isLoading || !login.trim()}>
              {isLoading ? 'Chargement...' : 'Récupérer matricule'}
            </Button>
          </div>
        </form>

        {isLoading && (
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
            <p className="text-sm text-on-surface-muted mt-2">Récupération en cours...</p>
          </div>
        )}
      </div>
    </ScreenLayout>
  );
};