'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Script from 'next/script'

interface TurnstileProps {
    onVerify: (token: string) => void
    siteKey?: string
}

declare global {
    interface Window {
        turnstile: {
            render: (el: string | HTMLElement, options: any) => string
            reset: (widgetId: string | null) => void
            remove: (widgetId: string | null) => void
        }
    }
}

export default function Turnstile({ onVerify, siteKey }: TurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const widgetIdRef = useRef<string | null>(null)
    const [token, setToken] = useState('')
    
    const finalSiteKey = siteKey || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA' 

    const renderWidget = useCallback(() => {
        if (typeof window !== 'undefined' && window.turnstile && containerRef.current && !widgetIdRef.current) {
            console.log('[TURNSTILE] Initializing widget...');
            try {
                const id = window.turnstile.render(containerRef.current, {
                    sitekey: finalSiteKey,
                    callback: (token: string) => {
                        console.log('[TURNSTILE] Token captured');
                        setToken(token)
                        onVerify(token)
                    },
                    theme: 'dark',
                })
                widgetIdRef.current = id
            } catch (err) {
                console.error('[TURNSTILE_RENDER_ERROR]', err)
            }
        }
    }, [finalSiteKey, onVerify])

    useEffect(() => {
        // If script is already loaded
        if (window.turnstile) {
            renderWidget()
        }

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current)
                    widgetIdRef.current = null
                } catch (e) {}
            }
        }
    }, [renderWidget])

    return (
        <div className="flex flex-col items-center my-6 min-h-[65px] w-full">
            <Script 
                src="https://challenges.cloudflare.com/turnstile/v0/api.js" 
                strategy="lazyOnload"
                onLoad={renderWidget}
            />
            <div ref={containerRef} className="cf-turnstile mx-auto"></div>
            <input type="hidden" name="cf-turnstile-response" value={token} />
            
            {/* Visual indicator for debug */}
            {!token && (
                <div className="text-[8px] text-white/5 uppercase tracking-widest mt-2">
                    Security check loading...
                </div>
            )}
        </div>
    )
}
