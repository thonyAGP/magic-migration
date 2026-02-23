import { useState } from 'react';
import { Button } from '@/components/ui';
import { useFermetureCaisseStore } from '@/stores/fermetureCaisseStore';
import { cn } from '@/lib/utils';

interface TicketsPanelProps {
  societe: string;
  numeroSession: number;
  className?: string;
}

export const TicketsPanel = ({ societe, numeroSession, className }: TicketsPanelProps) => {
  const fermetureValidee = useFermetureCaisseStore((s) => s.fermetureValidee);
  const genererTickets = useFermetureCaisseStore((s) => s.genererTickets);
  const isLoading = useFermetureCaisseStore((s) => s.isLoading);

  const [tickets, setTickets] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenererTickets = async () => {
    setIsGenerating(true);
    try {
      await genererTickets(societe, numeroSession);
      setTickets(['IDE 138 - Ticket fermeture caisse', 'IDE 136 - Ticket apport coffre', 'IDE 154 - Ticket remise caisse']);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Génération des tickets</h3>
        <Button
          onClick={handleGenererTickets}
          disabled={!fermetureValidee || isGenerating || isLoading}
          className="min-w-[160px]"
        >
          {isGenerating ? 'Génération...' : 'Générer tickets'}
        </Button>
      </div>

      {!fermetureValidee && (
        <div className="rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          La fermeture doit être validée avant de générer les tickets
        </div>
      )}

      {tickets.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Tickets générés</h4>
          <div className="rounded border border-gray-200 bg-white">
            <ul className="divide-y divide-gray-200">
              {tickets.map((ticket, index) => (
                <li key={index} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-900">{ticket}</span>
                  <Button variant="ghost" size="sm">
                    Imprimer
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};