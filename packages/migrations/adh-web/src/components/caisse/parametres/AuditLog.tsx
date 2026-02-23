import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Input, Label, Badge, Select, SelectOption } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useParametresStore } from '@/stores/parametresStore';
import type { AuditLogFilter } from '@/types/admin';
import type { AuditLogProps } from './types';

const SEVERITY_VARIANT: Record<string, 'default' | 'warning' | 'destructive'> = {
  info: 'default',
  warning: 'warning',
  error: 'destructive',
};

const SEVERITY_LABEL: Record<string, string> = {
  info: 'Info',
  warning: 'Avertissement',
  error: 'Erreur',
};

const PAGE_SIZE = 10;

export function AuditLog({ className }: AuditLogProps) {
  const { auditLogs, auditTotal, loadAuditLogs, isLoadingAudit } = useParametresStore();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userId, setUserId] = useState('');
  const [module, setModule] = useState('');
  const [severity, setSeverity] = useState('');
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(auditTotal / PAGE_SIZE));

  const buildFilter = useCallback(
    (p: number): AuditLogFilter => ({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      userId: userId || undefined,
      module: module || undefined,
      severity: severity || undefined,
      page: p,
      pageSize: PAGE_SIZE,
    }),
    [dateFrom, dateTo, userId, module, severity],
  );

  useEffect(() => {
    loadAuditLogs(buildFilter(1));
    setPage(1);
    // Only reload when filter values change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, userId, module, severity]);

  const handlePrev = useCallback(() => {
    if (page <= 1) return;
    const newPage = page - 1;
    setPage(newPage);
    loadAuditLogs(buildFilter(newPage));
  }, [page, buildFilter, loadAuditLogs]);

  const handleNext = useCallback(() => {
    if (page >= totalPages) return;
    const newPage = page + 1;
    setPage(newPage);
    loadAuditLogs(buildFilter(newPage));
  }, [page, totalPages, buildFilter, loadAuditLogs]);

  const formatDate = (ts: string) => {
    try {
      return new Date(ts).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-semibold">Journal d'audit</h3>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3 md:grid-cols-5">
        <div className="space-y-1">
          <Label className="text-xs">Date debut</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Date fin</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Utilisateur</Label>
          <Input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="ID utilisateur"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Module</Label>
          <Input
            type="text"
            value={module}
            onChange={(e) => setModule(e.target.value)}
            placeholder="Module"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Severite</Label>
          <Select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <SelectOption value="">Toutes</SelectOption>
            <SelectOption value="info">Info</SelectOption>
            <SelectOption value="warning">Avertissement</SelectOption>
            <SelectOption value="error">Erreur</SelectOption>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" data-testid="audit-table">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-2 py-2 font-medium">Date</th>
              <th className="px-2 py-2 font-medium">Utilisateur</th>
              <th className="px-2 py-2 font-medium">Action</th>
              <th className="px-2 py-2 font-medium">Module</th>
              <th className="px-2 py-2 font-medium">Details</th>
              <th className="px-2 py-2 font-medium">Severite</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingAudit ? (
              <tr>
                <td colSpan={6} className="px-2 py-4 text-center text-on-surface-muted">
                  Chargement...
                </td>
              </tr>
            ) : auditLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-2 py-4 text-center text-on-surface-muted">
                  Aucune entree
                </td>
              </tr>
            ) : (
              auditLogs.map((entry) => (
                <tr key={entry.id} className="border-b border-border/50 hover:bg-surface-dim" data-testid={`audit-row-${entry.id}`}>
                  <td className="px-2 py-2 whitespace-nowrap">{formatDate(entry.timestamp)}</td>
                  <td className="px-2 py-2">{entry.userName}</td>
                  <td className="px-2 py-2">{entry.action}</td>
                  <td className="px-2 py-2">{entry.module}</td>
                  <td className="px-2 py-2 max-w-[200px] truncate" title={entry.details}>
                    {entry.details}
                  </td>
                  <td className="px-2 py-2">
                    <Badge variant={SEVERITY_VARIANT[entry.severity]} data-testid={`severity-${entry.id}`}>
                      {SEVERITY_LABEL[entry.severity] ?? entry.severity}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-on-surface-muted">
          {auditTotal} entree{auditTotal !== 1 ? 's' : ''} — Page {page}/{totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrev}
            disabled={page <= 1 || isLoadingAudit}
            data-testid="audit-prev"
          >
            <ChevronLeft className="h-4 w-4" />
            Precedent
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleNext}
            disabled={page >= totalPages || isLoadingAudit}
            data-testid="audit-next"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
