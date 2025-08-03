import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class VoiceErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Voice component error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
    
    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center p-4 bg-red-900/20 border border-red-800/30 rounded-lg">
          <div className="flex items-center space-x-2 text-red-400 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">Voice Service Error</span>
          </div>
          
          <p className="text-sm text-gray-400 text-center mb-3">
            The voice service encountered an error. This may be due to:
          </p>
          
          <ul className="text-xs text-gray-500 space-y-1 mb-4">
            <li>• Microphone permissions not granted</li>
            <li>• Voice service temporarily unavailable</li>
            <li>• Network connectivity issues</li>
            <li>• Browser compatibility issues</li>
          </ul>

          {this.state.error && (
            <details className="w-full mb-3">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                Technical Details
              </summary>
              <pre className="mt-2 p-2 bg-gray-900/50 rounded text-xs text-gray-500 overflow-auto max-h-32">
                {this.state.error.message}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleReset}
            className="flex items-center space-x-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for functional components
export function withVoiceErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.ComponentType<P> {
  return (props: P) => (
    <VoiceErrorBoundary fallback={fallback}>
      <Component {...props} />
    </VoiceErrorBoundary>
  );
}