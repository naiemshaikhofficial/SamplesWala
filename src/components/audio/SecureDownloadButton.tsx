'use client'
import { Download, ShieldCheck, Loader2, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { getSecureDownloadUrl } from '@/app/packs/actions'

export function SecureDownloadButton({ packId, isIndividualSample = false }: { packId: string, isIndividualSample?: boolean }) {
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
            className="w-full h-14 bg-black text-white px-4 md:px-6 font-black uppercase text-xs sm:text-sm tracking-[0.1em] hover:bg-studio-neon hover:text-black active:scale-95 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 border-2 border-white/10"
        >
            {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#00FF00] group-hover:text-black transition-colors" />
                    <Download className="h-5 w-5 fill-current" />
                </div>
            )}
            <span className="whitespace-nowrap">
                {loading ? 'PREPARING_BITSTREAM...' : 'START_DOWNLOAD'}
            </span>
        </button>
    )
}
