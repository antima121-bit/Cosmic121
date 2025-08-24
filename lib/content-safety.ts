// Content safety and filtering system for Mythos Engine

export interface SafetyCheckResult {
  safe: boolean
  flagged: boolean
  categories: Record<string, boolean>
  score: number
  issues: string[]
  suggestions: string[]
}

export interface MythologyAccuracyCheck {
  accurate: boolean
  issues: string[]
  suggestions: string[]
  culturalContext: string[]
}

// Inappropriate content patterns
const INAPPROPRIATE_PATTERNS = {
  violence: [
    /\b(kill|murder|death|blood|gore|torture|pain|suffering)\b/i,
    /\b(war|battle|fight|attack|destroy|crush|smash|burn)\b/i
  ],
  sexual: [
    /\b(sex|sexual|nude|naked|intimate|romance|love|kiss)\b/i
  ],
  hate: [
    /\b(hate|racist|discriminate|insult|curse|swear)\b/i
  ],
  inappropriate: [
    /\b(drug|alcohol|smoke|drunk|high)\b/i
  ]
}

// Mythology accuracy patterns
const MYTHOLOGY_ACCURACY = {
  characters: {
    krishna: {
      positive: ['divine', 'protector', 'teacher', 'cowherd', 'flute', 'peacock'],
      negative: ['evil', 'destructive', 'violent', 'corrupt'],
      context: ['bhagavad gita', 'mahabharata', 'vrindavan', 'mathura']
    },
    hanuman: {
      positive: ['devotee', 'loyal', 'strong', 'monkey', 'bhakti'],
      negative: ['disloyal', 'weak', 'evil', 'corrupt'],
      context: ['ramayana', 'bhakti', 'devotion', 'loyalty']
    },
    shiva: {
      positive: ['destroyer', 'yogi', 'meditation', 'cosmic', 'trident'],
      negative: ['evil', 'corrupt', 'destructive', 'violent'],
      context: ['shaivism', 'yoga', 'meditation', 'kailash']
    }
  },
  concepts: {
    dharma: ['righteousness', 'duty', 'law', 'order', 'virtue'],
    karma: ['action', 'consequence', 'cause', 'effect', 'destiny'],
    moksha: ['liberation', 'freedom', 'enlightenment', 'nirvana'],
    bhakti: ['devotion', 'love', 'worship', 'faith', 'surrender']
  }
}

// Content safety check
export function checkContentSafety(content: string): SafetyCheckResult {
  const lowerContent = content.toLowerCase()
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 100
  let flagged = false

  // Check for inappropriate patterns
  for (const [category, patterns] of Object.entries(INAPPROPRIATE_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        flagged = true
        score -= 20
        issues.push(`Contains ${category} content`)
        
        switch (category) {
          case 'violence':
            suggestions.push('Consider using more peaceful language or focusing on the spiritual aspects')
            break
          case 'sexual':
            suggestions.push('Focus on the divine and spiritual aspects of the story')
            break
          case 'hate':
            suggestions.push('Use respectful and inclusive language')
            break
          case 'inappropriate':
            suggestions.push('Keep content family-friendly and appropriate')
            break
        }
      }
    }
  }

  // Check content length and complexity
  const wordCount = content.split(/\s+/).length
  if (wordCount < 3) {
    score -= 10
    issues.push('Content too short')
    suggestions.push('Provide more descriptive content for better results')
  } else if (wordCount > 50) {
    score -= 15
    issues.push('Content too long')
    suggestions.push('Keep descriptions concise and focused')
  }

  // Check for mythological relevance
  const hasMythologicalElements = checkMythologicalRelevance(lowerContent)
  if (!hasMythologicalElements) {
    score -= 25
    issues.push('Content lacks mythological elements')
    suggestions.push('Include references to Indian mythology, characters, or concepts')
  }

  return {
    safe: score >= 70,
    flagged,
    categories: {
      violence: /violence/i.test(content),
      sexual: /sexual/i.test(content),
      hate: /hate/i.test(content),
      inappropriate: /inappropriate/i.test(content)
    },
    score: Math.max(0, score),
    issues,
    suggestions
  }
}

