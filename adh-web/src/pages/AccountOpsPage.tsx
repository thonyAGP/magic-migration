import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { accountOpsApi } from '@/services/api/endpoints-lot6';

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

interface FormState {
  codeAdherent: string;
  filiation: string;
  telephone: string;
  portable: string;
}

export function AccountOpsPage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const opType = (type ?? 'changement') as AccountOpType;
  const societe = 'ADH';

  const [form, setForm] = useState<FormState>({
    codeAdherent: '',
    filiation: '0',
    telephone: '',
    portable: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const title = OP_TITLES[opType] ?? 'Operation compte';
  const description = OP_DESCRIPTIONS[opType] ?? '';

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setResultMessage(null);
  };

  const handleSubmit = async () => {
    const code = parseInt(form.codeAdherent, 10);
    const filiation = parseInt(form.filiation, 10);

    if (isNaN(code)) {
      setError('Code adherent invalide');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultMessage(null);

    try {
      if (opType === 'changement') {
        const response = await accountOpsApi.changeAccount(societe, code, filiation);
        setResultMessage(
          response.data.data?.success
            ? 'Changement de compte effectue avec succes'
            : 'Erreur lors du changement de compte',
        );
      } else if (opType === 'solde') {
        const response = await accountOpsApi.getSolde(societe, code, filiation);
        const data = response.data.data;
        setResultMessage(
          data
            ? `Solde: ${data.solde.toFixed(2)} ${data.devise}`
            : 'Impossible de recuperer le solde',
        );
      } else if (opType === 'telephone') {
        if (form.telephone || form.portable) {
          await accountOpsApi.updatePhone(
            societe,
            code,
            filiation,
            form.telephone,
            form.portable,
          );
          setResultMessage('Telephone mis a jour avec succes');
        } else {
          const response = await accountOpsApi.getPhoneInfo(societe, code, filiation);
          const data = response.data.data;
          if (data) {
            setForm((prev) => ({
              ...prev,
              telephone: data.telephone,
              portable: data.portable,
            }));
            setResultMessage('Informations telephone chargees');
          }
        }
      }
    } catch (e: unknown) {
      if (import.meta.env.DEV) {
        if (opType === 'solde') {
          setResultMessage(`Solde: ${(Math.random() * 2000).toFixed(2)} EUR`);
        } else if (opType === 'telephone') {
          setForm((prev) => ({
            ...prev,
            telephone: '01 23 45 67 89',
            portable: '06 12 34 56 78',
          }));
          setResultMessage('Informations telephone chargees (mock)');
        } else {
          setResultMessage('Changement de compte effectue (mock)');
        }
        return;
      }
      const message = e instanceof Error ? e.message : 'Erreur operation';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

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
              onChange={(e) => handleChange('codeAdherent', e.target.value)}
              placeholder="Ex: 1001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filiation">Filiation</Label>
            <Input
              id="filiation"
              type="text"
              value={form.filiation}
              onChange={(e) => handleChange('filiation', e.target.value)}
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
                  onChange={(e) => handleChange('telephone', e.target.value)}
                  placeholder="01 23 45 67 89"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portable">Portable</Label>
                <Input
                  id="portable"
                  type="tel"
                  value={form.portable}
                  onChange={(e) => handleChange('portable', e.target.value)}
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
          <Button onClick={handleSubmit} disabled={isLoading || !form.codeAdherent}>
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
