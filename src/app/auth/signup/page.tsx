import Link from 'next/link'
import { ArrowLeft, Sparkles, UserPlus, Mail, Lock } from 'lucide-react'
import { signup } from '../actions'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col relative overflow-hidden">
      {/* Premium Gold/Yellow Flows */}
      <div className="absolute top-1/4 -right-1/4 w-[700px] h-[700px] bg-yellow-500/10 blur-[200px] rounded-full animate-pulse delay-500" />
      <div className="absolute bottom-1/4 -left-1/4 w-[700px] h-[700px] bg-emerald-500/10 blur-[200px] rounded-full animate-pulse" />

      <Link href="/" className="absolute top-12 left-12 inline-flex items-center text-sm text-white/40 hover:text-white transition-all group z-50">
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Samples Wala
      </Link>

      <div className="flex-1 flex items-center justify-center container mx-auto px-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex p-4 rounded-3xl bg-white/[0.03] border border-white/5 mb-6 hover:scale-110 transition-transform">
               <UserPlus className="h-8 w-8 text-yellow-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 italic leading-tight">Create Account</h1>
            <p className="text-white/40 text-sm">Join the pro-producers club. Get fresh credits now.</p>
          </div>

          {/* Registration Form */}
          <form action={signup} className="space-y-6">
            <div className="relative group">
               <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-yellow-500 transition-colors" />
               <input 
                 name="email"
                 type="email" 
                 placeholder="Producer Email" 
                 className="w-full pl-14 pr-6 py-5 bg-white/[0.02] border border-white/5 rounded-2xl focus:border-yellow-500/50 focus:bg-white/[0.04] transition-all outline-none text-sm placeholder:text-white/20"
                 required
               />
            </div>
            
            <div className="relative group">
               <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-yellow-500 transition-colors" />
               <input 
                 name="password"
                 type="password" 
                 placeholder="Strong Password" 
                 className="w-full pl-14 pr-6 py-5 bg-white/[0.02] border border-white/5 rounded-2xl focus:border-yellow-500/50 focus:bg-white/[0.04] transition-all outline-none text-sm placeholder:text-white/20"
                 required
               />
            </div>

            <div className="text-center px-4">
               <p className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-6 flex items-center justify-center gap-2">
                 Already a pro? 
                 <Link href="/auth/login" className="text-white hover:text-yellow-500 transition-colors underline underline-offset-4">Sign In</Link>
               </p>
            </div>

            <button className="relative w-full py-5 bg-white text-black font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden group">
               <span>Join The Club</span>
               <Sparkles className="h-4 w-4 text-yellow-600 group-hover:scale-125 transition-transform" />
               
               {/* Shine Effect */}
               <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-12 text-center">
             <p className="text-[10px] uppercase font-black tracking-widest text-white/10 italic">
                By joining, you agree to our Creative Terms
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
