import type { Article } from "@/types/articleZoom"
import { useArticleZoomStore } from "@/stores/articleZoomStore"
import { Button } from "@/components/ui"
import { cn } from "@/lib/utils"

interface FooterPanelProps {
  className?: string
  onSelect?: (article: Article) => void
  onQuit?: () => void
}

export const FooterPanel = ({ className, onSelect, onQuit }: FooterPanelProps) => {
  const { selectedArticle } = useArticleZoomStore()

  const handleSelect = () => {
    if (selectedArticle && onSelect) {
      onSelect(selectedArticle)
    }
  }

  const handleQuit = () => {
    if (onQuit) {
      onQuit()
    }
  }

  return (
    <div className={cn("flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50", className)}>
      <Button
        variant="outline"
        onClick={handleQuit}
        className="px-6 py-2"
      >
        Quitter
      </Button>
      <Button
        onClick={handleSelect}
        disabled={!selectedArticle}
        className="px-6 py-2"
      >
        Sélectionner
      </Button>
    </div>
  )
}