// Check mythological relevance
function checkMythologicalRelevance(content: string): boolean {
  const mythologicalKeywords = [
    'krishna', 'rama', 'hanuman', 'shiva', 'durga', 'ganesha',
    'mahabharata', 'ramayana', 'bhagavad gita', 'vedas', 'upanishads',
    'temple', 'ashram', 'guru', 'yoga', 'meditation', 'dharma',
    'karma', 'moksha', 'bhakti', 'deva', 'asura', 'avatar'
  ]

  return mythologicalKeywords.some(keyword => content.includes(keyword))
}

// Mythology accuracy check
export function checkMythologyAccuracy(
  content: string,
  character?: string
): MythologyAccuracyCheck {
  const lowerContent = content.toLowerCase()
  const issues: string[] = []
  const suggestions: string[] = []
  const culturalContext: string[] = []
  let accurate = true

  // Check character-specific accuracy
  if (character) {
    const charLower = character.toLowerCase()
    
    if (charLower.includes('krishna')) {
      if (lowerContent.includes('evil') || lowerContent.includes('destructive')) {
        accurate = false
        issues.push('Krishna is typically portrayed as benevolent and protective')
        suggestions.push('Focus on Krishna\'s divine nature and protective qualities')
      }
      culturalContext.push('Vaishnavism', 'Bhagavad Gita', 'Bhakti tradition')
    }
    
    if (charLower.includes('hanuman')) {
      if (lowerContent.includes('disloyal') || lowerContent.includes('corrupt')) {
        accurate = false
        issues.push('Hanuman is known for his unwavering loyalty and devotion')
        suggestions.push('Emphasize Hanuman\'s loyalty and devotion to Rama')
      }
      culturalContext.push('Ramayana', 'Bhakti', 'Devotion')
    }
    
    if (charLower.includes('shiva')) {
      if (lowerContent.includes('evil') || lowerContent.includes('corrupt')) {
        accurate = false
        issues.push('Shiva is a complex deity, not inherently evil')
        suggestions.push('Focus on Shiva\'s role as destroyer of ignorance and ego')
      }
      culturalContext.push('Shaivism', 'Yoga', 'Meditation')
    }
  }

  // Check for cultural sensitivity
  if (lowerContent.includes('caste') || lowerContent.includes('untouchable')) {
    accurate = false
    issues.push('Avoid references to caste discrimination')
    suggestions.push('Focus on universal spiritual values and divine qualities')
  }

  // Check for respectful language
  if (lowerContent.includes('idol') || lowerContent.includes('idol worship')) {
    suggestions.push('Use "deity" or "divine image" instead of "idol"')
  }

  return {
    accurate,
    issues,
    suggestions,
    culturalContext
  }
}

// Content enhancement suggestions
export function getContentEnhancementSuggestions(content: string): string[] {
  const suggestions: string[] = []
  const lowerContent = content.toLowerCase()

  // Check for missing elements
  if (!lowerContent.includes('divine') && !lowerContent.includes('sacred')) {
    suggestions.push('Add divine or sacred elements to enhance mythological significance')
  }

  if (!lowerContent.includes('ancient') && !lowerContent.includes('traditional')) {
    suggestions.push('Include references to ancient or traditional aspects')
  }

  if (!lowerContent.includes('spiritual') && !lowerContent.includes('cosmic')) {
    suggestions.push('Add spiritual or cosmic elements for deeper meaning')
  }

  // Character-specific suggestions
  if (lowerContent.includes('krishna')) {
    suggestions.push('Mention Krishna\'s divine nature and protective qualities')
  }
  
  if (lowerContent.includes('hanuman')) {
    suggestions.push('Emphasize Hanuman\'s devotion and strength')
  }
  
  if (lowerContent.includes('shiva')) {
    suggestions.push('Include Shiva\'s yogic and cosmic aspects')
  }

  return suggestions
}

// Final content validation
export function validateContent(content: string): {
  valid: boolean
  safety: SafetyCheckResult
  accuracy: MythologyAccuracyCheck
  suggestions: string[]
} {
  const safety = checkContentSafety(content)
  const accuracy = checkMythologyAccuracy(content)
  const enhancementSuggestions = getContentEnhancementSuggestions(content)
  
  const allSuggestions = [
    ...safety.suggestions,
    ...accuracy.suggestions,
    ...enhancementSuggestions
  ]

  const valid = safety.safe && accuracy.accurate

  return {
    valid,
    safety,
    accuracy,
    suggestions: allSuggestions
  }
}
