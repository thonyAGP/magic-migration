import type { ArticleApport } from "@/types/apportArticles";
import { DataGrid } from "@/components/ui";
import { Button } from "@/components/ui";
import type { Column } from "@/components/ui/DataGrid";
import { cn } from "@/lib/utils";

interface ArticlesGridPanelProps {
  articles: ArticleApport[];
  deviseCode: string;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  className?: string;
}

export const ArticlesGridPanel = ({
  articles,
  deviseCode,
  onEdit,
  onDelete,
  className,
}: ArticlesGridPanelProps) => {
  const columns: Column<ArticleApport>[] = [
    {
      key: "articleCode",
      header: "Code Article",
      width: "150px",
    },
    {
      key: "libelle",
      header: "Libellé",
      width: "1fr",
    },
    {
      key: "quantite",
      header: "Quantité",
      width: "100px",
      align: "right",
      render: (value) => value.toLocaleString("fr-FR"),
    },
    {
      key: "prixUnitaire",
      header: `Prix Unit. (${deviseCode})`,
      width: "120px",
      align: "right",
      render: (value) => value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
      key: "montant",
      header: `Montant (${deviseCode})`,
      width: "120px",
      align: "right",
      render: (value) => value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
      key: "actions",
      header: "Actions",
      width: "150px",
      align: "center",
      render: (_value, _row, index) => (
        <div className="flex gap-2 justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(index)}
            className="h-8 px-3"
          >
            Modifier
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(index)}
            className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <DataGrid<ArticleApport>
        data={articles}
        columns={columns}
        emptyMessage="Aucun article ajouté"
        className="border rounded-lg"
      />
    </div>
  );
};