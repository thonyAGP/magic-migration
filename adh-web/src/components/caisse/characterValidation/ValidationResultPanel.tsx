import { cn } from '@/lib/utils';
import type { ValidationResult } from '@/types/characterValidation';

interface ValidationResultPanelProps {
  result: ValidationResult | null;
  className?: string;
}

export const ValidationResultPanel = ({ result, className }: ValidationResultPanelProps) => {
  if (!result) {
    return (
      <div
        className={cn(
          'rounded-lg border border-gray-200 bg-gray-50 p-6 text-center',
          className
        )}
      >
        <p className="text-sm text-gray-500">
          Aucun résultat de validation disponible
        </p>
      </div>
    );
  }

  const { isValid, invalidCharacters, position } = result;

  return (
    <div
      className={cn(
        'rounded-lg border p-6',
        isValid
          ? 'border-green-200 bg-green-50'
          : 'border-red-200 bg-red-50',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {isValid ? (
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <h3
              className={cn(
                'text-lg font-semibold',
                isValid ? 'text-green-800' : 'text-red-800'
              )}
            >
              {isValid ? 'Validation réussie' : 'Validation échouée'}
            </h3>
            <p
              className={cn(
                'mt-1 text-sm',
                isValid ? 'text-green-700' : 'text-red-700'
              )}
            >
              {isValid
                ? 'Le texte ne contient aucun caractère interdit'
                : 'Le texte contient des caractères interdits'}
            </p>
          </div>

          {!isValid && invalidCharacters && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-red-800">
                  Caractère(s) interdit(s) :
                </span>
                <span className="rounded bg-red-100 px-3 py-1 font-mono text-sm font-bold text-red-900">
                  {invalidCharacters}
                </span>
              </div>

              {position !== null && position >= 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-red-800">
                    Position :
                  </span>
                  <span className="rounded bg-red-100 px-3 py-1 font-mono text-sm font-bold text-red-900">
                    {position}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};