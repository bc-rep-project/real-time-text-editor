'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { PropsWithChildren } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface AuthProviderProps extends PropsWithChildren {
  // Add any additional props here if needed
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </SessionProvider>
  );
}

class ErrorBoundary extends React.Component<
  PropsWithChildren,
  { hasError: boolean; error?: Error }
> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full px-4">
            <ErrorMessage
              message={this.state.error?.message || 'An authentication error occurred'}
              onRetry={this.handleRetry}
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 