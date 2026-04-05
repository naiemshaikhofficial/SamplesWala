'use client'
import { Download, ShieldCheck, Loader2, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { getSecureDownloadUrl } from '@/app/packs/actions'

export function SecureDownloadButton({ packId }: { packId: string }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDownload = async () => {
        setLoading(true)
        setError(null)
        
        try {
            // 🚀 GENERATE JWT TOKEN FIRST
            const secureUrl = await getSecureDownloadUrl(packId)
            
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
            className="bg-black text-white px-16 py-6 font-black uppercase text-sm tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-4 group disabled:opacity-50 border border-white/10"
        >
            {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#00FF00] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Download className="h-5 w-5 fill-white group-hover:animate-bounce" />
                </div>
            )}
            {loading ? 'SECURING...' : 'DOWNLOAD'}
        </button>
    )
}
