// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataCatchWelcome } from '../DataCatchWelcome';

describe('DataCatchWelcome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render welcome card with title and description', () => {
    render(
      <DataCatchWelcome onStartNew={vi.fn()} onStartExisting={vi.fn()} />,
    );

    expect(screen.getByText('Saisie client')).toBeDefined();
    expect(
      screen.getByText('Capturer ou mettre a jour les informations client'),
    ).toBeDefined();
  });

  it('should render two action buttons', () => {
    render(
      <DataCatchWelcome onStartNew={vi.fn()} onStartExisting={vi.fn()} />,
    );

    expect(screen.getByText('Nouveau client')).toBeDefined();
    expect(screen.getByText('Client existant')).toBeDefined();
  });

  it('should call onStartNew when clicking nouveau client', () => {
    const onStartNew = vi.fn();
    render(
      <DataCatchWelcome onStartNew={onStartNew} onStartExisting={vi.fn()} />,
    );

    fireEvent.click(screen.getByText('Nouveau client'));
    expect(onStartNew).toHaveBeenCalledOnce();
  });

  it('should call onStartExisting when clicking client existant', () => {
    const onStartExisting = vi.fn();
    render(
      <DataCatchWelcome onStartNew={vi.fn()} onStartExisting={onStartExisting} />,
    );

    fireEvent.click(screen.getByText('Client existant'));
    expect(onStartExisting).toHaveBeenCalledOnce();
  });

  it('should disable buttons when disabled prop is true', () => {
    render(
      <DataCatchWelcome
        onStartNew={vi.fn()}
        onStartExisting={vi.fn()}
        disabled
      />,
    );

    const buttons = screen.getAllByRole('button');
    for (const button of buttons) {
      expect(button).toHaveProperty('disabled', true);
    }
  });
});
