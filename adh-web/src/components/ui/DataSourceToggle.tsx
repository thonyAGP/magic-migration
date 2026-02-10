import { useDataSourceStore } from '@/stores/dataSourceStore';
import { Database, Cloud } from 'lucide-react';

export function DataSourceToggle({ className }: { className?: string }) {
  const { isRealApi, toggle } = useDataSourceStore();

  return (
    <button
      onClick={toggle}
      className={[
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
        isRealApi
          ? 'bg-green-100 text-green-800 border border-green-300'
          : 'bg-amber-100 text-amber-800 border border-amber-300',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      title={isRealApi ? 'Mode API reelle (backend)' : 'Mode Mock (donnees fictives)'}
    >
      {isRealApi ? (
        <>
          <Cloud className="w-3.5 h-3.5" />
          <span>API</span>
        </>
      ) : (
        <>
          <Database className="w-3.5 h-3.5" />
          <span>Mock</span>
        </>
      )}
    </button>
  );
}
