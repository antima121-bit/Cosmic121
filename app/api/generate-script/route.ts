import { type NextRequest, NextResponse } from "next/server"
import { aiClient } from "@/lib/ai-client"
import { scriptRateLimiter } from "@/lib/rate-limiter"

// Types for the LLM response
interface ScriptResponse {
  narrator_caption: string
  dialogue: string
  image_description: string
}

export async function POST(request: NextRequest) {
  try {
    const { scene, sceneType = "general" } = await request.json()

    if (!scene || scene.trim().length === 0) {
      return NextResponse.json({ error: "Scene description is required" }, { status: 400 })
    }

    // Validate scene length (5-15 words as per specification)
    const wordCount = scene.trim().split(/\s+/).length
    if (wordCount < 3 || wordCount > 20) {
      return NextResponse.json({ error: "Scene description should be 3-20 words for optimal results" }, { status: 400 })
    }

    // Rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimit = scriptRateLimiter.isAllowed(clientIP)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Please try again later.",
          resetTime: rateLimit.resetTime
        }, 
        { status: 429 }
      )
    }

    // Content safety check
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
    const script = await aiClient.generateScript(scene, sceneType)

    // Quality validation
    try {
      const qualityCheck = await aiClient.validateQuality(script, scene)
      if (!qualityCheck.valid) {
        console.warn("Quality validation failed:", qualityCheck.issues)
        // Continue with generation but log issues
      }
    } catch (error) {
      console.error("Quality validation failed:", error)
      // Continue if validation fails
    }

    return NextResponse.json({
      success: true,
      script,
      metadata: {
        scene,
        sceneType,
        wordCount,
        timestamp: new Date().toISOString(),
        rateLimit: {
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime
        }
      },
    })
  } catch (error) {
    console.error("Script generation error:", error)
    return NextResponse.json({ error: "Failed to generate script. Please try again." }, { status: 500 })
  }
}


