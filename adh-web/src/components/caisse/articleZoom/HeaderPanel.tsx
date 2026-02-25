import { useCallback } from "react"
import { useArticleZoomStore } from "@/stores/articleZoomStore"
import { Input } from "@/components/ui"
import { cn } from "@/lib/utils"

interface HeaderPanelProps {
  className?: string
}

export const HeaderPanel = ({ className }: HeaderPanelProps) => {
  const { titreEcran, searchFilter, isLoading, loadArticles } = useArticleZoomStore()

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    useArticleZoomStore.setState({ searchFilter: e.target.value })
  }, [])

  const handleSearchKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      loadArticles()
    }
  }, [loadArticles, isLoading])

  return (
    <div className={cn("flex flex-col gap-4 p-4 border-b border-gray-200", className)}>
      <div className="flex items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {titreEcran || "Article Zoom"}
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Rechercher un article..."
          value={searchFilter}
          onChange={handleSearchChange}
          onKeyPress={handleSearchKeyPress}
          disabled={isLoading}
          className="flex-1"
        />
      </div>
    </div>
  )
}