import { Button } from "@/components/ui"
import { cn } from "@/lib/utils"

export interface ActionsPanelProps {
  onGenerate: (memberCode: string) => Promise<void>
  onCancel: () => void
  isProcessing: boolean
  memberCode: string
}

export const ActionsPanel = ({
  onGenerate,
  onCancel,
  isProcessing,
  memberCode
}: ActionsPanelProps) => {
  const handleGenerate = async () => {
    if (memberCode.trim()) {
      await onGenerate(memberCode)
    }
  }

  return (
    <div className="flex gap-4 items-center justify-between p-4 bg-gray-100/50 rounded-lg">
      <Button
        variant="primary"
        disabled={isProcessing || !memberCode.trim()}
        onClick={handleGenerate}
        className={cn(
          "w-full max-w-[200px]",
          isProcessing && "opacity-50 cursor-not-allowed"
        )}
      >
        {isProcessing ? "Génération en cours..." : "Générer"}
      </Button>
      <Button
        variant="secondary"
        disabled={isProcessing}
        onClick={onCancel}
        className={cn(
          "w-full max-w-[200px]",
          isProcessing && "opacity-50 cursor-not-allowed"
        )}
      >
        Annuler
      </Button>
    </div>
  )
}