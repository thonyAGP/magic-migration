import type { DialogProps } from "@/components/ui/Dialog";

export interface HeaderPanelProps {
  className?: string;
}

export const HeaderPanel = ({ className }: HeaderPanelProps) => {
  return (
    <div className={className}>
      <h2 className="text-lg font-semibold">Raisons d'utilisation du compte</h2>
    </div>
  );
};