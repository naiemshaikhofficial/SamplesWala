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

        // 🧬 SECURE_FETCH: Get Pack Data
        const { data: pack, error } = await supabase
            .from('sample_packs')
            .select('name, price_inr, cover_url')
            .eq('slug', slug)
            .single()

        if (error || !pack) {
            return new Response('Pack not found', { status: 404 })
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
                        backgroundColor: '#050505',
                        backgroundImage: 'radial-gradient(circle at 20% 20%, #1a2e05 0%, #050505 100%)',
                    }}
                >
                    {/* Background Logo Watermark */}
                    <div style={{ position: 'absolute', opacity: 0.05, fontSize: 180, bottom: -20, left: 40, fontWeight: 900, color: 'white', letterSpacing: -5 }}>
                        SAMPLESWALA
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 50,
                            padding: 60,
                        }}
                    >
                        {/* Pack Cover */}
                        <div style={{ 
                            display: 'flex', 
                            position: 'relative', 
                            width: 380, 
                            height: 380, 
                            borderRadius: 4, 
                            overflow: 'hidden', 
                            border: '4px solid #a6e22e',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                        }}>
                            <img
                                src={pack.cover_url?.startsWith('http') ? pack.cover_url : `${SITE_URL}${pack.cover_url}`}
                                width="380"
                                height="380"
                                style={{ objectFit: 'cover' }}
                            />
                        </div>

                        {/* Info Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 600 }}>
                            <div style={{ 
                                fontSize: 20, 
                                color: '#a6e22e', 
                                fontWeight: 900, 
                                letterSpacing: 8, 
                                textTransform: 'uppercase', 
                                marginBottom: 20,
                                opacity: 0.8
                            }}>
                                DRUM KIT // SAMPLE PACK
                            </div>
                            
                            <div style={{ 
                                fontSize: 72, 
                                color: 'white', 
                                fontWeight: 900, 
                                lineHeight: 1, 
                                marginBottom: 30,
                                textTransform: 'uppercase',
                                letterSpacing: -2,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                {pack.name}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <div style={{ 
                                    fontSize: 48, 
                                    color: 'white', 
                                    fontWeight: 900,
                                    backgroundColor: '#a6e22e',
                                    padding: '5px 20px',
                                    color: 'black',
                                    borderRadius: 2
                                }}>
                                    {formatCurrency(pack.price_inr)}
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: 16, color: '#a6e22e', fontWeight: 900, letterSpacing: 2 }}>
                                        ROYALTY FREE
                                    </div>
                                    <div style={{ fontSize: 14, color: 'white', opacity: 0.4 }}>
                                        Immediate Digital Delivery
                                    </div>
                                </div>
                            </div>

                            <div style={{ 
                                marginTop: 40, 
                                fontSize: 18, 
                                color: 'white', 
                                opacity: 0.3, 
                                letterSpacing: 4,
                                textTransform: 'uppercase',
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                paddingTop: 20
                            }}>
                                WWW.SAMPLESWALA.COM
                            </div>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        )
    } catch (e) {
        console.error("OG Generation Error:", e)
        return new Response('Failed to generate image', { status: 500 })
    }
}
