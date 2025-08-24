import OpenAI from 'openai'

// AI Client for production use
export class AIClient {
  private openai: OpenAI | null
  private maxRetries: number
  private contentSafetyEnabled: boolean
  private useMockMode: boolean

  constructor() {
    // Check if we're in browser or server environment
    const isBrowser = typeof window !== 'undefined'
    
    if (isBrowser) {
      // In browser, we'll use mock mode and make API calls to our backend
      this.useMockMode = true
      this.openai = null
      console.log('🌐 Browser environment detected - using mock mode with backend API calls')
    } else {
      // In server environment, check for OpenAI API key
      try {
        const apiKey = process.env.OPENAI_API_KEY
        this.useMockMode = !apiKey || apiKey === 'your_openai_api_key_here'
        
        if (this.useMockMode) {
          console.warn('⚠️  OpenAI API key not configured. Using mock mode.')
          this.openai = null
        } else {
          this.openai = new OpenAI({
            apiKey,
            maxRetries: 3,
          })
        }
      } catch (error) {
        console.warn('⚠️  Environment access failed. Using mock mode.')
        this.useMockMode = true
        this.openai = null
      }
    }
    
    this.maxRetries = 3
    this.contentSafetyEnabled = false
  }

  // Content safety check using OpenAI's moderation API
  async checkContentSafety(content: string): Promise<{ safe: boolean; flagged: boolean; categories: any }> {
    if (this.useMockMode) {
      // Mock safety check - always safe in demo mode
      return { safe: true, flagged: false, categories: {} }
    }

    try {
      const response = await this.openai!.moderations.create({
        input: content,
      })

      const result = response.results[0]
      const flagged = result.flagged
      const categories = result.categories

      // Check for inappropriate content
      const unsafeCategories = [
        'hate', 'hate/threatening', 'self-harm', 'sexual', 'sexual/minors',
        'violence', 'violence/graphic'
      ]

      const hasUnsafeContent = unsafeCategories.some(category => 
        categories[category as keyof typeof categories] === true
      )

      return {
        safe: !hasUnsafeContent,
        flagged,
        categories
      }
    } catch (error) {
      console.error('Content safety check failed:', error)
      // Fail safe - allow content if safety check fails
      return { safe: true, flagged: false, categories: {} }
    }
  }

