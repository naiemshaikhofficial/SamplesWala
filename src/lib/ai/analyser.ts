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
   * 🧬 AI_RESONANCE_ENGINE (Upgraded Simulation)
   * More varied keyword detection and probabilistic attribution for a realistic feel.
   */
  static async analyzeSample(sample: any): Promise<AIAnalysisResult> {
    const originalName = sample.name || ''
    // Split by underscores, spaces, hyphens and dots to get clean words
    const words = originalName.toLowerCase().split(/[_ \-\.]+/);
    
    // 🧪 THE PERFECTIONIST'S KEYWORD MAP
    const moods = [
        { keys: ['dark', 'evil', 'underground', 'shadow', 'ominous', 'hard'], val: 'Dark, Ominous', score: 0.90 },
        { keys: ['lofi', 'chill', 'ambient', 'smooth', 'relax', 'dreamy', 'soulful'], val: 'Chilled, Atmospheric', score: 0.75 },
        { keys: ['drill', 'trap', 'club', 'hype', 'aggressive', 'tough'], val: 'Aggressive, Energetic', score: 0.94 },
        { keys: ['bright', 'pop', 'happy', 'uplifting', 'summer', 'festive'], val: 'Bright, Uplifting', score: 0.88 },
        { keys: ['sad', 'melancholy', 'emotional', 'deep', 'minor', 'bluesy'], val: 'Melancholic, Deep', score: 0.80 },
        { keys: ['cinematic', 'epic', 'trailer', 'tension', 'orchestral'], val: 'Cinematic, Dramatic', score: 0.95 },
        { keys: ['bolly', 'indian', 'masala', 'cultural', 'desi', 'bollywood', 'desi', 'mumbai'], val: 'Vibrant, Cultural', score: 0.96 }
    ]

    const genres = [
        // Prioritize specific regional genres
        { keys: ['dhol', 'tabla', 'sitar', 'sarangi', 'harmonium', 'shehnai', 'tanpura', 'bollywood', 'classical'], val: 'Indian Classical / Bollywood' },
        { keys: ['tapori', 'bhaigiri', 'mumbai', 'local', 'street', 'dadas'], val: 'Tapori / Street Style' },
        { keys: ['south', 'kuthu', 'dappu', 'tamil', 'telugu', 'parai'], val: 'South Indian / Folk' },
        
        // General categories
        { keys: ['piano', 'keys', 'rhodes', 'wurlitzer', 'keyboard'], val: 'Piano & Keys' },
        { keys: ['vocal', 'acapella', 'vox', 'shout', 'singing'], val: 'Vocals & Chops' },
        { keys: ['drum', 'kick', 'snare', 'perc', 'hihat', 'clap', 'loop', 'kit'], val: 'Percussive' },
        { keys: ['bass', 'sub', 'low', '808', 'reese'], val: 'Bass / Sub' },
        { keys: ['guitar', 'electric', 'acoustic', 'plucked', 'strat'], val: 'Guitars' },
        { keys: ['syn', 'lead', 'pluck', 'arp', 'saw', 'serum', 'sylenth'], val: 'Synth / Electronics' },
        { keys: ['pad', 'atmos', 'scape', 'dream'], val: 'Pads & Textures' },
        { keys: ['flute', 'brass', 'horn', 'sax', 'woodwind', 'bansuri'], val: 'Wind / Instrumental' }
    ]

    // 🧬 PERFECT DETECTION: Finding the best match based on exact word matches
    let detectedMood = moods.find(m => m.keys.some(k => words.includes(k)));
    let detectedGenre = genres.find(g => g.keys.some(k => words.includes(k)));

    // Fallbacks with a sophisticated touch
    let mood = detectedMood?.val || ['Sophisticated', 'Balanced', 'Organic', 'Resonant', 'Versatile'][Math.floor(Math.random() * 5)];
    let genre = detectedGenre?.val || ['Melodic Artifact', 'Sonic Texture', 'Producer Essential'][Math.floor(Math.random() * 3)];
    let vibe_score = detectedMood?.score || (0.5 + Math.random() * 0.35);

    // 📑 HIGH-DEFINITION DESCRIPTION
    const prefix = ['High-fidelity', 'Professional-grade', 'Masterfully crafted', 'Studio-optimized', 'Industry-standard'];
    const body = [
        `exhibiting ${mood.toLowerCase()} characteristics perfectly suited for a modern ${genre.toLowerCase()} production.`,
        `precisely engineered for layering and complex sound design within the ${genre.toLowerCase()} ecosystem.`,
        `featuring a signature sonic profile with a refined ${mood.toLowerCase()} aesthetic that cuts through any mix.`,
        `calibrated for maximum emotional impact as a standalone ${genre.toLowerCase()} element in your project.`
    ];

    const description = `${prefix[Math.floor(Math.random() * prefix.length)]} ${genre} sample ${body[Math.floor(Math.random() * body.length)]}`;

    return { 
        mood, 
        genre, 
        description, 
        vibe_score: parseFloat(vibe_score.toFixed(2)) 
    }
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
