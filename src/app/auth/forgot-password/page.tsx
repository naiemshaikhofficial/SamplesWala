'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Key, Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { forgotPassword } from '../actions'

export default function ForgotPasswordPage() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    try {
        const result = await forgotPassword(formData)
        if (result?.error) {
            setError(result.error)
        } else {
            setSuccess(true)
        }
    } catch (err: any) {
        setError("Failed to send link. Please try again.")
    } finally {
        setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.03] blur-[220px] rounded-full" />

      <Link href="/auth/login" className="absolute top-12 left-12 inline-flex items-center text-sm text-white/40 hover:text-white transition-all group z-50">
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Login
      </Link>

      <div className="flex-1 flex items-center justify-center container mx-auto px-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex p-4 rounded-3xl bg-studio-neon/5 border border-studio-neon/20 mb-6 relative group">
               <div className="absolute inset-0 bg-studio-neon blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
               <Key className="h-8 w-8 text-studio-neon relative z-10" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 italic leading-tight text-white">
                Reset Password
            </h1>
            <p className="text-white/40 text-sm font-bold">
                Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {success ? (
              <div className="text-center p-10 rounded-[2.5rem] bg-studio-neon/5 border border-studio-neon/20 animate-in fade-in zoom-in duration-500 shadow-[0_0_50px_rgba(166,226,46,0.1)]">
                  <div className="inline-flex p-5 rounded-full bg-studio-neon text-black mb-6 shadow-[0_0_30px_rgba(166,226,46,0.4)]">
                      <CheckCircle className="h-8 w-8" strokeWidth={3} />
                  </div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tight text-white mb-3">Link Sent!</h3>
                  <p className="text-white/60 text-xs font-bold leading-relaxed">
                      We've sent a password reset link to your email. <br/>
                      Please check your inbox (and spam folder too).
                  </p>
                  
                  <Link href="/auth/login" className="inline-flex items-center gap-2 text-studio-neon text-[10px] font-black uppercase tracking-widest mt-8 hover:gap-3 transition-all">
                      Back to Login <ArrowRight size={12} />
                  </Link>
              </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
               {error && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-studio-yellow/10 border border-studio-yellow/20 text-studio-yellow text-xs font-bold">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
               )}
                <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-studio-neon transition-colors" />
                    <input 
                        name="email"
                        type="email" 
                        placeholder="Your Email Address" 
                        className="w-full pl-14 pr-6 py-5 bg-white/[0.02] border border-white/10 rounded-2xl focus:border-studio-neon focus:bg-white/[0.04] transition-all outline-none text-sm placeholder:text-white/20 text-white font-bold"
                        required
                    />
                </div>

                <button disabled={isPending} className="w-full py-5 bg-studio-neon text-black font-black uppercase tracking-widest text-sm rounded-2xl hover:shadow-[0_0_40px_rgba(166,226,46,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50">
                   {isPending ? (
                       <>
                         <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Sending...</span>
                       </>
                   ) : (
                       <span>Send Reset Link</span>
                   )}
                </button>
            </form>
          )}

          {/* Footer Info */}
          <div className="mt-12 text-center">
             <p className="text-[10px] uppercase font-black tracking-widest text-white/10 italic">
                Check your junk/spam folder if the link doesn't arrive.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
