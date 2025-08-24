// API client utilities for the Mythos Engine

export interface ScriptGenerationRequest {
  scene: string
  sceneType?: "general" | "action" | "spiritual"
}

export interface ScriptGenerationResponse {
  success: boolean
  script?: {
    narrator_caption: string
    dialogue: string
    image_description: string
  }
  metadata?: {
    scene: string
    sceneType: string
    wordCount: number
    timestamp: string
  }
  error?: string
  details?: string
  stack?: string
  errorType?: "script_generation_error" | "general_error"
}

export async function generateScript(request: ScriptGenerationRequest): Promise<ScriptGenerationResponse> {
  try {
    const response = await fetch("/api/generate-script", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to generate script")
    }

    return await response.json()
  } catch (error) {
    console.error("API client error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Utility function to detect scene type from user input
export function detectSceneType(scene: string): "general" | "action" | "spiritual" {
  const lowerScene = scene.toLowerCase()

  // Action keywords
  const actionKeywords = ["battle", "fight", "leap", "lift", "destroy", "attack", "war", "defeat", "strike", "throw"]
  if (actionKeywords.some((keyword) => lowerScene.includes(keyword))) {
    return "action"
  }

  // Spiritual keywords
  const spiritualKeywords = [
    "meditate",
    "enlighten",
    "divine",
    "cosmic",
    "third eye",
    "blessing",
    "prayer",
    "wisdom",
    "transcend",
  ]
  if (spiritualKeywords.some((keyword) => lowerScene.includes(keyword))) {
    return "spiritual"
  }

  return "general"
}

// Validation utilities
export function validateSceneInput(scene: string): { isValid: boolean; error?: string } {
  if (!scene || scene.trim().length === 0) {
    return { isValid: false, error: "Scene description cannot be empty" }
  }

  const wordCount = scene.trim().split(/\s+/).length
  if (wordCount < 3) {
    return { isValid: false, error: "Scene description is too short. Please provide at least 3 words." }
  }

  if (wordCount > 20) {
    return { isValid: false, error: "Scene description is too long. Please keep it under 20 words for best results." }
  }

  return { isValid: true }
}

// Image generation types and functions
export interface ImageGenerationRequest {
  imageDescription: string
  styleType?: "vibrant" | "earth" | "divine"
  sceneType?: "action" | "spiritual" | "general"
}

export interface ImageGenerationResponse {
  success: boolean
  imageUrl?: string
  prompt?: string
  metadata?: {
    styleType: string
    sceneType: string
    timestamp: string
  }
  error?: string
  details?: string
  stack?: string
  errorType?: "image_generation_error" | "general_error"
}

export async function generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to generate image")
    }

    return await response.json()
  } catch (error) {
    console.error("Image generation API client error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Complete comic panel types and functions
export interface CompleteComicPanelRequest {
  scene: string
  sceneType?: "general" | "action" | "spiritual"
  styleType?: "vibrant" | "earth" | "divine"
}

export interface CompleteComicPanelResponse {
  success: boolean
  script?: {
    narrator_caption: string
    dialogue: string
    image_description: string
  }
  imageUrl?: string
  imagePrompt?: string
  metadata?: {
    scene: string
    sceneType: string
    styleType: string
    timestamp: string
  }
  error?: string
  details?: string
  stack?: string
  errorType?: "script_generation_error" | "image_generation_error" | "general_error"
}

export async function generateCompleteComicPanel(
  request: CompleteComicPanelRequest,
): Promise<CompleteComicPanelResponse> {
  try {
    // Use the complete comic panel endpoint
    const response = await fetch("/api/complete-comic-panel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(typeof errorData === 'object' && errorData !== null && 'error' in errorData && typeof errorData.error === 'string' 
        ? errorData.error 
        : "Failed to generate complete comic panel")
    }

    return await response.json()
  } catch (error) {
    console.error("Complete comic panel generation error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Add more specific error handling with detailed messages
    if (errorMessage.includes("script") || errorMessage.includes("Script")) {
      return {
        success: false,
        error: "Failed to generate script. Please try again with a different scene description.",
        details: errorMessage,
        stack: errorStack,
        errorType: "script_generation_error"
      }
    } else if (errorMessage.includes("image") || errorMessage.includes("Image")) {
      return {
        success: false,
        error: "Failed to generate image. Please try again with a different scene description.",
        details: errorMessage,
        stack: errorStack,
        errorType: "image_generation_error"
      }
    } else {
      return {
        success: false,
        error: "Failed to generate complete comic panel. Please try again.",
        details: errorMessage,
        stack: errorStack,
        errorType: "general_error"
      }
    }
  }
}

// Style type detection utility
export function detectStyleType(scene: string): "vibrant" | "earth" | "divine" {
  const lowerScene = scene.toLowerCase()

  // Divine/cosmic keywords
  const divineKeywords = ["cosmic", "divine", "celestial", "third eye", "enlighten", "transcend", "heaven", "gods"]
  if (divineKeywords.some((keyword) => lowerScene.includes(keyword))) {
    return "divine"
  }

  // Earth/natural keywords
  const earthKeywords = ["mountain", "forest", "earth", "nature", "village", "ground", "tree", "river"]
  if (earthKeywords.some((keyword) => lowerScene.includes(keyword))) {
    return "earth"
  }

  // Default to vibrant for most mythological scenes
  return "vibrant"
}
