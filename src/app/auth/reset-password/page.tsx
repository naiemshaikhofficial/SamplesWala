import Link from 'next/link'
import { ArrowLeft, Sparkles, ShieldCheck, Lock } from 'lucide-react'
import { updatePassword } from '../actions'

export default function ResetPasswordPage() {
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
            <div className="inline-flex p-4 rounded-3xl bg-white/[0.03] border border-white/5 mb-6 group-hover:scale-110 transition-transform">
               <ShieldCheck className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 italic leading-tight">New Password</h1>
            <p className="text-white/40 text-sm">Secure your account. Use at least 8 characters.</p>
          </div>

          {/* New Password Form */}
          <form action={updatePassword} className="space-y-6">
            <div className="relative group">
               <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
               <input 
                 name="password"
                 type="password" 
                 placeholder="New Producer Password" 
                 className="w-full pl-14 pr-6 py-5 bg-white/[0.02] border border-white/5 rounded-2xl focus:border-emerald-500/50 focus:bg-white/[0.04] transition-all outline-none text-sm placeholder:text-white/20"
                 required
               />
            </div>

            <button className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden group">
               <span>Update Password</span>
               <Sparkles className="h-4 w-4 text-emerald-600 transition-transform group-hover:scale-125" />
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
