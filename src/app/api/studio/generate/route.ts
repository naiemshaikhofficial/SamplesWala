import { NextRequest, NextResponse } from 'next/server'
import { generateHuggingFaceAudio, MODELS } from '@/lib/ai/hf-studio'

export async function POST(req: NextRequest) {
  try {
    const { prompt, model = MODELS.MUSIC } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Resilience Engine: Try generating
    let audioBuffer: ArrayBuffer | null = null
    let attempts = 0
    const maxAttempts = 3
    const waitTime = 2000 // 2 seconds between retries if 503

    while (attempts < maxAttempts) {
      try {
        audioBuffer = await generateHuggingFaceAudio(prompt, model)
        break // Success!
      } catch (err: any) {
        if (err.message === 'MODEL_LOADING') {
          console.warn(`Attempt ${attempts + 1}: Model loading, retrying...`)
          attempts++
          await new Promise(resolve => setTimeout(resolve, waitTime))
        } else {
          throw err // Other error, don't retry
        }
      }
    }

    if (!audioBuffer) {
      return NextResponse.json(
        { error: 'AI is currently overloaded or model still loading. Please try again in a few seconds.' },
        { status: 503 }
      )
    }

    // Return binary audio
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error: any) {
    console.error('AI_STUDIO_ERROR:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate audio' },
      { status: 500 }
    )
  }
}
