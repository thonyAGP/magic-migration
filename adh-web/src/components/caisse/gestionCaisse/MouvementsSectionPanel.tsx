import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { DataGrid } from '@/components/ui/DataGrid';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import { cn } from '@/lib/utils';

interface MouvementsSectionPanelProps {
  className?: string;
}

interface MouvementRow {
  id: string;
  date: string;
  type: string;
  montant: number;
  devise: string;
  reference: string;
  description: string;
}

const MOCK_MOUVEMENTS: MouvementRow[] = [
  {
    id: '1',
    date: '2026-02-22 09:15',
    type: 'Ouverture',
    montant: 5000.00,
    devise: 'EUR',
    reference: 'OUV-001',
    description: 'Ouverture de caisse'
  },
  {
    id: '2',
    date: '2026-02-22 10:30',
    type: 'Vente',
    montant: 150.00,
    devise: 'EUR',
    reference: 'VTE-042',
    description: 'Vente Gift Pass'
  },
  {
    id: '3',
    date: '2026-02-22 11:45',
    type: 'Change',
    montant: 200.00,
    devise: 'USD',
    reference: 'CHG-018',
    description: 'Change devise USD->EUR'
  },
  {
    id: '4',
    date: '2026-02-22 14:20',
    type: 'Depot',
    montant: 1000.00,
    devise: 'EUR',
    reference: 'DEP-005',
    description: 'Depot garantie'
  }
];

export const MouvementsSectionPanel: FC<MouvementsSectionPanelProps> = ({ className }) => {
  const [mouvements, setMouvements] = useState<MouvementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const isRealApi = useDataSourceStore((state) => state.isRealApi);

  useEffect(() => {
    const fetchMouvements = async () => {
      setLoading(true);
      try {
        if (isRealApi) {
          const response = await apiClient.get<ApiResponse<MouvementRow[]>>('/api/caisse/mouvements');
          if (response.data.success && response.data.data) {
            setMouvements(response.data.data);
          } else {
            setMouvements([]);
          }
        } else {
          await new Promise(resolve => setTimeout(resolve, 300));
          setMouvements(MOCK_MOUVEMENTS);
        }
      } catch (error) {
        console.error('Failed to fetch mouvements:', error);
        setMouvements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMouvements();
  }, [isRealApi]);

  const columns = [
    { key: 'date', header: 'Date/Heure', width: '180px' },
    { key: 'type', header: 'Type', width: '120px' },
    { key: 'montant', header: 'Montant', width: '120px', align: 'right' as const },
    { key: 'devise', header: 'Devise', width: '80px' },
    { key: 'reference', header: 'Référence', width: '120px' },
    { key: 'description', header: 'Description', width: 'auto' }
  ];

  const formatRow = (row: MouvementRow) => ({
    date: row.date,
    type: row.type,
    montant: row.montant.toFixed(2),
    devise: row.devise,
    reference: row.reference,
    description: row.description
  });

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Mouvements de Caisse</h3>
        <div className="text-sm text-gray-600">
          {mouvements.length} mouvement{mouvements.length !== 1 ? 's' : ''}
        </div>
      </div>

      <DataGrid
        columns={columns}
        data={mouvements.map(formatRow)}
        loading={loading}
        emptyMessage="Aucun mouvement enregistré"
        className="h-[400px]"
      />
    </div>
  );
};