import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { DataCatchStepIndicatorProps } from './types';
import type { DataCatchStep } from '@/types/datacatch';

const STEP_LABELS: Record<DataCatchStep, string> = {
  welcome: 'Accueil',
  search: 'Recherche',
  personal: 'Identite',
  address: 'Adresse',
  preferences: 'Preferences',
  review: 'Verification',
  complete: 'Fin',
};

export function DataCatchStepIndicator({
  currentStep,
  steps,
}: DataCatchStepIndicatorProps) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium',
                  isCompleted && 'bg-success text-white',
                  isCurrent && 'bg-primary text-white',
                  !isCompleted && !isCurrent && 'border border-border text-on-surface-muted',
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'mt-1 text-xs',
                  isCurrent ? 'font-medium text-primary' : 'text-on-surface-muted',
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mx-1 h-0.5 w-8 flex-shrink-0',
                  index < currentIndex ? 'bg-success' : 'bg-border',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
