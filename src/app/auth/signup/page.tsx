'use client'

import React, { useState, Suspense, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
    ArrowLeft, Sparkles, UserPlus, Mail, Lock, Loader2, 
    AlertCircle, Cpu, Zap, Disc, Key, ShieldCheck, 
    UserCheck, Eye, EyeOff, CheckCircle2, XCircle 
} from 'lucide-react'
import { signup } from '../actions'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { containsProfanity } from '@/lib/profanity'

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
  const [vizHeights, setVizHeights] = useState<number[]>([])
  
  // Form State
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  
  // Validation
  const passwordsMatch = useMemo(() => password === confirmPassword && password !== '', [password, confirmPassword])
  const nameIsClean = useMemo(() => !containsProfanity(name) || name === '', [name])
  const isValidEmail = useMemo(() => email.endsWith('@gmail.com'), [email])

  // 🔐 PASSWORD COMPLEXITY ENGINE
  const pwdMetrics = useMemo(() => {
    return {
        hasLength: password.length >= 6,
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
    if (pwdStrength <= 1) return 'bg-spider-red shadow-[0_0_10px_#E11D48]';
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

  useEffect(() => {
    const timer = setInterval(() => {
        setSystemTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    
    // Initialize viz heights on client
    setVizHeights([...Array(16)].map(() => Math.random() * 100))
    
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!passwordsMatch) {
        setError("PASSWORDS DON'T MATCH")
        return
    }
    
    if (!nameIsClean) {
        setError('THIS NAME IS BLOCKED')
        return
    }

    if (!isValidEmail) {
        setError('GMAIL EMAIL REQUIRED')
        return
    }

    if (!pwdMetrics.hasLength) {
        setError('PASSWORD TOO SHORT')
        return
    }

    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await signup(formData)
    if (result?.error) {
        setError(result.error.toUpperCase())
        setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden font-mono text-left">
      {/* 🏁 SCANLINE & GRID OVERLAY */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50 scanline-bg" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-[0.02] pointer-events-none" />
      
      {/* DAW Interface Decoration */}
      <div className="absolute top-10 left-10 hidden xl:flex flex-col gap-6 opacity-20">
         <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em]">
            <Cpu size={14} className="text-studio-neon" />
            <span>SESSION: ACTIVE</span>
            <span className="text-white/20">::</span>
            <span className="text-studio-neon animate-pulse">{systemTime}</span>
         </div>
         <div className="flex gap-1 h-32 items-end">
            {vizHeights.length > 0 && vizHeights.map((h, i) => (
                <div 
                    key={i} 
                    className="w-1 bg-studio-neon/20 h-full"
                    style={{ height: `${h}%` }}
                />
            ))}
         </div>
      </div>

      <div className="flex-1 flex items-center justify-center container mx-auto px-4 py-12 relative z-10">
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg"
        >
          {/* Main DAW Module Frame */}
          <div className="border-4 border-black bg-[#0a0a0a] shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden">
            {/* Top Bar / Handle */}
            <div className="bg-black p-4 flex justify-between items-center border-b-2 border-white/5">
                <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 border border-white/20 rounded-none" />
                    <div className="w-2.5 h-2.5 border border-white/20 rounded-none" />
                    <div className="w-2.5 h-2.5 border border-white/20 rounded-none" />
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 italic">ACCOUNT SETUP // 0.1</span>
                </div>
            </div>

            <div className="p-8 md:p-12">
                {/* Header Section */}
                <div className="mb-10 flex flex-col items-center">
                    <div className="relative mb-6">
                        <div className="absolute -inset-4 bg-studio-neon/5 blur-3xl rounded-full" />
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="w-20 h-20 bg-black border-2 border-white/10 flex items-center justify-center relative shadow-[0_0_40px_rgba(255,255,255,0.02)] transition-all duration-700 group cursor-pointer"
                        >
                           <Image 
                                src="/Logo.png" 
                                alt="Samples Wala Logo" 
                                width={40} 
                                height={40} 
                                className="group-hover:scale-110 transition-transform brightness-0 invert opacity-40 group-hover:opacity-100"
                           />
                           <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-studio-neon/30" />
                           <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-studio-neon/30" />
                        </motion.div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">JOIN THE</span>
                        <div className="flex items-center gap-4">
                            <Image 
                                src="/Logo.png" 
                                alt="Logo" 
                                width={32} 
                                height={32} 
                                className="brightness-0 invert shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            />
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">
                                <span className="text-studio-neon vibe-glow">SAMPLES WALA.</span>
                            </h1>
                        </div>
                    </div>
                </div>

                {/* 🌈 GOOGLE SIGNUP - TOP PRIORITY */}
                <div className="mb-8">
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
                        className="w-full flex items-center justify-center gap-4 py-5 bg-white text-black hover:bg-studio-neon transition-all font-black uppercase tracking-[0.2em] text-[11px] group relative"
                    >
                        <Image 
                            src="/Logo.png" 
                            alt="Google Signup" 
                            width={16} 
                            height={16} 
                            className="brightness-0"
                        />
                        <span>SIGN UP WITH GOOGLE</span>
                    </button>

                    <div className="flex items-center gap-4 mt-8 mb-2 text-white/10">
                        <div className="h-px flex-1 bg-current" />
                        <span className="text-[9px] font-black uppercase tracking-[0.5em]">OR</span>
                        <div className="h-px flex-1 bg-current" />
                    </div>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input type="hidden" name="redirect" value={redirectPath} />
                    
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-4 p-5 bg-red-500/10 border-2 border-red-500/50 text-red-500 font-black text-[10px] uppercase tracking-[0.1em] relative mb-6"
                            >
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <div>{error}</div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Name */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end ml-1">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">NAME</label>
                            {name && (
                                <span className={`text-[8px] font-black uppercase tracking-widest ${nameIsClean ? 'text-studio-neon' : 'text-red-500'}`}>
                                    {nameIsClean ? '[ OK ]' : '[ BLOCKED ]'}
                                </span>
                            )}
                        </div>
                        <div className="relative group">
                            <UserCheck className={`absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${name && !nameIsClean ? 'text-red-500' : 'text-white/10 group-focus-within:text-studio-neon'}`} />
                            <input 
                                name="name"
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="YOUR FULL NAME" 
                                className={`w-full pl-14 pr-6 py-5 bg-black/40 border-2 rounded-none transition-all outline-none text-[12px] font-black uppercase tracking-[0.1em] placeholder:text-white/10 ${name && !nameIsClean ? 'border-red-500/40 bg-red-500/5' : 'border-white/5 focus:border-studio-neon focus:bg-studio-neon/5'}`}
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end ml-1">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">EMAIL</label>
                            {email && (
                                <span className={`text-[8px] font-black uppercase tracking-widest ${isValidEmail ? 'text-studio-neon' : 'text-orange-500'}`}>
                                    {isValidEmail ? '[ OK ]' : '[ GMAIL REQ ]'}
                                </span>
                            )}
                        </div>
                        <div className="relative group">
                            <Mail className={`absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${email && !isValidEmail ? 'text-orange-500' : 'text-white/10 group-focus-within:text-studio-neon'}`} />
                            <input 
                                name="email"
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="EMAIL@GMAIL.COM" 
                                className={`w-full pl-14 pr-6 py-5 bg-black/40 border-2 rounded-none transition-all outline-none text-[12px] font-black uppercase tracking-[0.1em] placeholder:text-white/10 ${email && !isValidEmail ? 'border-orange-500/40 bg-orange-500/5' : 'border-white/5 focus:border-studio-neon focus:bg-studio-neon/5'}`}
                                required
                            />
                        </div>
                    </div>
                    
                    {/* Password */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end ml-1">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">PASSWORD</label>
                            {password && (
                                <span className={`text-[8px] font-black uppercase tracking-widest ${pwdStrength >= 3 ? 'text-studio-neon' : 'text-white/40'}`}>
                                    {strengthLabel}
                                </span>
                            )}
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 group-focus-within:text-studio-neon transition-colors" />
                            <input 
                                name="password"
                                type={showPassword ? "text" : "password"} 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="CREATE PASSWORD" 
                                className="w-full hide-password-toggle pl-14 pr-14 py-5 bg-black/40 border-2 border-white/5 rounded-none focus:border-studio-neon focus:bg-studio-neon/5 transition-all outline-none text-[12px] font-black uppercase tracking-[0.1em] placeholder:text-white/10"
                                required
                                minLength={6}
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
                        <div className="px-1 pt-1 space-y-3">
                            <div className="flex gap-1.5 h-1.5 sticky">
                                {[1, 2, 3, 4].map((i) => (
                                    <div 
                                        key={i} 
                                        className={`flex-1 transition-all duration-500 ${pwdStrength >= i ? strengthColor : 'bg-white/5'}`}
                                    />
                                ))}
                            </div>
                            
                            {/* Requirements Grid */}
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                <div className={`flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest transition-colors ${pwdMetrics.hasLength ? 'text-studio-neon' : 'text-white/20'}`}>
                                    {pwdMetrics.hasLength ? <CheckCircle2 size={10} /> : <div className="w-2.5 h-2.5 border border-white/20 rounded-none shrink-0" />}
                                    6+ LETTERS
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
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end ml-1">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">REPEAT PASSWORD</label>
                            {confirmPassword && (
                                <span className={`text-[8px] font-black uppercase tracking-widest ${passwordsMatch ? 'text-studio-neon' : 'text-red-500'}`}>
                                    {passwordsMatch ? '[ OK ]' : '[ WRONG ]'}
                                </span>
                            )}
                        </div>
                        <div className="relative group">
                            <ShieldCheck className={`absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${confirmPassword && !passwordsMatch ? 'text-red-500' : 'text-white/10 group-focus-within:text-studio-neon'}`} />
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="CONFIRM PASSWORD" 
                                className={`w-full hide-password-toggle pl-14 pr-14 py-5 bg-black/40 border-2 rounded-none transition-all outline-none text-[12px] font-black uppercase tracking-[0.1em] placeholder:text-white/10 ${confirmPassword && !passwordsMatch ? 'border-red-500/40 bg-red-500/5' : 'border-white/5 focus:border-studio-neon focus:bg-studio-neon/5'}`}
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

                    <div className="text-center py-2">
                        <p className="text-[9px] uppercase font-black tracking-[0.2em] text-white/20 flex items-center justify-center gap-3">
                            ALREADY HAVE AN ACCOUNT? 
                            <Link href="/auth/login" className="text-white hover:text-studio-neon transition-colors underline underline-offset-8 decoration-white/20 hover:decoration-studio-neon font-black">LOGIN</Link>
                        </p>
                    </div>

                    <div className="pt-8 border-t border-white/5 space-y-6">
                        <button 
                            type="submit"
                            disabled={isPending || !nameIsClean || !isValidEmail || (password !== '' && !passwordsMatch)}
                            className="w-full py-6 bg-studio-neon text-black font-black uppercase tracking-[0.4em] text-[13px] flex items-center justify-center gap-6 hover:bg-white hover:text-black transition-all duration-500 disabled:opacity-10 disabled:grayscale disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-6 w-6 animate-spin text-black" />
                                    <span>PROCESSING...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-6 w-6" />
                                    <span>SIGN UP</span>
                                </>
                            )}
                        </button>

                        <div className="text-center px-4">
                            <p className="text-[8px] md:text-[9px] uppercase font-black tracking-[0.1em] text-white/20 leading-relaxed max-w-sm mx-auto">
                                By signing up, you agree to our{' '}
                                <Link href="/terms" className="text-white/40 hover:text-studio-neon transition-colors underline decoration-white/10">Terms</Link>,{' '}
                                <Link href="/privacy" className="text-white/40 hover:text-studio-neon transition-colors underline decoration-white/10">Privacy</Link>, and{' '}
                                <Link href="/refund" className="text-white/40 hover:text-studio-neon transition-colors underline decoration-white/10">Refund Policy</Link>.
                            </p>
                        </div>
                    </div>
                </form>
            </div>
            
            {/* DAW Status Bar */}
            <div className="bg-black p-4 border-t-2 border-white/5 flex justify-between items-center px-8">
                <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-1.5 h-1.5 bg-studio-neon rounded-full animate-pulse shadow-[0_0_5px_#a6e22e]" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 tracking-widest">SIGNAL STABLE</span>
                </div>
                <div className="hidden md:flex gap-6 opacity-30 items-center">
                    <div className="h-0.5 w-12 bg-white/20 relative overflow-hidden">
                        <motion.div 
                            animate={{ left: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 bg-studio-neon w-1/2"
                        />
                    </div>
                    <Disc className="w-4 h-4 text-white animate-spin-slow" />
                </div>
            </div>
          </div>

          {/* Exterior Info */}
          <div className="mt-8 flex justify-between items-center px-6 opacity-20 text-[9px] font-black uppercase tracking-[0.6em] italic">
             <div className="flex items-center gap-4">
                <Zap size={14} className="text-studio-neon" />
                <span>POWERED BY SAMPLES WALA</span>
             </div>
             <span>© 2026</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}



