import type { ClientGm } from "@/types/choixPyr";

export interface HeaderPanelProps {
  clientInfo: ClientGm | null;
  className?: string;
}

export const HeaderPanel = ({ clientInfo, className }: HeaderPanelProps) => {
  const displayName = clientInfo
    ? `${clientInfo.nom}${clientInfo.prenom ? ` ${clientInfo.prenom}` : ''}`
    : 'Client non identifié';

  return (
    <div className={className}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">Client:</span>
          <span className="text-gray-900">{displayName}</span>
        </div>
        <div className="text-sm text-blue-800 italic">
          Veuillez choisir la chambre pour le paiement PYR
        </div>
      </div>
    </div>
  );
};