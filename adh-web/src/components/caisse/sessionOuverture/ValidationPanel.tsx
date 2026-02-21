import type { SoldeParMOP, DeviseSession, SessionEcart } from "@/types/sessionOuverture";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

interface ValidationPanelProps {
  soldeParMOP: SoldeParMOP;
  devises: DeviseSession[];
  ecart: SessionEcart | null;
  onConfirm: () => void;
  onBack: () => void;
  isLoading?: boolean;
  className?: string;
}

export const ValidationPanel = ({
  soldeParMOP,
  devises,
  ecart,
  onConfirm,
  onBack,
  isLoading = false,
  className,
}: ValidationPanelProps) => {
  const hasEcart = ecart !== null && ecart.montantTotal !== 0;
  const hasMultiDevise = devises.length > 1;

  const formatCurrency = (value: number, deviseCode?: string) => {
    const devise = deviseCode || "EUR";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: devise,
    }).format(value);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Récapitulatif par Moyen de Paiement
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="font-medium text-gray-700">Monnaie</span>
            <span className="font-mono text-gray-900">
              {formatCurrency(soldeParMOP.monnaie)}
            </span>
          </div>
          
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="font-medium text-gray-700">Produits</span>
            <span className="font-mono text-gray-900">
              {formatCurrency(soldeParMOP.produits)}
            </span>
          </div>
          
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="font-medium text-gray-700">Cartes</span>
            <span className="font-mono text-gray-900">
              {formatCurrency(soldeParMOP.cartes)}
            </span>
          </div>
          
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="font-medium text-gray-700">Chèques</span>
            <span className="font-mono text-gray-900">
              {formatCurrency(soldeParMOP.cheques)}
            </span>
          </div>
          
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="font-medium text-gray-700">OD</span>
            <span className="font-mono text-gray-900">
              {formatCurrency(soldeParMOP.od)}
            </span>
          </div>
          
          <div className="flex justify-between border-t-2 border-gray-300 pt-3">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-lg font-mono font-bold text-gray-900">
              {formatCurrency(soldeParMOP.total)}
            </span>
          </div>
        </div>
      </div>

      {hasMultiDevise && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Détail par Devise
          </h3>
          
          <div className="space-y-4">
            {devises.map((devise) => (
              <div
                key={devise.deviseCode}
                className="rounded border border-gray-100 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">
                    {devise.deviseCode}
                  </span>
                  {devise.existeEcart && (
                    <span className="flex items-center gap-1 text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      Écart détecté
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Initial:</span>
                    <span className="ml-2 font-mono text-gray-900">
                      {formatCurrency(devise.nbInitial, devise.deviseCode)}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Apport:</span>
                    <span className="ml-2 font-mono text-gray-900">
                      {formatCurrency(devise.nbApport, devise.deviseCode)}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Compté:</span>
                    <span className="ml-2 font-mono text-gray-900">
                      {formatCurrency(devise.nbCompte, devise.deviseCode)}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Calculé:</span>
                    <span className="ml-2 font-mono text-gray-900">
                      {formatCurrency(devise.nbCalcule, devise.deviseCode)}
                    </span>
                  </div>
                  
                  {devise.existeEcart && (
                    <>
                      <div className="col-span-2">
                        <span className="text-gray-600">Écart:</span>
                        <span className="ml-2 font-mono font-semibold text-amber-600">
                          {formatCurrency(devise.nbEcart, devise.deviseCode)}
                        </span>
                      </div>
                      
                      {devise.commentaireEcart && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Commentaire:</span>
                          <span className="ml-2 text-gray-700">
                            {devise.commentaireEcart}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasEcart && ecart && (
        <div className="rounded-lg border-2 border-amber-400 bg-amber-50 p-6">
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-900">
              Écart Détecté
            </h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-amber-800">Montant écart:</span>
              <span className="font-mono font-semibold text-amber-900">
                {formatCurrency(ecart.montantTotal)}
              </span>
            </div>
            
            {ecart.nbDevises > 0 && (
              <div className="flex justify-between">
                <span className="text-amber-800">Devises concernées:</span>
                <span className="font-semibold text-amber-900">
                  {ecart.nbDevises}
                </span>
              </div>
            )}
            
            {ecart.commentaire && (
              <div className="mt-3 border-t border-amber-200 pt-3">
                <span className="block text-amber-800">Commentaire:</span>
                <span className="mt-1 block text-amber-900">
                  {ecart.commentaire}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {!hasEcart && (
        <div className="rounded-lg border-2 border-green-400 bg-green-50 p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Comptage validé sans écart</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-6">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isLoading}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>

        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="gap-2 bg-blue-600 px-8 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Ouverture en cours...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Confirmer l'ouverture
            </>
          )}
        </Button>
      </div>
    </div>
  );
};