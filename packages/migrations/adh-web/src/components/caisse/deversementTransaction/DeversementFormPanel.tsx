import { useState } from 'react';
import { Input, Button } from '@/components/ui';
import type { VenteType } from '@/types/deversementTransaction';

interface DeversementFormPanelProps {
  className?: string;
  onDeverser?: (_data: {
    societe: string;
    compte: string;
    filiation: number;
    montant: number;
    annulation: boolean;
    typeVente: VenteType | null;
  }) => void;
  disabled?: boolean;
}

export const DeversementFormPanel = ({
  className,
  onDeverser,
  disabled = false,
}: DeversementFormPanelProps) => {
  const [societe, setSociete] = useState('');
  const [compte, setCompte] = useState('');
  const [filiation, setFiliation] = useState('');
  const [montant, setMontant] = useState('');
  const [annulation, setAnnulation] = useState(false);
  const [typeVente, setTypeVente] = useState<VenteType | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!societe || !compte || !filiation || !montant) {
      return;
    }

    const filiationNum = parseInt(filiation, 10);
    const montantNum = parseFloat(montant);

    if (isNaN(filiationNum) || isNaN(montantNum)) {
      return;
    }

    onDeverser?.({
      societe,
      compte,
      filiation: filiationNum,
      montant: montantNum,
      annulation,
      typeVente,
    });
  };

  const isFormValid = societe && compte && filiation && montant && !isNaN(parseFloat(montant));

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6${className ? ` ${className}` : ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label htmlFor="societe" className="text-sm font-medium text-gray-700">
              Société
            </label>
            <Input
              id="societe"
              value={societe}
              onChange={(e) => setSociete(e.target.value.toUpperCase())}
              disabled={disabled}
              maxLength={3}
              placeholder="ABC"
              className="uppercase"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="compte" className="text-sm font-medium text-gray-700">
              Compte
            </label>
            <Input
              id="compte"
              value={compte}
              onChange={(e) => setCompte(e.target.value)}
              disabled={disabled}
              maxLength={10}
              placeholder="0000000000"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="filiation" className="text-sm font-medium text-gray-700">
              Filiation
            </label>
            <Input
              id="filiation"
              type="number"
              value={filiation}
              onChange={(e) => setFiliation(e.target.value)}
              disabled={disabled}
              min={0}
              max={99}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="montant" className="text-sm font-medium text-gray-700">
              Montant
            </label>
            <Input
              id="montant"
              type="number"
              step="0.01"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              disabled={disabled}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="typeVente" className="text-sm font-medium text-gray-700">
              Type de vente
            </label>
            <select
              id="typeVente"
              value={typeVente || ''}
              onChange={(e) => setTypeVente((e.target.value || null) as VenteType | null)}
              disabled={disabled}
              className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Aucun</option>
              <option value="standard">Standard</option>
              <option value="VRL">VRL</option>
              <option value="VSL">VSL</option>
              <option value="OD">OD</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="annulation"
            checked={annulation}
            onChange={(e) => setAnnulation(e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
          />
          <label htmlFor="annulation" className="text-sm font-medium text-gray-700">
            Annulation
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={disabled || !isFormValid}
            className="min-w-32"
          >
            Déverser
          </Button>
        </div>
      </form>
    </div>
  );
};