'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Activity, RefreshCcw } from 'lucide-react'

interface Props {
  children: ReactNode
  sectionName: string
}

interface State {
  hasError: boolean
}

export class SectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[SIGNAL_FAILURE] ${this.props.sectionName}:`, error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="py-20 border-2 border-dashed border-white/5 bg-black/20 flex flex-col items-center justify-center rounded-sm group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-spider-red/5 to-transparent pointer-events-none" />
            <Activity className="h-12 w-12 text-spider-red mb-6 animate-pulse" />
            <h3 className="text-xl font-black uppercase tracking-[0.3em] text-white/40 italic">
                Scanning for {this.props.sectionName} Signals...
            </h3>
            <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest mt-4">
                Temporary interference detected. Frequency recovery in progress.
            </p>
            <button 
                onClick={() => this.setState({ hasError: false })}
                className="mt-8 px-6 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
            >
                <RefreshCcw size={12} /> Retry Uplink
            </button>
        </div>
      )
    }

    return this.props.children
  }
}