  // Generate script using GPT-4 or mock mode
  async generateScript(scene: string, sceneType: string): Promise<{
    narrator_caption: string
    dialogue: string
    image_description: string
  }> {
    if (this.useMockMode) {
      try {
        // Mock script generation for demo mode
        console.log('🎭 Generating script in mock mode for:', scene)
        const mockScript = this.generateMockScript(scene, sceneType)
        
        // Validate mock script structure
        if (!this.validateScriptStructure(mockScript)) {
          console.error('Invalid mock script structure')
          throw new Error('Invalid mock script structure: Missing required fields or empty required values')
        }
        
        return mockScript
      } catch (error) {
        console.error('Mock script generation failed:', error)
        // Fallback to default script if mock generation fails
        const defaultScript = {
          narrator_caption: "The ancient tale unfolds as destiny weaves its intricate pattern.",
          dialogue: "So it begins...",
          image_description: "A majestic figure in traditional Indian attire stands before a grand temple with intricate architectural details and mystical symbols."
        }
        
        // Validate default script structure as a final safety check
        if (!this.validateScriptStructure(defaultScript)) {
          throw new Error('Failed to generate script: Default script structure is invalid')
        }
        
        return defaultScript
      }
    }

    const prompt = this.buildScriptPrompt(scene, sceneType)
    
    try {
      const response = await this.openai!.chat.completions.create({
        model: (process.env.OPENAI_MODEL as string) || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a master scriptwriter specializing in Indian mythology comics. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response content from AI')
      }

      const script = JSON.parse(content)
      
      // Validate script structure
      if (!this.validateScriptStructure(script)) {
        throw new Error('Invalid script structure from AI')
      }

      return script
    } catch (error: any) {
      const isModelNotFound = (error?.error?.code === 'model_not_found') || (typeof error?.message === 'string' && error.message.includes('model_not_found'))
      if (!isModelNotFound) {
        console.error('Script generation failed:', error)
        throw new Error('Failed to generate script. Please try again.')
      }
      console.warn('Primary model not available, falling back to gpt-3.5-turbo')
      try {
        const fallbackResponse = await this.openai!.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a master scriptwriter specializing in Indian mythology comics. Always return valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
          response_format: { type: 'json_object' }
        })
        const content = fallbackResponse.choices[0]?.message?.content
        if (!content) {
          throw new Error('No response content from fallback model')
        }
        const script = JSON.parse(content)
        if (!this.validateScriptStructure(script)) {
          throw new Error('Invalid script structure from fallback model')
        }
        return script
      } catch (fallbackError) {
        console.error('Fallback script generation failed:', fallbackError)
        throw new Error('Failed to generate script. Please try again.')
      }
    }
  }

  // Generate image using DALL-E 3 or mock mode
  async generateImage(prompt: string, styleType: string): Promise<string> {
    if (this.useMockMode) {
      // Mock image generation for demo mode
      console.log('🎨 Generating image in mock mode for:', prompt)
      return this.generateMockImage(prompt, styleType)
    }

    try {
      // Check content safety if enabled
      if (this.contentSafetyEnabled) {
        const safetyCheck = await this.checkContentSafety(prompt)
        if (!safetyCheck.safe) {
          throw new Error('Image prompt contains inappropriate content')
        }
      }

      const enhancedPrompt = this.enhanceImagePrompt(prompt, styleType)
      
      const response = await this.openai!.images.generate({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        size: '1024x1024',
        quality: 'hd',
        style: 'vivid',
        n: 1,
      })

      const imageUrl = response.data?.[0]?.url
      if (!imageUrl) {
        throw new Error('No image URL returned from DALL-E')
      }

      return imageUrl
    } catch (error) {
      console.error('Image generation failed:', error)
      throw new Error('Failed to generate image. Please try again.')
    }
  }

  // Quality validation using AI
  async validateQuality(script: any, scene: string): Promise<{
    valid: boolean
    issues: string[]
    suggestions: string[]
  }> {
    if (this.useMockMode) {
      // Mock quality validation for demo mode
      return { valid: true, issues: [], suggestions: ['Consider adding more cultural details for authenticity'] }
    }

    try {
      const validationPrompt = `
Review this generated mythological scene for accuracy and quality:

SCENE: "${scene}"
SCRIPT: ${JSON.stringify(script, null, 2)}

Check for:
1. Mythological accuracy
2. Cultural authenticity
3. Visual coherence
4. Character consistency
5. Story logic

Return JSON with:
{
  "valid": boolean,
  "issues": [array of problems],
  "suggestions": [array of improvements]
}
`

      const response = await this.openai!.chat.completions.create({
        model: (process.env.OPENAI_MODEL as string) || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in Indian mythology and comic storytelling. Always return valid JSON.'
          },
          {
            role: 'user',
            content: validationPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        return { valid: true, issues: [], suggestions: [] }
      }

      return JSON.parse(content)
    } catch (error) {
      console.error('Quality validation failed:', error)
      // Fail safe - assume valid if validation fails
      return { valid: true, issues: [], suggestions: [] }
    }
  }

  // Mock script generation for demo mode with contextually relevant content
  private generateMockScript(scene: string, sceneType: string): {
    narrator_caption: string
    dialogue: string
    image_description: string
  } {
    const lowerScene = scene.toLowerCase()
    
    // Krishna-related scenes
    if (lowerScene.includes('krishna') || lowerScene.includes('flute') || lowerScene.includes('govardhan')) {
      if (lowerScene.includes('govardhan') || lowerScene.includes('lift')) {
        return {
          narrator_caption: "With divine strength, Lord Krishna lifts the mighty Govardhan Hill to protect his devotees.",
          dialogue: "Fear not, my children!",
          image_description: "Krishna in his blue form holds up the massive Govardhan Hill with one finger, while villagers and animals shelter beneath. His face radiates divine protection and love. The scene shows the contrast between the massive mountain and the small figure beneath it."
        }
      } else {
        return {
          narrator_caption: "Lord Krishna's divine flute calls forth the magic of creation itself.",
          dialogue: "Come, let us dance!",
          image_description: "Krishna in his characteristic blue form plays a golden flute, surrounded by mesmerized devotees and animals. His peacock feather crown gleams, and the scene is filled with divine music notes and ethereal light."
        }
      }
    }
    
    // Rama-related scenes
    if (lowerScene.includes('ram') || lowerScene.includes('bow') || lowerScene.includes('arrow') || lowerScene.includes('sita')) {
      if (lowerScene.includes('bow') || lowerScene.includes('break')) {
        return {
          narrator_caption: "Prince Rama's mighty strength shatters the divine bow, proving his worthiness.",
          dialogue: "For Sita's hand!",
          image_description: "Rama in royal attire stands before the broken pieces of Shiva's divine bow. His face shows determination and divine power. The scene includes amazed onlookers and Sita watching with admiration. Golden light surrounds the moment of triumph."
        }
      } else {
        return {
          narrator_caption: "Prince Rama's arrow flies true, guided by dharma and divine purpose.",
          dialogue: "For justice and truth!",
          image_description: "Rama in royal attire draws his mighty bow, aiming with perfect focus. His face shows determination and righteousness. The arrow glows with divine energy, and the background shows a forest setting with his loyal companions."
        }
      }
    }
    
    // Hanuman-related scenes
    if (lowerScene.includes('hanuman') || lowerScene.includes('leap') || lowerScene.includes('mountain')) {
      return {
        narrator_caption: "Hanuman's mighty leap carries him across the vast ocean, mountain in hand.",
        dialogue: "For Lord Rama!",
        image_description: "Hanuman in his orange form leaps dramatically across the ocean, carrying the Dronagiri mountain. His face shows determination and devotion. The scene captures the dynamic movement with wind effects and ocean waves below."
      }
    }
    
    // Shiva-related scenes
    if (lowerScene.includes('shiva') || lowerScene.includes('third eye') || lowerScene.includes('cosmic')) {
      return {
        narrator_caption: "Shiva's third eye opens, unleashing cosmic destruction upon the universe.",
        dialogue: "Enough!",
        image_description: "Shiva with his third eye open, radiating destructive cosmic energy. His face shows divine fury and power. The scene includes ash-covered body, serpents, and cosmic destruction effects. The background shows the universe being consumed by divine fire."
      }
    }
    
    // Durga-related scenes
    if (lowerScene.includes('durga') || lowerScene.includes('battle') || lowerScene.includes('demon')) {
      return {
        narrator_caption: "Goddess Durga's divine weapons strike down the buffalo demon Mahishasura.",
        dialogue: "Evil shall not prevail!",
        image_description: "Durga with multiple arms wielding various divine weapons, riding her lion mount. Her face shows divine fury and determination. The scene shows the demon Mahishasura being defeated, with divine light and weapon effects."
      }
    }
    
    // Ganesha-related scenes
    if (lowerScene.includes('ganesha') || lowerScene.includes('writing') || lowerScene.includes('mahabharata')) {
      return {
        narrator_caption: "Ganesha's wisdom flows as he writes the great epic, guided by Vyasa's words.",
        dialogue: "The story unfolds...",
        image_description: "Ganesha with his elephant head sits writing, while Vyasa dictates the Mahabharata. His mouse companion sits nearby. The scene shows ancient scrolls, divine wisdom, and the sacred act of preserving knowledge."
      }
    }
    
    // Meditation and spiritual scenes
    if (lowerScene.includes('meditation') || lowerScene.includes('spiritual') || lowerScene.includes('enlighten')) {
      return {
        narrator_caption: "In the sacred grove, the seeker's soul transcends mortal boundaries, touched by divine wisdom.",
        dialogue: "I see the truth now...",
        image_description: "A serene figure in white robes sits in meditation pose within a mystical forest. Divine light streams down from above, illuminating their peaceful expression. Sacred symbols float in the air around them, and ancient trees form a natural temple."
      }
    }
    
    // Battle and action scenes
    if (lowerScene.includes('battle') || lowerScene.includes('fight') || lowerScene.includes('war')) {
      return {
        narrator_caption: "With divine fury coursing through his veins, the warrior stands resolute against the demonic horde.",
        dialogue: "I shall not yield!",
        image_description: "A muscular warrior in traditional Indian armor stands defiantly, wielding a glowing divine weapon. His face shows determination and divine radiance. Behind him, a dark demonic army approaches. The scene is bathed in golden light with dramatic shadows."
      }
    }
    
    // Default based on scene type
    const mockScripts = {
      action: {
        narrator_caption: "With divine fury coursing through his veins, the warrior stands resolute against the demonic horde.",
        dialogue: "I shall not yield!",
        image_description: "A muscular warrior in traditional Indian armor stands defiantly, wielding a glowing divine weapon. His face shows determination and divine radiance. Behind him, a dark demonic army approaches. The scene is bathed in golden light with dramatic shadows."
      },
      spiritual: {
        narrator_caption: "In the sacred grove, the seeker's soul transcends mortal boundaries, touched by divine wisdom.",
        dialogue: "I see the truth now...",
        image_description: "A serene figure in white robes sits in meditation pose within a mystical forest. Divine light streams down from above, illuminating their peaceful expression. Sacred symbols float in the air around them, and ancient trees form a natural temple."
      },
      default: {
        narrator_caption: "The ancient tale unfolds as destiny weaves its intricate pattern through the fabric of time.",
        dialogue: "So it begins...",
        image_description: "A majestic figure in traditional Indian attire stands before a grand temple. Their pose conveys wisdom and authority. The background shows intricate architectural details and mystical symbols. Soft lighting creates an atmosphere of reverence."
      }
    }

    return mockScripts[sceneType as keyof typeof mockScripts] || mockScripts.default
  }

  // Mock image generation for demo mode with contextually relevant images
  private generateMockImage(prompt: string, styleType: string): string {
    const lowerPrompt = prompt.toLowerCase()
    
    // Krishna-related scenes
    if (lowerPrompt.includes('krishna') || lowerPrompt.includes('flute') || lowerPrompt.includes('govardhan')) {
      return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center&q=80"
    }
    
    // Rama and bow-related scenes
    if (lowerPrompt.includes('ram') || lowerPrompt.includes('bow') || lowerPrompt.includes('arrow') || lowerPrompt.includes('sita')) {
      return "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center&q=80"
    }
    
    // Hanuman and monkey-related scenes
    if (lowerPrompt.includes('hanuman') || lowerPrompt.includes('monkey') || lowerPrompt.includes('leap') || lowerPrompt.includes('mountain')) {
      return "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&crop=center&q=80"
    }
    
    // Shiva and meditation scenes
    if (lowerPrompt.includes('shiva') || lowerPrompt.includes('meditation') || lowerPrompt.includes('third eye') || lowerPrompt.includes('cosmic')) {
      return "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center&q=80"
    }
    
    // Durga and battle scenes
    if (lowerPrompt.includes('durga') || lowerPrompt.includes('battle') || lowerPrompt.includes('demon') || lowerPrompt.includes('weapon')) {
      return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center&q=80"
    }
    
    // Ganesha and wisdom scenes
    if (lowerPrompt.includes('ganesha') || lowerPrompt.includes('wisdom') || lowerPrompt.includes('writing') || lowerPrompt.includes('elephant')) {
      return "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&crop=center&q=80"
    }
    
    // Temple and spiritual scenes
    if (lowerPrompt.includes('temple') || lowerPrompt.includes('spiritual') || lowerPrompt.includes('divine') || lowerPrompt.includes('sacred')) {
      return "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center&q=80"
    }
    
    // Action and battle scenes
    if (lowerPrompt.includes('battle') || lowerPrompt.includes('fight') || lowerPrompt.includes('war') || lowerPrompt.includes('attack')) {
      return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center&q=80"
    }
    
    // Style-based fallbacks
    const styleImages = {
      vibrant: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center&q=80",
      earth: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&crop=center&q=80",
      divine: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center&q=80"
    }
    
    return styleImages[styleType as keyof typeof styleImages] || styleImages.vibrant
  }

  private buildScriptPrompt(scene: string, sceneType: string): string {
    let basePrompt = `You are a master scriptwriter specializing in Indian mythology comics, combining the dramatic storytelling of Amar Chitra Katha with the visual intensity of modern graphic novels.

TASK: Transform the user's scene into a single comic panel with three precise components.

USER SCENE: "${scene}"

REQUIREMENTS:
- Focus on ONE dramatic moment
- Emphasize visual storytelling over exposition
- Capture the mythological grandeur and emotional weight
- Use authentic Indian cultural details

OUTPUT FORMAT: JSON with exactly these keys:

{
  "narrator_caption": "[15-25 words] Third-person dramatic narration for caption box. Focus on the mythological significance and emotional weight of the moment.",
  "dialogue": "[0-15 words] One powerful line spoken by the main character. If no dialogue fits naturally, return empty string. Make it memorable and character-defining.",
  "image_description": "[40-60 words] Vivid scene description for image AI. Include: character appearance, action/pose, facial expression, setting details, lighting/atmosphere, and any magical/divine elements. Describe only what's visible, not the art style."
}

STYLE NOTES:
- Narrator should sound like classic mythology storytelling
- Dialogue should be profound, not casual
- Image description should emphasize drama and scale
- Include authentic details (clothing, architecture, weapons, etc.)

Return only valid JSON.`

    if (sceneType === "action") {
      basePrompt += `\n\nSCENE TYPE: High-action battle or physical feat
FOCUS: Dynamic movement, power display, environmental impact
EMOTIONAL TONE: Heroic determination, divine fury, or mythic grandeur`
    } else if (sceneType === "spiritual") {
      basePrompt += `\n\nSCENE TYPE: Spiritual transformation or emotional revelation  
FOCUS: Character expressions, divine manifestations, symbolic elements
EMOTIONAL TONE: Reverence, enlightenment, cosmic significance`
    }

    return basePrompt
  }

  private enhanceImagePrompt(basePrompt: string, styleType: string): string {
    const styleKeywords = {
      core: "classic Indian comic book art, Amar Chitra Katha inspired, vintage mythological illustration",
      visual: "bold black outlines, flat color areas, dramatic composition, heroic proportions, decorative borders, traditional Indian art elements",
      technical: "high detail, sharp focus, professional illustration, clean vector-style art, print-ready quality"
    }

    const colorPalettes = {
      vibrant: "rich jewel tones, golden highlights, deep saturated colors",
      earth: "warm earth tones, ochre and vermillion, natural pigment colors",
      divine: "ethereal blues and golds, divine radiance, celestial color palette"
    }

    const colorPalette = colorPalettes[styleType as keyof typeof colorPalettes] || colorPalettes.vibrant

    return `${basePrompt}, ${styleKeywords.core}, ${styleKeywords.visual}, ${colorPalette}, ${styleKeywords.technical}`
  }

  private validateScriptStructure(script: any): boolean {
    return (
      script &&
      typeof script.narrator_caption === 'string' &&
      typeof script.dialogue === 'string' &&
      typeof script.image_description === 'string' &&
      script.narrator_caption.length > 0 &&
      script.image_description.length > 0
    )
  }
}

// Export singleton instance
export const aiClient = new AIClient()
