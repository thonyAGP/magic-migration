import { useApportArticlesStore } from "@/stores/apportArticlesStore";
import { cn } from "@/lib/utils";

interface TotalSummaryPanelProps {
  className?: string;
}

export const TotalSummaryPanel = ({ className }: TotalSummaryPanelProps) => {
  const total = useApportArticlesStore((s) => s.total);
  const deviseCode = useApportArticlesStore((s) => s.deviseCode);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-6 py-4",
        className
      )}
    >
      <span className="text-lg font-semibold text-slate-900">Total:</span>
      <span className="text-xl font-bold text-blue-600">
        {total.toFixed(2)} {deviseCode}
      </span>
    </div>
  );
};