'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, ShieldCheck, Lock, Loader2, AlertCircle } from 'lucide-react'
import { updatePassword } from '../actions'

export default function ResetPasswordPage() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
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
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-emerald-500/10 blur-[180px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-yellow-500/10 blur-[180px] rounded-full animate-pulse delay-1000" />

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
            <div className="relative group">
               <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-studio-neon transition-colors" />
               <input 
                 name="password"
                 type="password" 
                 placeholder="Enter New Password" 
                 className="w-full pl-14 pr-6 py-5 bg-white/[0.02] border border-white/10 rounded-2xl focus:border-studio-neon focus:bg-white/[0.04] transition-all outline-none text-sm placeholder:text-white/20 text-white font-bold"
                 required
               />
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
