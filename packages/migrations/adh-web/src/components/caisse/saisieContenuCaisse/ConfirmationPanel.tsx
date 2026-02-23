import type { PersistanceResult } from "@/types/saisieContenuCaisse";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface ConfirmationPanelProps {
  result: PersistanceResult | null;
  onPrintTicket?: () => void;
  onReturn: () => void;
  className?: string;
}

export const ConfirmationPanel = ({
  result,
  onPrintTicket,
  onReturn,
  className,
}: ConfirmationPanelProps) => {
  if (!result) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 rounded-lg border border-green-200 bg-green-50 p-8",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-green-900">
          Comptage enregistré avec succès
        </h2>
      </div>

      <div className="text-center text-sm text-green-700">
        <p>Session: {result.sessionId}</p>
        <p>
          Date:{" "}
          {new Date(result.timestamp).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="flex gap-3">
        {result.ticketUrl && onPrintTicket && (
          <Button
            variant="primary"
            size="lg"
            onClick={onPrintTicket}
            className="min-w-[160px]"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Imprimer ticket
          </Button>
        )}

        <Button
          variant="secondary"
          size="lg"
          onClick={onReturn}
          className="min-w-[160px]"
        >
          Retour
        </Button>
      </div>
    </div>
  );
};