// Production configuration for Mythos Engine

export interface AppConfig {
  // AI Configuration
  ai: {
    openai: {
      apiKey: string
      model: string
      maxRetries: number
    }
    contentSafety: {
      enabled: boolean
      filterLevel: 'strict' | 'moderate' | 'lenient'
    }
    qualityValidation: {
      enabled: boolean
      minScore: number
    }
  }
  
  // Rate Limiting
  rateLimit: {
    scriptGeneration: {
      requestsPerMinute: number
      windowMs: number
    }
    imageGeneration: {
      requestsPerMinute: number
      windowMs: number
    }
  }
  
  // Content Generation
  generation: {
    maxSceneLength: number
    minSceneLength: number
    maxRetries: number
    timeoutMs: number
  }
  
  // Image Generation
  image: {
    defaultSize: string
    quality: 'standard' | 'hd'
    style: 'vivid' | 'natural'
    maxPromptLength: number
  }
  
  // Validation
  validation: {
    mythologicalAccuracy: {
      enabled: boolean
      minScore: number
    }
    culturalAuthenticity: {
      enabled: boolean
      minScore: number
    }
    visualCoherence: {
      enabled: boolean
      minScore: number
    }
  }
  
  // Environment
  env: {
    nodeEnv: string
    isProduction: boolean
    isDevelopment: boolean
  }
}

// Load configuration from environment variables
function loadConfig(): AppConfig {
  const nodeEnv = process.env.NODE_ENV || 'development'
  
  return {
    ai: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        maxRetries: parseInt(process.env.MAX_GENERATION_ATTEMPTS || '3')
      },
      contentSafety: {
        enabled: process.env.CONTENT_SAFETY_ENABLED === 'true',
        filterLevel: (process.env.CONTENT_FILTER_LEVEL as 'strict' | 'moderate' | 'lenient') || 'strict'
      },
      qualityValidation: {
        enabled: process.env.QUALITY_VALIDATION_ENABLED === 'true',
        minScore: parseInt(process.env.QUALITY_MIN_SCORE || '70')
      }
    },
    
    rateLimit: {
      scriptGeneration: {
        requestsPerMinute: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '10'),
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000')
      },
      imageGeneration: {
        requestsPerMinute: parseInt(process.env.RATE_LIMIT_IMAGE_PER_MINUTE || '5'),
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000')
      }
    },
    
    generation: {
      maxSceneLength: parseInt(process.env.MAX_SCENE_LENGTH || '20'),
      minSceneLength: parseInt(process.env.MIN_SCENE_LENGTH || '3'),
      maxRetries: parseInt(process.env.MAX_GENERATION_ATTEMPTS || '3'),
      timeoutMs: parseInt(process.env.GENERATION_TIMEOUT_MS || '30000')
    },
    
    image: {
      defaultSize: process.env.DEFAULT_IMAGE_SIZE || '1024x1024',
      quality: (process.env.IMAGE_QUALITY as 'standard' | 'hd') || 'hd',
      style: (process.env.IMAGE_STYLE as 'vivid' | 'natural') || 'vivid',
      maxPromptLength: parseInt(process.env.MAX_IMAGE_PROMPT_LENGTH || '1000')
    },
    
    validation: {
      mythologicalAccuracy: {
        enabled: process.env.MYTHOLOGY_VALIDATION_ENABLED !== 'false',
        minScore: parseInt(process.env.MYTHOLOGY_MIN_SCORE || '75')
      },
      culturalAuthenticity: {
        enabled: process.env.CULTURAL_VALIDATION_ENABLED !== 'false',
        minScore: parseInt(process.env.CULTURAL_MIN_SCORE || '80')
      },
      visualCoherence: {
        enabled: process.env.VISUAL_VALIDATION_ENABLED !== 'false',
        minScore: parseInt(process.env.VISUAL_MIN_SCORE || '70')
      }
    },
    
    env: {
      nodeEnv,
      isProduction: nodeEnv === 'production',
      isDevelopment: nodeEnv === 'development'
    }
  }
}

// Export configuration instance
export const config = loadConfig()

// Configuration validation
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check required environment variables
  if (!config.ai.openai.apiKey) {
    errors.push('OPENAI_API_KEY is required')
  }
  
  if (config.rateLimit.scriptGeneration.requestsPerMinute <= 0) {
    errors.push('Invalid rate limit configuration for script generation')
  }
  
  if (config.rateLimit.imageGeneration.requestsPerMinute <= 0) {
    errors.push('Invalid rate limit configuration for image generation')
  }
  
  if (config.generation.maxSceneLength < config.generation.minSceneLength) {
    errors.push('Max scene length must be greater than min scene length')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Get configuration for specific feature
export function getFeatureConfig(feature: keyof AppConfig): any {
  return config[feature]
}

// Check if feature is enabled
export function isFeatureEnabled(feature: keyof AppConfig['ai'] | keyof AppConfig['validation']): boolean {
  if (feature in config.ai) {
    return config.ai[feature as keyof AppConfig['ai']]?.enabled || false
  }
  
  if (feature in config.validation) {
    return config.validation[feature as keyof AppConfig['validation']]?.enabled || false
  }
  
  return false
}

// Environment-specific configuration
export function getEnvironmentConfig() {
  if (config.env.isProduction) {
    return {
      logLevel: 'error',
      enableDebug: false,
      strictValidation: true,
      enableMetrics: true
    }
  }
  
  return {
    logLevel: 'debug',
    enableDebug: true,
    strictValidation: false,
    enableMetrics: false
  }
}
