import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAccountOpsStore } from '@/stores';

type AccountOpType = 'changement' | 'solde' | 'telephone';

const OP_TITLES: Record<AccountOpType, string> = {
  changement: 'Changement de compte',
  solde: 'Solde de compte',
  telephone: 'Telephone',
};

const OP_DESCRIPTIONS: Record<AccountOpType, string> = {
  changement: 'Changer le compte adherent',
  solde: 'Consulter le solde du compte',
  telephone: 'Gestion du telephone adherent',
};

export function AccountOpsPage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const opType = (type ?? 'changement') as AccountOpType;
  const societe = 'ADH';

  const { form, resultMessage, error, isLoading, setForm, setOpType, executeOperation, reset } = useAccountOpsStore();

  useEffect(() => {
    setOpType(opType);
  }, [opType, setOpType]);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const title = OP_TITLES[opType] ?? 'Operation compte';
  const description = OP_DESCRIPTIONS[opType] ?? '';

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-lg mx-auto">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-on-surface-muted text-sm mt-1">{description}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {resultMessage && !error && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
            {resultMessage}
          </div>
        )}

        <div className="space-y-4 bg-surface border border-border rounded-lg p-6">
          <div className="space-y-2">
            <Label htmlFor="codeAdherent">Code adherent</Label>
            <Input
              id="codeAdherent"
              type="text"
              value={form.codeAdherent}
              onChange={(e) => setForm('codeAdherent', e.target.value)}
              placeholder="Ex: 1001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filiation">Filiation</Label>
            <Input
              id="filiation"
              type="text"
              value={form.filiation}
              onChange={(e) => setForm('filiation', e.target.value)}
              placeholder="0"
            />
          </div>

          {opType === 'telephone' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="telephone">Telephone fixe</Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={form.telephone}
                  onChange={(e) => setForm('telephone', e.target.value)}
                  placeholder="01 23 45 67 89"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portable">Portable</Label>
                <Input
                  id="portable"
                  type="tel"
                  value={form.portable}
                  onChange={(e) => setForm('portable', e.target.value)}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 justify-between">
          <button
            onClick={() => navigate('/caisse/menu')}
            className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
          >
            Retour au menu
          </button>
          <Button onClick={() => executeOperation(societe)} disabled={isLoading || !form.codeAdherent}>
            {isLoading
              ? 'Chargement...'
              : opType === 'solde'
                ? 'Consulter'
                : opType === 'telephone'
                  ? 'Valider'
                  : 'Executer'}
          </Button>
        </div>
      </div>
    </ScreenLayout>
  );
}
