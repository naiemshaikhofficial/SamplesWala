'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Sparkles, ShieldCheck, Lock, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { updatePassword } from '../actions'
import { useMemo } from 'react'

export default function ResetPasswordPage() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // 🔐 PASSWORD COMPLEXITY ENGINE
  const pwdMetrics = useMemo(() => {
    return {
        hasLength: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }
  }, [password])

  const pwdStrength = useMemo(() => {
    let score = 0;
    if (pwdMetrics.hasLength) score += 1;
    if (pwdMetrics.hasUpper) score += 1;
    if (pwdMetrics.hasNumber) score += 1;
    if (pwdMetrics.hasSpecial) score += 1;
    return score;
  }, [pwdMetrics])

  const strengthColor = useMemo(() => {
    if (pwdStrength <= 1) return 'bg-red-500 shadow-[0_0_10px_#ef4444]';
    if (pwdStrength <= 2) return 'bg-orange-500 shadow-[0_0_10px_#f97316]';
    if (pwdStrength <= 3) return 'bg-studio-yellow shadow-[0_0_10px_#FFC800]';
    return 'bg-studio-neon shadow-[0_0_10px_#a6e22e]';
  }, [pwdStrength])

  const strengthLabel = useMemo(() => {
    if (password.length === 0) return 'PENDING';
    if (pwdStrength <= 1) return 'WEAK';
    if (pwdStrength <= 2) return 'MEDIUM';
    if (pwdStrength <= 3) return 'GOOD';
    return 'STRONG';
  }, [pwdStrength, password])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
        setError("Passwords do not match. Please try again.")
        setIsPending(false)
        return
    }

    if (password.length < 8) {
        setError("Password must be at least 8 characters long.")
        setIsPending(false)
        return
    }

    try {
        const result = await updatePassword(formData)
        if (result?.error) {
            setError(result.error)
        }
    } catch (err: any) {
        setError("Failed to update password. Please try again.")
    } finally {
        setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-studio-neon/5 blur-[180px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-studio-yellow/5 blur-[180px] rounded-full animate-pulse delay-1000" />

      <Link href="/auth/login" className="absolute top-12 left-12 inline-flex items-center text-sm text-white/40 hover:text-white transition-all group z-50">
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Login
      </Link>

      <div className="flex-1 flex items-center justify-center container mx-auto px-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex p-4 rounded-3xl bg-studio-neon/5 border border-studio-neon/20 mb-6 group relative">
               <div className="absolute inset-0 bg-studio-neon blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
               <Lock className="h-8 w-8 text-studio-neon relative z-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 italic leading-tight text-white">
                New Password
            </h1>
            <p className="text-white/40 text-sm font-bold">
                Enter a new password for your account. <br/>
                Make sure it's at least 8 characters long.
            </p>
          </div>

          {/* New Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-studio-yellow/10 border border-studio-yellow/20 text-studio-yellow text-xs font-bold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}
            
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-end ml-1">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">New Password</label>
                        {password && (
                            <span className={`text-[8px] font-black uppercase tracking-widest ${pwdStrength >= 3 ? 'text-studio-neon' : 'text-white/40'}`}>
                                {strengthLabel}
                            </span>
                        )}
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-studio-neon transition-colors" />
                        <input 
                            name="password"
                            type={showPassword ? "text" : "password"} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Choose New Password" 
                            className="w-full pl-14 pr-14 py-5 bg-white/[0.02] border border-white/10 rounded-2xl focus:border-studio-neon focus:bg-white/[0.04] transition-all outline-none text-sm placeholder:text-white/20 text-white font-bold"
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-studio-neon transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* ⚡ STRENGTH METER */}
                    {password && (
                        <div className="px-1 pt-1 space-y-3">
                            <div className="flex gap-1.5 h-1.5">
                                {[1, 2, 3, 4].map((i) => (
                                    <div 
                                        key={i} 
                                        className={`flex-1 transition-all duration-500 rounded-full ${pwdStrength >= i ? strengthColor : 'bg-white/5'}`}
                                    />
                                ))}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                <div className={`flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest transition-colors ${pwdMetrics.hasLength ? 'text-studio-neon' : 'text-white/20'}`}>
                                    {pwdMetrics.hasLength ? <CheckCircle2 size={10} /> : <div className="w-2.5 h-2.5 border border-white/20 rounded-none shrink-0" />}
                                    8+ CHARS
                                </div>
                                <div className={`flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest transition-colors ${pwdMetrics.hasUpper ? 'text-studio-neon' : 'text-white/20'}`}>
                                    {pwdMetrics.hasUpper ? <CheckCircle2 size={10} /> : <div className="w-2.5 h-2.5 border border-white/20 rounded-none shrink-0" />}
                                    UPPERCASE
                                </div>
                                <div className={`flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest transition-colors ${pwdMetrics.hasNumber ? 'text-studio-neon' : 'text-white/20'}`}>
                                    {pwdMetrics.hasNumber ? <CheckCircle2 size={10} /> : <div className="w-2.5 h-2.5 border border-white/20 rounded-none shrink-0" />}
                                    NUMBERS
                                </div>
                                <div className={`flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest transition-colors ${pwdMetrics.hasSpecial ? 'text-studio-neon' : 'text-white/20'}`}>
                                    {pwdMetrics.hasSpecial ? <CheckCircle2 size={10} /> : <div className="w-2.5 h-2.5 border border-white/20 rounded-none shrink-0" />}
                                    SYMBOLS
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-end ml-1">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Confirm Password</label>
                        {confirmPassword && (
                            <span className={`text-[8px] font-black uppercase tracking-widest ${password === confirmPassword ? 'text-studio-neon' : 'text-red-500'}`}>
                                {password === confirmPassword ? '[ MATCH ]' : '[ NO MATCH ]'}
                            </span>
                        )}
                    </div>
                    <div className="relative group">
                        <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-studio-neon transition-colors" />
                        <input 
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"} 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm New Password" 
                            className="w-full pl-14 pr-14 py-5 bg-white/[0.02] border border-white/10 rounded-2xl focus:border-studio-neon focus:bg-white/[0.04] transition-all outline-none text-sm placeholder:text-white/20 text-white font-bold"
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-studio-neon transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            <button disabled={isPending} className="w-full py-5 bg-studio-neon text-black font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(166,226,46,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden group">
               {isPending ? (
                   <>
                     <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                   </>
               ) : (
                   <>
                    <span>Update Password</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                   </>
               )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-12 text-center">
             <p className="text-[10px] uppercase font-black tracking-widest text-white/10 italic">
                Samples Wala • Access Secured
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
