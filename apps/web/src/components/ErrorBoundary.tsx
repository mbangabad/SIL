/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs them, and displays a fallback UI instead of crashing the app.
 */

'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Log to error tracking service (e.g., Sentry)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-container" role="alert">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Something went wrong</h2>
            <p className="error-message">
              The game encountered an unexpected error. Please try refreshing the page or selecting a different game.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="error-actions">
              <button
                onClick={this.handleReset}
                className="button-primary"
                aria-label="Try again"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="button-secondary"
                aria-label="Go to home page"
              >
                Go to Home
              </button>
            </div>
          </div>

          <style jsx>{`
            .error-container {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              padding: 2rem;
              background: #0f172a;
            }

            .error-content {
              max-width: 600px;
              text-align: center;
            }

            .error-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }

            .error-title {
              font-size: 2rem;
              font-weight: 700;
              color: #f87171;
              margin-bottom: 1rem;
            }

            .error-message {
              font-size: 1rem;
              color: #cbd5e1;
              margin-bottom: 2rem;
              line-height: 1.6;
            }

            .error-details {
              text-align: left;
              margin-bottom: 2rem;
              padding: 1rem;
              background: #1e293b;
              border-radius: 8px;
              border: 1px solid #334155;
            }

            .error-details summary {
              cursor: pointer;
              color: #94a3b8;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }

            .error-stack {
              color: #e2e8f0;
              font-size: 0.875rem;
              overflow-x: auto;
              white-space: pre-wrap;
              word-break: break-all;
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
            }

            .button-primary,
            .button-secondary {
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              font-weight: 600;
              font-size: 1rem;
              cursor: pointer;
              transition: all 0.2s;
              border: none;
            }

            .button-primary {
              background: linear-gradient(135deg, #3b82f6, #8b5cf6);
              color: white;
            }

            .button-primary:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
            }

            .button-secondary {
              background: #334155;
              color: #e2e8f0;
            }

            .button-secondary:hover {
              background: #475569;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * GameErrorFallback - Specialized error UI for game failures
 */
export const GameErrorFallback: React.FC<{ onReset?: () => void }> = ({ onReset }) => {
  return (
    <div className="game-error" role="alert">
      <div className="game-error-content">
        <div className="game-error-icon">🎮</div>
        <h3 className="game-error-title">Game Error</h3>
        <p className="game-error-message">
          This game encountered an error. Please try a different game or mode.
        </p>
        <button
          onClick={onReset || (() => window.location.reload())}
          className="game-error-button"
          aria-label="Try another game"
        >
          Try Another Game
        </button>
      </div>

      <style jsx>{`
        .game-error {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          background: #1e293b;
          border-radius: 12px;
          padding: 2rem;
        }

        .game-error-content {
          text-align: center;
        }

        .game-error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .game-error-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f87171;
          margin-bottom: 0.5rem;
        }

        .game-error-message {
          color: #cbd5e1;
          margin-bottom: 1.5rem;
        }

        .game-error-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .game-error-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
};
