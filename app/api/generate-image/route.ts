import { type NextRequest, NextResponse } from "next/server"
import { aiClient } from "@/lib/ai-client"
import { imageRateLimiter } from "@/lib/rate-limiter"

// Types for image generation
interface ImageGenerationRequest {
  imageDescription: string
  styleType?: "vibrant" | "earth" | "divine"
  sceneType?: "action" | "spiritual" | "general"
}

interface ImageGenerationResponse {
  success: boolean
  imageUrl?: string
  prompt?: string
  metadata?: {
    styleType: string
    sceneType: string
    timestamp: string
  }
  error?: string
}

// Style keywords library from the specification
const STYLE_KEYWORDS = {
  core: "classic Indian comic book art, Amar Chitra Katha inspired, vintage mythological illustration",
  visual:
    "bold black outlines, flat color areas, dramatic composition, heroic proportions, decorative borders, traditional Indian art elements",
  technical: "high detail, sharp focus, professional illustration, clean vector-style art, print-ready quality",
}

const COLOR_PALETTES = {
  vibrant: "rich jewel tones, golden highlights, deep saturated colors",
  earth: "warm earth tones, ochre and vermillion, natural pigment colors",
  divine: "ethereal blues and golds, divine radiance, celestial color palette",
}

const SCENE_ENHANCEMENTS = {
  action: "dynamic action lines, impact effects, heroic proportions",
  spiritual: "divine radiance, ethereal lighting, cosmic background",
  general: "mythological grandeur, cultural authenticity, emotional depth",
}

// Character-specific visual elements
const CHARACTER_STYLES = {
  krishna: "dark blue skin, peacock feather crown, yellow silk garments",
  hanuman: "orange fur, muscular build, devotional expression",
  shiva: "ash-covered skin, third eye, serpents, tiger skin",
  durga: "multiple arms, various weapons, riding a tiger/lion",
  rama: "noble bearing, bow and arrows, royal garments",
  ganesha: "elephant head, rotund belly, mouse companion",
}

function constructImagePrompt(imageDescription: string, styleType = "vibrant", sceneType = "general"): string {
  // Detect character for specific styling
  let characterStyle = ""
  const lowerDescription = imageDescription.toLowerCase()

  for (const [character, style] of Object.entries(CHARACTER_STYLES)) {
    if (lowerDescription.includes(character)) {
      characterStyle = `, ${style}`
      break
    }
  }

  // Construct the complete prompt
  const colorPalette = COLOR_PALETTES[styleType as keyof typeof COLOR_PALETTES] || COLOR_PALETTES.vibrant
  const sceneEnhancement =
    SCENE_ENHANCEMENTS[sceneType as keyof typeof SCENE_ENHANCEMENTS] || SCENE_ENHANCEMENTS.general

  return `${imageDescription}${characterStyle}, ${STYLE_KEYWORDS.core}, ${STYLE_KEYWORDS.visual}, ${colorPalette}, ${sceneEnhancement}, ${STYLE_KEYWORDS.technical}`
}

export async function POST(request: NextRequest) {
  try {
    const {
      imageDescription,
      styleType = "vibrant",
      sceneType = "general",
    }: ImageGenerationRequest = await request.json()

    if (!imageDescription || imageDescription.trim().length === 0) {
      return NextResponse.json({ error: "Image description is required" }, { status: 400 })
    }

    // Rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimit = imageRateLimiter.isAllowed(clientIP)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Please try again later.",
          resetTime: rateLimit.resetTime
        }, 
        { status: 429 }
      )
    }

    // Content safety check for image description
    try {
      const safetyCheck = await aiClient.checkContentSafety(imageDescription)
      if (!safetyCheck.safe) {
        return NextResponse.json({ 
          error: "Image description contains inappropriate content. Please modify your request." 
        }, { status: 400 })
      }
    } catch (error) {
      console.error("Content safety check failed:", error)
      // Continue if safety check fails
    }

    // Generate image using AI
    const imageUrl = await aiClient.generateImage(imageDescription, styleType)

    // Construct the complete image prompt for reference
    const fullPrompt = constructImagePrompt(imageDescription, styleType, sceneType)

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: fullPrompt,
      metadata: {
        styleType,
        sceneType,
        timestamp: new Date().toISOString(),
        rateLimit: {
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime
        }
      },
    })
  } catch (error) {
    console.error("Image generation error:", error)
    return NextResponse.json({ error: "Failed to generate image. Please try again." }, { status: 500 })
  }
}


