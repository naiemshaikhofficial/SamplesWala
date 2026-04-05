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
            <div className="inline-flex p-4 rounded-3xl bg-white/[0.03] border border-white/5 mb-6">
               <Key className="h-8 w-8 text-white/40" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 italic leading-tight">Recover Access</h1>
            <p className="text-white/40 text-sm">Enter your producer email to receive a secure recovery link.</p>
          </div>

          {success ? (
              <div className="text-center p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 animate-fade-in">
                  <div className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                      <CheckCircle className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Check Your Inbox</h3>
                  <p className="text-white/40 text-xs leading-relaxed">If an account exists for that email, we've sent a secure reset link. Access the magic in 5.. 4..</p>
              </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
               {error && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
               )}
                <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-white transition-colors" />
                    <input 
                        name="email"
                        type="email" 
                        placeholder="Producer Email" 
                        className="w-full pl-14 pr-6 py-5 bg-white/[0.02] border border-white/5 rounded-2xl focus:border-white/30 focus:bg-white/[0.04] transition-all outline-none text-sm placeholder:text-white/20"
                        required
                    />
                </div>

                <button disabled={isPending} className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-sm rounded-2xl hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50">
                   {isPending ? (
                       <>
                         <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Sending Link...</span>
                       </>
                   ) : (
                       <span>Send Link</span>
                   )}
                </button>
            </form>
          )}

          {/* Footer Info */}
          <div className="mt-12 text-center">
             <p className="text-[10px] uppercase font-black tracking-widest text-white/10 italic">
                Check your junk/spam folder if a code doesn't arrive.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
