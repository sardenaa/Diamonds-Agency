import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface SubSectionErrorBoundaryProps {
  children: ReactNode;
  name: string;
  silent?: boolean;
}

interface SubSectionErrorBoundaryState {
  hasError: boolean;
}

export default class SubSectionErrorBoundary extends Component<
  SubSectionErrorBoundaryProps,
  SubSectionErrorBoundaryState
> {
  public state: SubSectionErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): SubSectionErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Sub-section anomaly caught in royal module [${this.props.name}]:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.silent) {
        return null; // Return empty space silently for background/supporting integrations to prevent UI clutter
      }

      return (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col items-center justify-center space-y-3 shadow-lg max-w-sm mx-auto text-center">
          <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest">
              {this.props.name} Offline
            </h4>
            <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">
              An unhandled anomaly occurred in this luxury module. Please try reloading this section.
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors active:scale-95"
          >
            <RotateCcw className="w-3 h-3 text-amber-500" />
            <span>Reload Module</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
