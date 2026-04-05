'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, LogIn, Mail, Lock, Loader2, AlertCircle } from 'lucide-react'
import { login } from '../actions'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-[#020202] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white/20" />
        </div>
    }>
        <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/browse'
  
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    try {
        const result = await login(formData)
        if (result?.error) {
            setError(result.error)
        }
    } catch (err: any) {
        setError("Login failed. Check your credentials.")
    } finally {
        setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-emerald-500/10 blur-[180px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-yellow-500/10 blur-[180px] rounded-full animate-pulse delay-1000" />

      <Link href="/" className="absolute top-12 left-12 inline-flex items-center text-sm text-white/40 hover:text-white transition-all group z-50">
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Samples Wala
      </Link>

      <div className="flex-1 flex items-center justify-center container mx-auto px-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex p-4 rounded-3xl bg-white/[0.03] border border-white/5 mb-6">
               <LogIn className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 italic leading-tight">Welcome Back</h1>
            <p className="text-white/40 text-sm">Access your library and fresh credits. Don't lose the rhythm.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="redirect" value={redirectPath} />
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs animate-shake">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            <div className="relative group">
               <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
               <input 
                 name="email"
                 type="email" 
                 placeholder="Producer Email" 
                 className="w-full pl-14 pr-6 py-5 bg-white/[0.02] border border-white/5 rounded-2xl focus:border-emerald-500/50 focus:bg-white/[0.04] transition-all outline-none text-sm placeholder:text-white/20"
                 required
               />
            </div>
            
            <div className="relative group">
               <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
               <input 
                 name="password"
                 type="password" 
                 placeholder="Password" 
                 className="w-full pl-14 pr-6 py-5 bg-white/[0.02] border border-white/5 rounded-2xl focus:border-emerald-500/50 focus:bg-white/[0.04] transition-all outline-none text-sm placeholder:text-white/20"
                 required
               />
            </div>

            <div className="flex items-center justify-between px-2">
               <Link href="/auth/forgot-password" title="Recover Access" className="text-[10px] uppercase font-black tracking-widest text-white/20 hover:text-white transition-colors">Forgot?</Link>
               <Link href="/auth/signup" className="text-[10px] uppercase font-black tracking-widest text-emerald-400/60 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  New? Join the club <Sparkles className="h-3 w-3" />
               </Link>
            </div>

            <button 
              disabled={isPending}
              className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
            >
               {isPending ? (
                   <>
                     <Loader2 className="h-4 w-4 animate-spin text-black" />
                     <span>Authenticating...</span>
                   </>
               ) : (
                   <span>Sign In</span>
               )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-12 text-center">
             <p className="text-[10px] uppercase font-black tracking-widest text-white/10 italic">
                Samples Wala • Premium Creative Assets
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
