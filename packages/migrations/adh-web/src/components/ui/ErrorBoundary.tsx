import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="text-6xl mb-4" role="img" aria-label="warning">
            Warning
          </div>
          <h2 className="text-xl font-semibold text-on-surface mb-2">
            Une erreur est survenue
          </h2>
          <p className="text-on-surface/60 mb-4 max-w-md">
            {this.state.error?.message || 'Erreur inattendue'}
          </p>
          <Button onClick={this.handleRetry}>Reessayer</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
