import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type AIAnalysisResult = {
  mood: string
  genre: string
  description: string
  vibe_score: number
}

export class AIStudioAnalyser {
  /**
   * 🧬 SMART_SIMULATOR (Mocks the AI behavior using metadata)
   * In a production environment, this would call OpenAI Audio or Whisper.
   */
  static async analyzeSample(sample: any): Promise<AIAnalysisResult> {
    const name = sample.name.toLowerCase()
    
    // 🧪 SIMULATED LOGIC: Categorizing based on filename keywords
    let mood = 'Neutral'
    let genre = 'General'
    let description = `A high-quality audio artifact titled "${sample.name}".`
    let vibe_score = 0.5

    if (name.includes('dark') || name.includes('evil') || name.includes('underground')) {
        mood = 'Dark, Suspenseful'
        vibe_score = 0.85
    } else if (name.includes('lofi') || name.includes('chill') || name.includes('ambient')) {
        mood = 'Chilled, Atmospheric'
        vibe_score = 0.7
    } else if (name.includes('drill') || name.includes('trap') || name.includes('club')) {
        mood = 'Aggressive, Energetic'
        genre = 'Trap / Drill'
        vibe_score = 0.9
    }

    if (name.includes('piano')) genre = 'Piano / Keys'
    if (name.includes('vocal')) genre = 'Vocals'
    if (name.includes('drum') || name.includes('kick') || name.includes('snare')) genre = 'Drums / Percussion'

    description = `Premium ${genre} sample with a ${mood} vibe, optimized for modern music production.`

    return { mood, genre, description, vibe_score }
  }

  /**
   * 📡 SIGNAL_SYNC: Processes a sample and updates the DB
   */
  static async process(sampleId: string) {
    try {
        // 1. Fetch Sample Metadata
        const { data: sample, error: fetchError } = await supabaseAdmin
            .from('samples')
            .select('*')
            .eq('id', sampleId)
            .single()

        if (fetchError || !sample) throw new Error(`Fetch failed: ${fetchError?.message}`)

        // Log Start
        await this.log(sampleId, 'INGESTION', { status: 'STARTING_ANALYSIS' })

        // 2. Perform Analysis (Simulated for now)
        const results = await this.analyzeSample(sample)
        
        await this.log(sampleId, 'RESONANCE', { status: 'SIGNAL_DECODED', results })

        // 3. Update Database
        const { error: updateError } = await supabaseAdmin
            .from('samples')
            .update({
                ai_mood: results.mood,
                ai_genre: results.genre,
                ai_description: results.description,
                ai_vibe_score: results.vibe_score,
                ai_is_processed: true
            })
            .eq('id', sampleId)

        if (updateError) throw updateError

        await this.log(sampleId, 'SMART_TAG', { status: 'COMPLETED', metadata_written: true })

        return { success: true, results }
    } catch (error: any) {
        console.error('AI_ANALYSIS_FAILURE:', error)
        await this.log(sampleId, 'FAILURE', { error: error.message })
        return { success: false, error: error.message }
    }
  }

  private static async log(sampleId: string, phase: string, data: any) {
    await supabaseAdmin.from('ai_signal_logs').insert({
        sample_id: sampleId,
        analysis_phase: phase,
        result_data: data
    })
  }
}
