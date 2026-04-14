'use client'

import React, { useState, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, UserPlus, Mail, Lock, Loader2, AlertCircle, Cpu, Zap, Disc, Key, ShieldCheck, UserCheck } from 'lucide-react'
import { signup } from '../actions'
import { useSearchParams } from 'next/navigation'

export default function SignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-studio-yellow/20" />
            </div>
        }>
            <SignupForm />
        </Suspense>
    )
}

function SignupForm() {
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/browse'
  
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [systemTime, setSystemTime] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
        setSystemTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await signup(formData)
    if (result?.error) {
        setError(result.error)
        setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden font-mono text-left">
      {/* 🏁 SCANLINE & GRID OVERLAY */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50 scanline-bg" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-[0.02] pointer-events-none" />
      
      {/* Industrial Hardware Accents */}
      <div className="absolute top-10 left-10 hidden xl:block opacity-20">
         <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em]">
            <Cpu size={14} className="text-studio-neon" />
            <span>CONNECTION: READY</span>
            <span className="text-white/20">::</span>
            <span className="text-studio-neon animate-pulse">{systemTime}</span>
         </div>
      </div>

      <div className="flex-1 flex items-center justify-center container mx-auto px-4 relative z-10">
        <div className="w-full max-w-lg">
          {/* Main Terminal Frame */}
          <div className="border-4 border-black bg-[#0a0a0a] shadow-[0_0_80px_rgba(0,0,0,1)] relative">
            {/* Top Bar */}
            <div className="bg-black p-3 flex justify-between items-center border-b border-white/5">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-red-500/40 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-studio-yellow/40 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-studio-neon/40 rounded-full" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 italic">SECURE SIGNUP V5.1</span>
            </div>

            <div className="p-8 md:p-12">
                {/* Header */}
                <div className="mb-10 flex flex-col items-center">
                    <div className="relative mb-6">
                        <div className="absolute -inset-4 bg-studio-neon/5 blur-2xl rounded-full" />
                        <div className="w-20 h-20 bg-black border-2 border-studio-neon/20 flex items-center justify-center relative transform rotate-45 shadow-[0_0_30px_rgba(0,255,65,0.05)]">
                           <UserPlus className="h-8 w-8 text-studio-neon -rotate-45" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic leading-none text-center">
                        Create Your<br /><span className="text-studio-neon shadow-studio-neon">Account</span>
                    </h1>
                </div>

                {/* Google Signup (Simple Style) */}
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
                    className="w-full flex items-center justify-center gap-4 py-5 bg-white/2 border-2 border-white/5 hover:bg-white/5 hover:border-white/10 transition-all font-black uppercase tracking-[0.2em] text-[10px] mb-8 group"
                >
                    <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                <div className="flex items-center gap-4 mb-8 text-white/5">
                    <div className="h-px flex-1 bg-current" />
                    <span className="text-[8px] font-black uppercase tracking-[0.5em]">OR SIGN UP WITH EMAIL</span>
                    <div className="h-px flex-1 bg-current" />
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input type="hidden" name="redirect" value={redirectPath} />
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-orange-500/10 border-l-4 border-orange-500 text-orange-500 font-black text-[10px] uppercase tracking-widest animate-shake">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-1">Full Name:</label>
                        <div className="relative group">
                            <UserCheck className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 group-focus-within:text-studio-neon transition-colors" />
                            <input 
                                name="name"
                                type="text" 
                                placeholder="Enter your name" 
                                className="w-full pl-14 pr-6 py-5 bg-black border-2 border-white/5 rounded-none focus:border-studio-neon focus:bg-studio-neon/2 transition-all outline-none text-[11px] font-black uppercase tracking-widest placeholder:text-white/5"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-1">Email Address:</label>
                        <div className="relative group">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 group-focus-within:text-studio-neon transition-colors" />
                            <input 
                                name="email"
                                type="email" 
                                placeholder="Gmail preferred" 
                                className="w-full pl-14 pr-6 py-5 bg-black border-2 border-white/5 rounded-none focus:border-studio-neon focus:bg-studio-neon/2 transition-all outline-none text-[11px] font-black uppercase tracking-widest placeholder:text-white/5"
                                required
                                pattern=".+@gmail\.com$"
                                title="Only @gmail.com emails are allowed"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-1">Password:</label>
                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 group-focus-within:text-studio-neon transition-colors" />
                            <input 
                                name="password"
                                type="password" 
                                placeholder="6+ characters required" 
                                className="w-full pl-14 pr-6 py-5 bg-black border-2 border-white/5 rounded-none focus:border-studio-neon focus:bg-studio-neon/2 transition-all outline-none text-[11px] font-black uppercase tracking-widest placeholder:text-white/5"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="text-center px-1 py-2">
                        <p className="text-[9px] uppercase font-black tracking-widest text-white/20 flex items-center justify-center gap-2">
                            Already have an account? 
                            <Link href="/auth/login" className="text-white hover:text-studio-neon transition-colors underline underline-offset-4">LOGIN</Link>
                        </p>
                    </div>

                    <button 
                        disabled={isPending}
                        className="w-full py-6 bg-studio-neon text-black font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-4 hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-wait shadow-[0_0_50px_rgba(0,255,65,0.2)]"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin text-black" />
                                <span>Creating account...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-5 w-5" />
                                <span>Create Account</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
            
            {/* Footer Status */}
            <div className="bg-black/40 p-4 border-t border-white/5 flex justify-between items-center px-8">
                <div className="flex items-center gap-3">
                    <Disc className="w-3 h-3 text-studio-neon animate-spin-slow" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20">SAMPLES WALA SECURE SIGNUP</span>
                </div>
                <div className="flex gap-4">
                    <div className="h-1 w-8 bg-studio-neon/20 rounded-full overflow-hidden">
                        <div className="h-full bg-studio-neon w-1/2 animate-pulse" />
                    </div>
                </div>
            </div>
          </div>

          {/* Exterior Info */}
          <div className="mt-8 flex justify-between items-center px-4 opacity-30 text-[8px] font-black uppercase tracking-[0.5em] italic">
             <span>SAFE & SECURED</span>
             <span>© 2026 SAMPLES WALA</span>
          </div>
        </div>
      </div>
    </div>
  )
}
