import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

interface ResortCreditDisplayPanelProps {
  societe: number;
  compte: number;
  filiation: number;
  className?: string;
}

interface SoldeResortCredit {
  societe: number;
  compte: number;
  filiation: number;
  service: string;
  attribue: number;
  utilise: number;
  solde: number;
}

type GetSoldeResortCreditResponse = ApiResponse<SoldeResortCredit[]>;

const MOCK_RESORT_CREDITS: SoldeResortCredit[] = [
  {
    societe: 1,
    compte: 12345,
    filiation: 1,
    service: 'SPA',
    attribue: 500.0,
    utilise: 150.0,
    solde: 350.0,
  },
  {
    societe: 1,
    compte: 12345,
    filiation: 1,
    service: 'RESTAURANT',
    attribue: 1000.0,
    utilise: 450.0,
    solde: 550.0,
  },
  {
    societe: 1,
    compte: 12345,
    filiation: 1,
    service: 'BAR',
    attribue: 300.0,
    utilise: 300.0,
    solde: 0.0,
  },
];

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const ResortCreditDisplayPanel: FC<ResortCreditDisplayPanelProps> = ({
  societe,
  compte,
  filiation,
  className,
}) => {
  const [soldes, setSoldes] = useState<SoldeResortCredit[]>([]);
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const isRealApi = useDataSourceStore((s) => s.isRealApi);

  useEffect(() => {
    const fetchSolde = async () => {
      setIsLoading(true);

      if (!isRealApi) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setSoldes(MOCK_RESORT_CREDITS);
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get<GetSoldeResortCreditResponse>(
          `/api/ventes/solde-resortcredit/${societe}/${compte}/${filiation}`,
        );

        if (response.data.success && response.data.data) {
          setSoldes(response.data.data);
        } else {
          setSoldes([]);
        }
      } catch {
        setSoldes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolde();
  }, [societe, compte, filiation, isRealApi]);

  const services = ['ALL', ...new Set(soldes.map((s) => s.service))];

  const filteredSoldes =
    selectedService === 'ALL'
      ? soldes
      : soldes.filter((s) => s.service === selectedService);

  const totalSolde = filteredSoldes.reduce((sum, s) => sum + s.solde, 0);

  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded border border-gray-300 bg-white p-4 shadow-sm',
          className,
        )}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-8 w-full rounded bg-gray-200" />
          <div className="h-10 w-48 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (soldes.length === 0) {
    return (
      <div
        className={cn(
          'rounded border border-gray-300 bg-white p-4 shadow-sm',
          className,
        )}
      >
        <div className="text-sm text-gray-500">Aucun resort credit trouvé</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded border border-gray-300 bg-white p-4 shadow-sm',
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Solde Resort Credit
        </label>

        {services.length > 2 && (
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {services.map((service) => (
              <option key={service} value={service}>
                {service === 'ALL' ? 'Tous les services' : service}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="space-y-2">
        {filteredSoldes.map((solde, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-3 py-2"
          >
            <span className="text-sm font-medium text-gray-700">
              {solde.service}
            </span>
            <span
              className={cn(
                'font-mono text-base font-semibold',
                solde.solde > 0 ? 'text-green-600' : 'text-gray-500',
              )}
            >
              {formatCurrency(solde.solde)} €
            </span>
          </div>
        ))}

        {filteredSoldes.length > 1 && (
          <div className="mt-3 flex items-center justify-between border-t border-gray-300 pt-2">
            <span className="text-sm font-semibold text-gray-800">Total</span>
            <span className="font-mono text-lg font-bold text-gray-900">
              {formatCurrency(totalSolde)} €
            </span>
          </div>
        )}
      </div>
    </div>
  );
};