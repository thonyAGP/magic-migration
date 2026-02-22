import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface FiltersPanelProps {
  societe: string;
  dateDebut: Date | null;
  dateFin: Date | null;
  onSocieteChange: (value: string) => void;
  onDateDebutChange: (value: Date | null) => void;
  onDateFinChange: (value: Date | null) => void;
  onSearch: () => void;
  className?: string;
}

export const FiltersPanel = ({
  societe,
  dateDebut,
  dateFin,
  onSocieteChange,
  onDateDebutChange,
  onDateFinChange,
  onSearch,
  className,
}: FiltersPanelProps) => {
  const [prefixe, setPrefixe] = useState('');

  const handleDateDebutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onDateDebutChange(value ? new Date(value) : null);
  };

  const handleDateFinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onDateFinChange(value ? new Date(value) : null);
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className={cn('flex flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4', className)}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="societe" className="text-sm font-medium text-gray-700">
            Société
          </label>
          <select
            id="societe"
            value={societe}
            onChange={(e) => onSocieteChange(e.target.value)}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Toutes</option>
            <option value="PVE">PVE</option>
            <option value="CAR">CAR</option>
            <option value="SKI">SKI</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="prefixe" className="text-sm font-medium text-gray-700">
            Préfixe
          </label>
          <Input
            id="prefixe"
            type="text"
            value={prefixe}
            onChange={(e) => setPrefixe(e.target.value)}
            placeholder="Ex: 01"
            className="h-10"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="dateDebut" className="text-sm font-medium text-gray-700">
            Date début
          </label>
          <Input
            id="dateDebut"
            type="date"
            value={formatDateForInput(dateDebut)}
            onChange={handleDateDebutChange}
            className="h-10"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="dateFin" className="text-sm font-medium text-gray-700">
            Date fin
          </label>
          <Input
            id="dateFin"
            type="date"
            value={formatDateForInput(dateFin)}
            onChange={handleDateFinChange}
            className="h-10"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onSearch} className="h-10 px-6">
          Rechercher
        </Button>
      </div>
    </div>
  );
};