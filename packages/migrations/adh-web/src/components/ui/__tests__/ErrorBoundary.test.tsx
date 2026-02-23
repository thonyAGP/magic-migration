// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

function ThrowingComponent({ message }: { message: string }) {
  throw new Error(message);
}

function SafeComponent() {
  return <div>Safe content</div>;
}

// Suppress console.error for expected errors
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  it('should render children normally when no error', () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('should display default fallback UI on error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent message="Test crash" />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();
  });

  it('should display the error message', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent message="Something broke" />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something broke')).toBeInTheDocument();
  });

  it('should have retry button that resets hasError state', () => {
    let shouldThrow = true;

    function ConditionalComponent() {
      if (shouldThrow) throw new Error('Crash');
      return <div>Recovered</div>;
    }

    render(
      <ErrorBoundary>
        <ConditionalComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();
    expect(screen.getByText('Reessayer')).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByText('Reessayer'));
    expect(screen.getByText('Recovered')).toBeInTheDocument();
  });

  it('should use custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent message="Crash" />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    expect(screen.queryByText('Une erreur est survenue')).not.toBeInTheDocument();
  });
});
