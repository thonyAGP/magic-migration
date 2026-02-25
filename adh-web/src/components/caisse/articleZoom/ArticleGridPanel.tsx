import type { Article } from "@/types/articleZoom"
import { useArticleZoomStore } from "@/stores/articleZoomStore"
import { cn } from "@/lib/utils"

interface ArticleGridPanelProps {
  className?: string
  onArticleSelect?: (article: Article) => void
}

export const ArticleGridPanel = ({ className, onArticleSelect }: ArticleGridPanelProps) => {
  const {
    articles,
    isLoading,
    error,
    selectedArticle,
    validateServiceVillage,
    checkPassageCondition,
    validateCompositeCondition
  } = useArticleZoomStore()

  const handleArticleClick = (article: Article) => {
    onArticleSelect?.(article)
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <div className="text-gray-500">Chargement des articles...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <div className="text-red-500">Erreur: {error}</div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <div className="text-gray-500">Aucun article trouvé</div>
      </div>
    )
  }

  return (
    <div className={cn("h-full overflow-auto", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {articles.map((article) => {
          const isValidService = validateServiceVillage(article.serviceVillage || "")
          const isPassageValid = checkPassageCondition(article.passage)
          const isCompositeValid = validateCompositeCondition(
            article.imputation?.toString() || "",
            article.sousImputation?.toString() || ""
          )
          const isSelected = selectedArticle?.codeArticle === article.codeArticle

          return (
            <div
              key={article.codeArticle}
              onClick={() => handleArticleClick(article)}
              className={cn(
                "border border-gray-200 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
                isSelected && "ring-2 ring-blue-500 bg-blue-50",
                !isValidService && "opacity-50",
                !isPassageValid && "border-orange-300",
                !isCompositeValid && "border-red-300"
              )}
            >
              <div className="space-y-2">
                <div className="font-semibold text-sm text-gray-900">
                  Code: {article.codeArticle}
                </div>
                <div className="text-sm text-gray-700 line-clamp-2">
                  {article.libelleArticle}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Prix: {article.prixUnitaire}€</span>
                  {article.serviceVillage && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {isValidService}
                    </span>
                  )}
                </div>
                {(article.imputation || article.sousImputation) && (
                  <div className="text-xs text-gray-500">
                    Imp: {article.imputation} / {article.sousImputation}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {article.passage && (
                    <span className={cn(
                      "px-2 py-1 rounded text-xs",
                      isPassageValid ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                    )}>
                      Passage
                    </span>
                  )}
                  {article.masqueMontant && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                      {article.masqueMontant}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}