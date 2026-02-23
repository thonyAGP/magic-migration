import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Button, Dialog, Input } from '@/components/ui';
import { useSaisieDateStore, getTitre } from '@/stores/saisieDateStore';
import { useAuthStore } from '@/stores';
import { cn } from '@/lib/utils';

export function SaisieDatePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const dateMin = useSaisieDateStore((s) => s.dateMin);
  const dateMax = useSaisieDateStore((s) => s.dateMax);
  const isValid = useSaisieDateStore((s) => s.isValid);
  const errorMessage = useSaisieDateStore((s) => s.errorMessage);
  const setDateMin = useSaisieDateStore((s) => s.setDateMin);
  const setDateMax = useSaisieDateStore((s) => s.setDateMax);
  const submitDates = useSaisieDateStore((s) => s.submitDates);
  const cancel = useSaisieDateStore((s) => s.cancel);
  const reset = useSaisieDateStore((s) => s.reset);

  const [titre, setTitre] = useState('Saisie dates');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(true);

  useEffect(() => {
    getTitre().then(setTitre);
    return () => reset();
  }, [reset]);

  const handleDateMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setDateMin(value ? new Date(value) : null);
    },
    [setDateMin],
  );

  const handleDateMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setDateMax(value ? new Date(value) : null);
    },
    [setDateMax],
  );

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    const result = await submitDates();
    setIsSubmitting(false);

    if (result) {
      setShowDialog(false);
      navigate('/caisse/menu');
    }
  }, [submitDates, navigate]);

  const handleCancel = useCallback(() => {
    cancel();
    setShowDialog(false);
    navigate('/caisse/menu');
  }, [cancel, navigate]);

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <ScreenLayout>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <div className="space-y-6 w-full max-w-md">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-on-surface">{titre}</h2>
            <p className="text-sm text-on-surface-muted">
              Date actuelle: {currentDate}
            </p>
            {user && (
              <p className="text-xs text-on-surface-muted">
                Opérateur: {user.prenom} {user.nom}
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {errorMessage}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="date-min" className="block text-sm font-medium text-on-surface">
                Du:
              </label>
              <Input
                id="date-min"
                type="date"
                value={formatDateForInput(dateMin)}
                onChange={handleDateMinChange}
                className={cn(
                  'w-full',
                  errorMessage && !isValid && 'border-red-500',
                )}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="date-max" className="block text-sm font-medium text-on-surface">
                Au:
              </label>
              <Input
                id="date-max"
                type="date"
                value={formatDateForInput(dateMax)}
                onChange={handleDateMaxChange}
                className={cn(
                  'w-full',
                  errorMessage && !isValid && 'border-red-500',
                )}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              onClick={handleCancel}
              variant="secondary"
              disabled={isSubmitting}
            >
              Abandonner
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? 'Validation...' : 'OK'}
            </Button>
          </div>
        </div>
      </Dialog>
    </ScreenLayout>
  );
}

export default SaisieDatePage;
