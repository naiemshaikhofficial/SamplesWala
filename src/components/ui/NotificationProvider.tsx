'use client'
import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertTriangle, Info, Bell } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface NotificationContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
  showConfirm: (message: string) => Promise<boolean>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    message: string
    resolve: (value: boolean) => void
  } | null>(null)

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type, duration }])
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ isOpen: true, message, resolve })
    })
  }, [])

  const handleConfirm = (value: boolean) => {
    confirmState?.resolve(value)
    setConfirmState(null)
  }

  return (
    <NotificationContext.Provider value={{ showToast, showConfirm }}>
      {children}
      
      {/* 🔱 THE WALA-TOASTER ENGINE */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-xs">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className={`
                pointer-events-auto p-4 border shadow-2xl flex items-start gap-4 backdrop-blur-xl
                ${toast.type === 'success' ? 'bg-white text-black border-white' : 
                  toast.type === 'error' ? 'bg-black text-red-500 border-red-500/50' : 
                  'bg-black text-white border-white/20'}
              `}
            >
              <div className="mt-0.5">
                {toast.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                {toast.type === 'error' && <AlertTriangle className="h-4 w-4" />}
                {toast.type === 'info' && <Bell className="h-4 w-4" />}
              </div>
              <p className="text-[10px] uppercase font-black tracking-widest leading-relaxed flex-1">
                {toast.message}
              </p>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="opacity-40 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 🛡️ THE WALA-CONFIRMATION ENGINE */}
      <AnimatePresence>
        {confirmState?.isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleConfirm(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#050505] border border-white/10 p-10 shadow-2xl"
            >
              <div className="aspect-square w-12 border border-white/20 flex items-center justify-center mb-8 bg-white/5">
                <Info className="h-6 w-6 text-white" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 mb-8 italic">[ ACTION_REQUIRED ]</div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-10 leading-none underline decoration-white/20 decoration-4 underline-offset-8">
                {confirmState.message}
              </h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleConfirm(true)}
                  className="w-full h-14 bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-white/90 active:scale-[0.98] transition-all"
                >
                  Confirm Transaction
                </button>
                <button
                  onClick={() => handleConfirm(false)}
                  className="w-full h-14 bg-black border border-white/20 text-white/40 font-black uppercase tracking-widest text-[11px] hover:text-white transition-all"
                >
                  Cancel Access
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  )
}

export function useNotify() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotify must be used within a NotificationProvider')
  }
  return context
}
