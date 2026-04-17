export const MODELS = {
  MUSIC: 'facebook/musicgen-small',
  MUSIC_MD: 'facebook/musicgen-medium',
  SFX: 'cvssp/audioldm-m-full',
  STABLE: 'stabilityai/stable-audio-open-1.0'
}

export async function generateHuggingFaceAudio(prompt: string, model: string = MODELS.MUSIC) {
  const token = process.env.HF_TOKEN
  
  if (!token && process.env.NODE_ENV === 'production') {
    throw new Error('HF_TOKEN is missing in production environment.')
  }

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ inputs: prompt }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    // 503 means model is loading, we can retry or use fallback
    if (response.status === 503) {
      throw new Error('MODEL_LOADING')
    }
    throw new Error(`HF_API_ERROR: ${response.status} - ${error}`)
  }

  return response.arrayBuffer()
}
