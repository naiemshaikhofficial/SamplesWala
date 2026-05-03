'use client'

import React, { useEffect, useRef } from 'react'
import Script from 'next/script'

interface TurnstileProps {
    onVerify: (token: string) => void
    siteKey?: string
}

declare global {
    interface Window {
        onloadTurnstileCallback: () => void
        turnstile: {
            render: (el: string | HTMLElement, options: any) => string
            reset: (widgetId: string) => void
            remove: (widgetId: string) => void
        }
    }
}

export default function Turnstile({ onVerify, siteKey }: TurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const widgetIdRef = useRef<string | null>(null)
    const [token, setToken] = React.useState('')
    const finalSiteKey = siteKey || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA' 

    useEffect(() => {
        const renderWidget = () => {
            if (window.turnstile && containerRef.current && !widgetIdRef.current) {
                widgetIdRef.current = window.turnstile.render(containerRef.current, {
                    sitekey: finalSiteKey,
                    callback: (token: string) => {
                        setToken(token)
                        onVerify(token)
                    },
                    theme: 'dark',
                })
            }
        }

        if (window.turnstile) {
            renderWidget()
        } else {
            window.onloadTurnstileCallback = renderWidget
        }

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                // window.turnstile.remove(widgetIdRef.current)
            }
        }
    }, [finalSiteKey, onVerify])

    return (
        <div className="flex flex-col items-center my-4">
            <Script 
                src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback" 
                strategy="afterInteractive"
            />
            <div ref={containerRef} className="cf-turnstile"></div>
            <input type="hidden" name="cf-turnstile-response" value={token} />
        </div>
    )
}
