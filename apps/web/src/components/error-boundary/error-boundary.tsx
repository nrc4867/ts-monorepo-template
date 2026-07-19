import { Component, type ErrorInfo, type ReactNode } from 'react';

import { reportError } from '../../service/report-error.js';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo): void {
    reportError(error, { componentStack: info.componentStack });
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      // Fallback for when rendering itself has already failed — deliberately
      // not routed through i18next, which may be part of what broke.
      // eslint-disable-next-line i18next/no-literal-string
      return this.props.fallback ?? <p>Something went wrong.</p>;
    }
    return this.props.children;
  }
}
