import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { RegularisationDialog } from './RegularisationDialog';
import type { PointageData, RegularisationData } from '@/types/caisseOps';

interface PointageAppRemGridProps {
  data: PointageData;
  onRegularise: (data: RegularisationData) => void;
  deviseCode: string;
}

function ecartColor(ecart: number): string {
  if (ecart === 0) return 'text-green-600';
  if (Math.abs(ecart) <= 5) return 'text-amber-600';
  return 'text-danger';
}

export function PointageAppRemGrid({ data, onRegularise, deviseCode }: PointageAppRemGridProps) {
  const [showRegDialog, setShowRegDialog] = useState(false);

  const totalAttendu = data.comptages.reduce((s, c) => s + c.montantAttendu, 0);
  const totalCompte = data.comptages.reduce((s, c) => s + c.montantCompte, 0);
  const totalEcart = data.comptages.reduce((s, c) => s + c.ecart, 0);

  const handleRegularise = (regData: RegularisationData) => {
    onRegularise(regData);
    setShowRegDialog(false);
  };

  return (
    <div className="space-y-4 bg-surface border border-border rounded-lg p-6">
      <h3 className="text-lg font-medium">Pointage caisse</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 font-medium">Type</th>
              <th className="text-right py-2 px-3 font-medium">Attendu</th>
              <th className="text-right py-2 px-3 font-medium">Compte</th>
              <th className="text-right py-2 px-3 font-medium">Ecart</th>
            </tr>
          </thead>
          <tbody>
            {data.comptages.map((c) => (
              <tr key={c.type} className="border-b border-border/50">
                <td className="py-2 px-3">{c.type}</td>
                <td className="text-right py-2 px-3">{c.montantAttendu.toFixed(2)}</td>
                <td className="text-right py-2 px-3">{c.montantCompte.toFixed(2)}</td>
                <td className={cn('text-right py-2 px-3 font-medium', ecartColor(c.ecart))}>
                  {c.ecart > 0 ? '+' : ''}{c.ecart.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border font-bold">
              <td className="py-2 px-3">Total</td>
              <td className="text-right py-2 px-3">{totalAttendu.toFixed(2)}</td>
              <td className="text-right py-2 px-3">{totalCompte.toFixed(2)}</td>
              <td className={cn('text-right py-2 px-3', ecartColor(totalEcart))}>
                {totalEcart > 0 ? '+' : ''}{totalEcart.toFixed(2)} {deviseCode}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {totalEcart !== 0 && (
        <div className="flex justify-end">
          <Button variant="destructive" onClick={() => setShowRegDialog(true)}>
            Regulariser
          </Button>
        </div>
      )}

      <RegularisationDialog
        open={showRegDialog}
        onClose={() => setShowRegDialog(false)}
        onValidate={handleRegularise}
        ecartMontant={totalEcart}
        deviseCode={deviseCode}
      />
    </div>
  );
}
