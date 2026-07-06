import React, { ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in royal application:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-amber-500/30">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.05)]">
            {/* Elegant gold decorative elements */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            
            <div className="mx-auto w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-500 animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-extrabold text-white uppercase tracking-wider">
                System Sanctuary Guard
              </h1>
              <p className="text-sm text-slate-400 font-medium">
                A minor anomaly has occurred in our grand navigation deck. Rest assured, your luxury voyage is protected.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-left">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  System Diagnostics
                </span>
                <p className="text-xs font-mono text-amber-400/90 break-words leading-relaxed max-h-24 overflow-y-auto">
                  {this.state.error.message || 'Unknown runtime transition error'}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3 px-5 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                <span>RELOAD EXPEDITION</span>
              </button>
              
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 px-5 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                <Home className="w-3.5 h-3.5" />
                <span>RETURN DECK</span>
              </button>
            </div>
            
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest pt-2">
              Royal Egyptian Tour Agency • Sovereign Secure
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
