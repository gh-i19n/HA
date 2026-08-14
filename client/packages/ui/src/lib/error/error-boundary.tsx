"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { MainButton } from "../button";

interface Properties {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * A React error boundary: catches render/lifecycle errors thrown by its
 * `children` subtree and shows a fallback message with a "Retry" button
 * instead of letting the error crash the whole page. Must be a class
 * component — `getDerivedStateFromError`/`componentDidCatch` have no hook
 * equivalent yet. Clicking Retry clears the error state and re-renders the
 * children, giving them a fresh chance to succeed.
 */
class ErrorBoundary extends Component<Properties, State> {
  constructor(properties: Properties) {
    super(properties);
    this.state = { hasError: false };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by Error Boundary:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-lg bg-surface-subtle p-6 shadow-md">
          <h2 className="text-xl font-semibold text-danger">
            Something went wrong.
          </h2>
          <p className="text-foreground-muted">Please try again.</p>
          <MainButton
            onClick={this.handleRetry}
            className="mt-4 bg-primary text-primary-foreground transition hover:bg-primary-hover"
          >
            Retry
          </MainButton>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
