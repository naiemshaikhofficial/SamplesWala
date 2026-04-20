import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SITE_URL = "https://sampleswala.com";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params

        // Fetch Software Data
        const { data: soft, error } = await supabase
            .from('software_products')
            .select('name, price_inr, cover_url, description')
            .eq('slug', slug)
            .single()

        if (error || !soft) {
            return new Response('Software not found', { status: 404 })
        }

        const formatCurrency = (v: number) =>
            new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }).format(v)

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0a0a0a',
                        backgroundImage: 'radial-gradient(circle at 80% 80%, #1e1b4b 0%, #0a0a0a 100%)',
                    }}
                >
                    {/* Background UI Decor */}
                    <div style={{ position: 'absolute', opacity: 0.03, fontSize: 150, top: 40, right: 40, fontWeight: 900, color: '#a6e22e', transform: 'rotate(-5deg)' }}>
                         VST ENGINE
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 60,
                            padding: 60,
                        }}
                    >
                        {/* Software Visual */}
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 350, 
                            height: 350, 
                            borderRadius: 16, 
                            backgroundColor: '#000',
                            border: '1px solid rgba(166,226,46,0.3)',
                            overflow: 'hidden',
                            boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
                        }}>
                            {soft.cover_url ? (
                                <img
                                    src={soft.cover_url}
                                    width="280"
                                    height="280"
                                    style={{ objectFit: 'contain', opacity: 0.9 }}
                                />
                            ) : (
                                <div style={{ fontSize: 100 }}>💿</div>
                            )}
                        </div>

                        {/* Software Content */}
                        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 600 }}>
                            <div style={{ 
                                fontSize: 16, 
                                color: '#a6e22e', 
                                fontWeight: 900, 
                                letterSpacing: 6, 
                                textTransform: 'uppercase', 
                                marginBottom: 15,
                                padding: '4px 12px',
                                border: '1px solid #a6e22e',
                                alignSelf: 'flex-start'
                            }}>
                                PREMIUM SOFTWARE
                            </div>
                            
                            <div style={{ 
                                fontSize: 64, 
                                color: 'white', 
                                fontWeight: 900, 
                                lineHeight: 1.1, 
                                marginBottom: 20,
                                textTransform: 'uppercase'
                            }}>
                                {soft.name}
                            </div>

                            <p style={{ fontSize: 20, color: 'white', opacity: 0.5, marginBottom: 30, lineHeight: 1.4 }}>
                                {soft.description?.substring(0, 120)}...
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <div style={{ 
                                    fontSize: 40, 
                                    color: 'white', 
                                    fontWeight: 900,
                                }}>
                                    {formatCurrency(soft.price_inr)}
                                </div>
                                <div style={{ width: 1, height: 30, backgroundColor: 'white', opacity: 0.1 }} />
                                <div style={{ fontSize: 12, color: 'white', opacity: 0.4, letterSpacing: 2, textTransform: 'uppercase' }}>
                                    LIFETIME UPDATES • WIN / MAC
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Brand Footer */}
                    <div style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        width: '100%', 
                        height: 60, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '0 60px',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        backgroundColor: 'rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ color: 'white', fontSize: 14, fontWeight: 900 }}>SAMPLESWALA.COM</div>
                        <div style={{ color: '#a6e22e', fontSize: 14, fontWeight: 900 }}>SECURE DOWNLOAD</div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                // 🧬 EDGE_CACHING_LOGIC
                headers: {
                    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200'
                }
            }
        )
    } catch (e) {
        console.error("Software OG Error:", e)
        return new Response('Failed to generate software image', { status: 500 })
    }
}
