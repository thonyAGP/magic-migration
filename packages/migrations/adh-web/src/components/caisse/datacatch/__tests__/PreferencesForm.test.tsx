// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreferencesForm } from '../PreferencesForm';
import type { CustomerPreferences } from '@/types/datacatch';

const mockInitialData: CustomerPreferences = {
  languePreferee: 'Anglais',
  consentementMarketing: true,
  newsletter: false,
  consentementCommunication: true,
  activitesPreferees: ['Sport', 'Culture'],
};

describe('PreferencesForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render checkboxes and select', () => {
    render(
      <PreferencesForm onSave={vi.fn()} onBack={vi.fn()} />,
    );

    expect(screen.getByText('Preferences et consentements')).toBeDefined();
    expect(screen.getByText('Langue preferee')).toBeDefined();
    expect(screen.getByText('Consentement marketing')).toBeDefined();
    expect(screen.getByText('Newsletter')).toBeDefined();
    expect(screen.getByText('Consentement communication')).toBeDefined();
    expect(screen.getByText('Sport')).toBeDefined();
    expect(screen.getByText('Bien-etre')).toBeDefined();
    expect(screen.getByText('Culture')).toBeDefined();
  });

  it('should pre-fill from initialData', () => {
    render(
      <PreferencesForm
        initialData={mockInitialData}
        onSave={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    const langueSelect = screen.getByDisplayValue('Anglais') as HTMLSelectElement;
    expect(langueSelect.value).toBe('Anglais');

    const marketingCheckbox = screen.getByLabelText('Consentement marketing') as HTMLInputElement;
    expect(marketingCheckbox.checked).toBe(true);

    const newsletterCheckbox = screen.getByLabelText('Newsletter') as HTMLInputElement;
    expect(newsletterCheckbox.checked).toBe(false);
  });

  it('should call onSave with preferences data', () => {
    const onSave = vi.fn();
    render(
      <PreferencesForm
        initialData={mockInitialData}
        onSave={onSave}
        onBack={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Suivant'));
    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        languePreferee: 'Anglais',
        consentementMarketing: true,
      }),
    );
  });

  it('should handle activity multi-select toggle', () => {
    const onSave = vi.fn();
    render(
      <PreferencesForm onSave={onSave} onBack={vi.fn()} />,
    );

    // Toggle Sport on
    fireEvent.click(screen.getByLabelText('Sport'));
    // Toggle Detente on
    fireEvent.click(screen.getByLabelText('Detente'));

    fireEvent.click(screen.getByText('Suivant'));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        activitesPreferees: expect.arrayContaining(['Sport', 'Detente']),
      }),
    );
  });
});
