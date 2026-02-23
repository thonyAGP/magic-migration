import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useDataSourceStore } from "@/stores/dataSourceStore";
import { apiClient } from "@/services/api/apiClient";
import type { ApiResponse } from "@/services/api/apiClient";

interface AlertesSectionPanelProps {
  className?: string;
}

interface SessionConcurrente {
  sessionId: number;
  operateurNom: string;
  dateOuverture: string;
  terminal: string;
  montantCoffre: number;
}

interface IntegriteCoffre {
  statut: "OK" | "ALERTE" | "ERREUR";
  message: string;
  ecartDetecte: number;
  dernierControle: string;
}

export const AlertesSectionPanel = ({ className }: AlertesSectionPanelProps) => {
  const [sessionsConcurrentes, setSessionsConcurrentes] = useState<SessionConcurrente[]>([]);
  const [integriteCoffre, setIntegriteCoffre] = useState<IntegriteCoffre | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isRealApi = useDataSourceStore((state) => state.isRealApi);

  useEffect(() => {
    const fetchAlertes = async () => {
      setIsLoading(true);
      try {
        if (isRealApi) {
          const [sessionsResp, integriteResp] = await Promise.all([
            apiClient.get<ApiResponse<SessionConcurrente[]>>("/api/sessions/concurrentes"),
            apiClient.get<ApiResponse<IntegriteCoffre>>("/api/coffre/integrite"),
          ]);
          if (sessionsResp.success) setSessionsConcurrentes(sessionsResp.data);
          if (integriteResp.success) setIntegriteCoffre(integriteResp.data);
        } else {
          setSessionsConcurrentes([
            {
              sessionId: 1042,
              operateurNom: "MARTIN Sophie",
              dateOuverture: "2026-02-22T08:30:00",
              terminal: "CAISSE-02",
              montantCoffre: 2500.0,
            },
          ]);
          setIntegriteCoffre({
            statut: "ALERTE",
            message: "Écart détecté sur devise USD",
            ecartDetecte: 15.5,
            dernierControle: "2026-02-22T14:30:00",
          });
        }
      } catch (error) {
        console.error("Erreur chargement alertes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlertes();
  }, [isRealApi]);

  const getIntegriteColor = (statut: IntegriteCoffre["statut"]) => {
    if (statut === "OK") return "text-green-600";
    if (statut === "ALERTE") return "text-yellow-600";
    return "text-red-600";
  };

  const getIntegriteBgColor = (statut: IntegriteCoffre["statut"]) => {
    if (statut === "OK") return "bg-green-50 border-green-200";
    if (statut === "ALERTE") return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  if (isLoading) {
    return (
      <div className={cn("p-4 bg-white rounded-lg border border-gray-200", className)}>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Chargement des alertes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 bg-white rounded-lg border border-gray-200 space-y-4", className)}>
      <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Alertes et Contrôles
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Sessions Concurrentes</h3>
          {sessionsConcurrentes.length === 0 ? (
            <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded border border-gray-200">
              Aucune session concurrente détectée
            </div>
          ) : (
            <div className="space-y-2">
              {sessionsConcurrentes.map((session) => (
                <div
                  key={session.sessionId}
                  className="p-3 bg-orange-50 border border-orange-200 rounded flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-orange-900">
                        {session.operateurNom}
                      </span>
                      <span className="text-xs text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                        {session.terminal}
                      </span>
                    </div>
                    <div className="text-xs text-orange-700">
                      Session #{session.sessionId} • Ouverture:{" "}
                      {new Date(session.dateOuverture).toLocaleString("fr-FR")} • Coffre:{" "}
                      {session.montantCoffre.toFixed(2)} €
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-6 h-6 bg-orange-200 text-orange-800 rounded-full text-xs font-bold">
                    !
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Intégrité Coffre</h3>
          {integriteCoffre ? (
            <div
              className={cn(
                "p-3 rounded border",
                getIntegriteBgColor(integriteCoffre.statut)
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={cn("text-sm font-medium", getIntegriteColor(integriteCoffre.statut))}>
                  {integriteCoffre.statut}
                </span>
                <span className="text-xs text-gray-600">
                  Dernier contrôle:{" "}
                  {new Date(integriteCoffre.dernierControle).toLocaleString("fr-FR")}
                </span>
              </div>
              <div className="text-sm text-gray-700">{integriteCoffre.message}</div>
              {integriteCoffre.ecartDetecte !== 0 && (
                <div className="text-xs text-gray-600 mt-1">
                  Écart: {integriteCoffre.ecartDetecte > 0 ? "+" : ""}
                  {integriteCoffre.ecartDetecte.toFixed(2)} €
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded border border-gray-200">
              Aucune donnée d'intégrité disponible
            </div>
          )}
        </div>
      </div>
    </div>
  );
};