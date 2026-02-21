import type { OuvertureTicketData } from '@/types/sessionOuverture';
import { Button } from '@/components/ui';
import { CheckCircle, Printer, ArrowLeft } from 'lucide-react';

interface SuccesPanelProps {
  sessionChrono: number;
  ticketData: OuvertureTicketData;
  onPrint: () => void;
  onReturnToMenu: () => void;
  isPrinting?: boolean;
  className?: string;
}

export const SuccesPanel = ({
  sessionChrono,
  ticketData,
  onPrint,
  onReturnToMenu,
  isPrinting = false,
  className,
}: SuccesPanelProps) => {
  return (
    <div className={className}>
      <div className="flex flex-col items-center justify-center gap-6 p-8">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            Session ouverte avec succès
          </h2>
          <p className="text-lg text-gray-600">
            Numéro de session : <span className="font-bold text-gray-900">#{sessionChrono}</span>
          </p>
          <p className="text-sm text-gray-500">
            {ticketData.village} - {new Date(ticketData.dateComptable).toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-md mt-4">
          <Button
            onClick={onPrint}
            disabled={isPrinting}
            className="flex items-center justify-center gap-2 py-3"
          >
            <Printer className="w-5 h-5" />
            {isPrinting ? 'Impression en cours...' : 'Imprimer le ticket'}
          </Button>
          
          <Button
            onClick={onReturnToMenu}
            variant="outline"
            className="flex items-center justify-center gap-2 py-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au menu
          </Button>
        </div>
      </div>
    </div>
  );
};