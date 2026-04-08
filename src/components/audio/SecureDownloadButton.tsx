'use client'
import { Download, ShieldCheck, Loader2, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { getSecureDownloadUrl } from '@/app/packs/actions'

export function SecureDownloadButton({ packId, isIndividualSample = false, variant = 'neon' }: { packId: string, isIndividualSample?: boolean, variant?: 'neon' | 'yellow' }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDownload = async () => {
        setLoading(true)
        setError(null)
        
        try {
            // 🚀 GENERATE JWT TOKEN FIRST
            const secureUrl = await getSecureDownloadUrl(packId, isIndividualSample)
            
            // 🚀 TRIGGER SECURE DOWNLOAD VIA AUTHORIZED BINARY STREAM
            window.location.href = secureUrl
            
            // Give the browser time to initiate the handshake
            setTimeout(() => setLoading(false), 4000)

        } catch (err: any) {
            console.error("Download Initiation Failed:", err)
            setError(err.message || "COULD NOT START DOWNLOAD")
            setLoading(false)
        }
    }

    if (error) {
        return (
            <div className="flex flex-col items-start gap-2">
                 <button onClick={handleDownload} className="bg-red-500 text-white px-16 py-6 font-black uppercase text-sm tracking-[0.2em] flex items-center gap-4 group">
                    <AlertTriangle className="h-5 w-5" /> TRY AGAIN
                </button>
                <span className="text-[10px] font-black uppercase text-red-500 italic mt-2">{error}</span>
            </div>
        )
    }

    return (
        <button 
            disabled={loading}
            onClick={handleDownload}
            className={`w-full h-14 font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-4 group disabled:opacity-50 border-2 shadow-lg ${
                variant === 'yellow' 
                ? 'bg-studio-yellow text-black border-black hover:bg-black hover:text-studio-yellow' 
                : 'bg-black text-white border-white/10 hover:bg-studio-neon hover:text-black hover:border-studio-neon/50'
            }`}
        >
            {loading ? (
                <Loader2 className={`h-5 w-5 animate-spin ${variant === 'yellow' ? 'text-black group-hover:text-studio-yellow' : 'text-studio-neon'}`} />
            ) : (
                <div className="flex items-center gap-3">
                    <ShieldCheck className={`h-4 w-4 transition-colors ${variant === 'yellow' ? 'text-black group-hover:text-studio-yellow' : 'text-[#00FF00]'}`} />
                    <Download className="h-5 w-5 fill-current" />
                </div>
            )}
            <span className="whitespace-nowrap font-black">
                {loading ? 'Dowloading...' : (variant === 'yellow' ? 'DOWNLOAD' : 'DOWNLOAD')}
            </span>
        </button>
    )
}
