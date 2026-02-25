import { useCallback, useEffect } from "react"
import type { Article } from "@/types/articleZoom"
import { useArticleZoomStore } from "@/stores/articleZoomStore"
import { ScreenLayout } from "@/components/layout"
import { Button, Input } from "@/components/ui"
import { cn } from "@/lib/utils"

export const ArticleZoomPage = () => {
  const {
    articles,
    isLoading,
    error,
    selectedArticle,
    titreEcran,
    searchFilter,
    validateServiceVillage,
    checkPassageCondition,
    validateCompositeCondition,
    loadArticles,
    selectArticle,
    loadTitle,
    reset
  } = useArticleZoomStore()

  const handleSearchChange = useCallback((value: string) => {
    useArticleZoomStore.setState({ searchFilter: value })
  }, [])

  const handleSearchSubmit = useCallback(() => {
    loadArticles()
  }, [loadArticles])

  const handleArticleSelect = useCallback((article: Article) => {
    selectArticle(article)
  }, [selectArticle])

  const handleQuit = useCallback(() => {
    reset()
  }, [reset])

  useEffect(() => {
    loadTitle()
    loadArticles()

    return () => {
      reset()
    }
  }, [loadTitle, loadArticles, reset])

  const renderArticleGrid = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement des articles...</div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Erreur: {error}</div>
        </div>
      )
    }

    if (articles.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Aucun article trouvé</div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => {
          const isValidService = validateServiceVillage(article.serviceVillage || "")
          const passageValid = checkPassageCondition(article.passage)
          const compositeValid = validateCompositeCondition(
            article.imputation?.toString() || "",
            article.sousImputation?.toString() || ""
          )

          return (
            <div
              key={article.codeArticle}
              className={cn(
                "border rounded-lg p-4 cursor-pointer transition-colors",
                selectedArticle?.codeArticle === article.codeArticle
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300",
                !passageValid && "opacity-60"
              )}
              onClick={() => handleArticleSelect(article)}
            >
              <div className="font-semibold text-lg mb-2">
                {article.libelleArticle}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Code: {article.codeArticle}</div>
                <div>Prix: {article.prixUnitaire.toFixed(2)}€</div>
                {article.serviceVillage && (
                  <div className={cn(
                    "font-medium",
                    isValidService ? "text-green-600" : "text-red-600"
                  )}>
                    Service: {article.serviceVillage}
                  </div>
                )}
                {article.imputation && (
                  <div>Imputation: {article.imputation}</div>
                )}
                {article.sousImputation && (
                  <div>Sous-imputation: {article.sousImputation}</div>
                )}
                <div className={cn(
                  "text-xs px-2 py-1 rounded inline-block",
                  article.passage
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                )}>
                  {article.passage ? "Passage" : "Fixe"}
                </div>
                {!compositeValid && (
                  <div className="text-xs text-orange-600">
                    Condition composite non valide
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <ScreenLayout className="h-full flex flex-col">
      <div className="flex-1 flex flex-col space-y-6 p-6">
        <div className="flex flex-col space-y-4">
          <div className="text-2xl font-bold text-gray-900">
            {titreEcran || "Articles"}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Rechercher un article..."
              value={searchFilter}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit()
                }
              }}
            />
            <Button 
              onClick={handleSearchSubmit}
              disabled={isLoading}
            >
              Rechercher
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="min-h-full">
            {renderArticleGrid()}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedArticle && (
              <span>
                Sélectionné: {selectedArticle.libelleArticle} - {selectedArticle.prixUnitaire.toFixed(2)}€
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => selectedArticle && handleArticleSelect(selectedArticle)}
              disabled={!selectedArticle || isLoading}
              variant="default"
            >
              Sélectionner
            </Button>
            <Button
              onClick={handleQuit}
              variant="outline"
            >
              Quitter
            </Button>
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}