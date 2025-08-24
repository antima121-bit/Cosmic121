import { type NextRequest, NextResponse } from "next/server"
import { aiClient } from "@/lib/ai-client"
import { scriptRateLimiter, imageRateLimiter } from "@/lib/rate-limiter"

interface CompleteComicPanelRequest {
  scene: string
  sceneType?: "general" | "action" | "spiritual"
  styleType?: "vibrant" | "earth" | "divine"
}

interface CompleteComicPanelResponse {
  success: boolean
  script?: {
    narrator_caption: string
    dialogue: string
    image_description: string
  }
  imageUrl?: string
  metadata?: {
    scene: string
    sceneType: string
    styleType: string
    timestamp: string
  }
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const { scene, sceneType = "general", styleType = "vibrant" }: CompleteComicPanelRequest = await request.json()

    if (!scene || scene.trim().length === 0) {
      return NextResponse.json({ error: "Scene description is required" }, { status: 400 })
    }

    // Validate scene length
    const wordCount = scene.trim().split(/\s+/).length
    if (wordCount < 3 || wordCount > 20) {
      return NextResponse.json({ error: "Scene description should be 3-20 words for optimal results" }, { status: 400 })
    }

    // Rate limiting for script generation
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const scriptRateLimit = scriptRateLimiter.isAllowed(clientIP)
    
    if (!scriptRateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Script generation rate limit exceeded. Please try again later.",
          resetTime: scriptRateLimit.resetTime
        }, 
        { status: 429 }
      )
    }

    // Content safety check for scene
    try {
      const safetyCheck = await aiClient.checkContentSafety(scene)
      if (!safetyCheck.safe) {
        return NextResponse.json({ 
          error: "Scene description contains inappropriate content. Please modify your request." 
        }, { status: 400 })
      }
    } catch (error) {
      console.error("Content safety check failed:", error)
      // Continue if safety check fails
    }

    // Generate script using AI
    console.log('🎭 Starting script generation for scene:', scene)
    let script;
    try {
      script = await aiClient.generateScript(scene, sceneType)
      console.log('✅ Script generated successfully:', script)
      
      // Validate script structure as an additional safety check
      if (!script || 
          typeof script.narrator_caption !== 'string' || 
          typeof script.dialogue !== 'string' || 
          typeof script.image_description !== 'string' || 
          script.narrator_caption.trim().length === 0 || 
          script.image_description.trim().length === 0) {
        throw new Error('Generated script is incomplete or invalid: Missing required fields or empty required values')
      }
    } catch (error) {
      console.error('❌ Script generation failed:', error)
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : "Failed to generate script. Please try again.",
        success: false,
        details: error instanceof Error ? error.stack : String(error)
      }, { status: 500 })
    }

    // Quality validation for script
    try {
      const qualityCheck = await aiClient.validateQuality(script, scene)
      if (!qualityCheck.valid) {
        console.warn("Script quality validation failed:", qualityCheck.issues)
        // Continue with generation but log issues
      }
    } catch (error) {
      console.error("Script quality validation failed:", error)
      // Continue if validation fails
    }

    // Rate limiting for image generation
    const imageRateLimit = imageRateLimiter.isAllowed(clientIP)
    
    if (!imageRateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Image generation rate limit exceeded. Please try again later.",
          resetTime: imageRateLimit.resetTime
        }, 
        { status: 429 }
      )
    }

    // Generate image using AI
    console.log('🎨 Starting image generation for prompt:', script.image_description)
    const imageUrl = await aiClient.generateImage(script.image_description, styleType)
    console.log('✅ Image generated successfully:', imageUrl)

    return NextResponse.json({
      success: true,
      script,
      imageUrl,
      metadata: {
        scene,
        sceneType,
        styleType,
        timestamp: new Date().toISOString(),
        rateLimit: {
          scriptRemaining: scriptRateLimit.remaining,
          imageRemaining: imageRateLimit.remaining,
          resetTime: Math.max(scriptRateLimit.resetTime, imageRateLimit.resetTime)
        }
      },
    })
  } catch (error) {
    console.error("Complete comic panel generation error:", error)
    
    // Provide more specific error messages
    let errorMessage = "Failed to generate complete comic panel. Please try again."
    
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.stack : String(error)
    }, { status: 500 })
  }
}
