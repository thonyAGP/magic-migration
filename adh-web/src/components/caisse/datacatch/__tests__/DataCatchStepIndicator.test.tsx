// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataCatchStepIndicator } from '../DataCatchStepIndicator';
import type { DataCatchStep } from '@/types/datacatch';

const steps: DataCatchStep[] = ['welcome', 'search', 'personal', 'address', 'preferences', 'review'];

// Translated labels (fr locale)
const stepLabels = ['Accueil', 'Recherche', 'Identite', 'Adresse', 'Preferences', 'Verification'];

describe('DataCatchStepIndicator', () => {
  it('should render all step labels', () => {
    render(
      <DataCatchStepIndicator currentStep="personal" steps={steps} />,
    );

    for (const label of stepLabels) {
      expect(screen.getByText(label)).toBeDefined();
    }
  });

  it('should highlight current step', () => {
    render(
      <DataCatchStepIndicator currentStep="personal" steps={steps} />,
    );

    // Current step (index 2) should show step number 3
    expect(screen.getByText('3')).toBeDefined();
  });

  it('should show step numbers for future steps', () => {
    render(
      <DataCatchStepIndicator currentStep="welcome" steps={steps} />,
    );

    // All steps should show numbers 1-6 since first step is current
    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
  });

  it('should render connector lines between steps', () => {
    const { container } = render(
      <DataCatchStepIndicator currentStep="search" steps={steps} />,
    );

    // There should be (steps.length - 1) connector lines
    const connectors = container.querySelectorAll('.h-0\\.5');
    expect(connectors.length).toBe(steps.length - 1);
  });

  it('should handle last step as current', () => {
    render(
      <DataCatchStepIndicator currentStep="review" steps={steps} />,
    );

    // Step 6 should be current
    expect(screen.getByText('6')).toBeDefined();
  });
});
