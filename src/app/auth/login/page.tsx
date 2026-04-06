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

          {/* Google Login (TOP) */}
          <button 
            onClick={async () => {
              const supabase = (await import('@/lib/supabase/client')).createClient()
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback?next=${redirectPath}`,
                },
              })
            }}
            className="w-full flex items-center justify-center gap-4 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-xs mb-8"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-8 text-white/10">
            <div className="h-[1px] flex-1 bg-current" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">OR LOGIN WITH EMAIL</span>
            <div className="h-[1px] flex-1 bg-current" />
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
