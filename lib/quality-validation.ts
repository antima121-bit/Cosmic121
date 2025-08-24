// Quality validation system for Mythos Engine

export interface QualityValidationResult {
  valid: boolean
  score: number
  issues: string[]
  suggestions: string[]
  strengths: string[]
  metadata: {
    mythologicalAccuracy: number
    visualCoherence: number
    culturalAuthenticity: number
    storytellingQuality: number
  }
}

export interface ValidationRule {
  name: string
  description: string
  weight: number
  validator: (content: any, context: any) => ValidationResult
}

interface ValidationResult {
  passed: boolean
  score: number
  issues: string[]
  suggestions: string[]
}

// Quality validation rules
const VALIDATION_RULES: ValidationRule[] = [
  {
    name: "Mythological Accuracy",
    description: "Ensures content aligns with traditional Indian mythology",
    weight: 0.3,
    validator: validateMythologicalAccuracy
  },
  {
    name: "Visual Coherence",
    description: "Checks if visual elements work together logically",
    weight: 0.25,
    validator: validateVisualCoherence
  },
  {
    name: "Cultural Authenticity",
    description: "Verifies cultural elements are respectful and accurate",
    weight: 0.25,
    validator: validateCulturalAuthenticity
  },
  {
    name: "Storytelling Quality",
    description: "Assesses narrative structure and emotional impact",
    weight: 0.2,
    validator: validateStorytellingQuality
  }
]

// Main validation function
export function validateQuality(
  script: any,
  scene: string,
  context: any = {}
): QualityValidationResult {
  const results: ValidationResult[] = []
  let totalScore = 0
  let totalWeight = 0

  // Run all validation rules
  for (const rule of VALIDATION_RULES) {
    const result = rule.validator(script, { scene, ...context })
    results.push(result)
    
    const weightedScore = result.score * rule.weight
    totalScore += weightedScore
    totalWeight += rule.weight
  }

  // Calculate final score
  const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0
  
  // Collect all issues and suggestions
  const allIssues: string[] = []
  const allSuggestions: string[] = []
  const allStrengths: string[] = []

  for (const result of results) {
    allIssues.push(...result.issues)
    allSuggestions.push(...result.suggestions)
    
    if (result.score >= 80) {
      allStrengths.push(`Strong ${result.score >= 90 ? 'excellent' : 'good'} quality`)
    }
  }

  // Calculate metadata scores
  const metadata = {
    mythologicalAccuracy: results[0]?.score || 0,
    visualCoherence: results[1]?.score || 0,
    culturalAuthenticity: results[2]?.score || 0,
    storytellingQuality: results[3]?.score || 0
  }

  return {
    valid: finalScore >= 70,
    score: Math.round(finalScore),
    issues: allIssues,
    suggestions: allSuggestions,
    strengths: allStrengths,
    metadata
  }
}

// Mythological accuracy validation
function validateMythologicalAccuracy(script: any, context: any): ValidationResult {
  const { scene } = context
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 100

  // Check character consistency
  const characterNames = extractCharacterNames(scene)
  for (const character of characterNames) {
    const accuracy = checkCharacterAccuracy(character, script)
    if (!accuracy.accurate) {
      score -= 15
      issues.push(...accuracy.issues)
      suggestions.push(...accuracy.suggestions)
    }
  }

  // Check for mythological concepts
  const hasMythologicalElements = checkMythologicalElements(script)
  if (!hasMythologicalElements) {
    score -= 20
    issues.push("Missing core mythological elements")
    suggestions.push("Include references to divine powers, sacred places, or spiritual concepts")
  }

  // Check cultural context
  const culturalContext = checkCulturalContext(script)
  if (culturalContext.issues.length > 0) {
    score -= 10
    issues.push(...culturalContext.issues)
    suggestions.push(...culturalContext.suggestions)
  }

  return {
    passed: score >= 70,
    score: Math.max(0, score),
    issues,
    suggestions
  }
}

// Visual coherence validation
function validateVisualCoherence(script: any, context: any): ValidationResult {
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 100

  // Check image description quality
  const imageDesc = script.image_description || ""
  
  if (imageDesc.length < 30) {
    score -= 15
    issues.push("Image description too short")
    suggestions.push("Provide more detailed visual description")
  }

  if (imageDesc.length > 100) {
    score -= 10
    issues.push("Image description too long")
    suggestions.push("Keep description concise but detailed")
  }

  // Check for visual elements
  const visualElements = [
    'character', 'pose', 'expression', 'setting', 'lighting',
    'clothing', 'weapons', 'background', 'atmosphere'
  ]

  const missingElements = visualElements.filter(element => 
    !imageDesc.toLowerCase().includes(element)
  )

  if (missingElements.length > 3) {
    score -= 20
    issues.push(`Missing key visual elements: ${missingElements.slice(0, 3).join(', ')}`)
    suggestions.push("Include character appearance, setting, and atmosphere details")
  }

  // Check for logical consistency
  if (hasLogicalInconsistencies(imageDesc)) {
    score -= 15
    issues.push("Visual elements have logical inconsistencies")
    suggestions.push("Ensure all visual elements work together logically")
  }

  return {
    passed: score >= 70,
    score: Math.max(0, score),
    issues,
    suggestions
  }
}

// Cultural authenticity validation
function validateCulturalAuthenticity(script: any, context: any): ValidationResult {
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 100

  // Check for respectful language
  const disrespectfulTerms = ['idol', 'pagan', 'primitive', 'superstitious']
  const hasDisrespectfulTerms = disrespectfulTerms.some(term => 
    script.narrator_caption?.toLowerCase().includes(term) ||
    script.image_description?.toLowerCase().includes(term)
  )

  if (hasDisrespectfulTerms) {
    score -= 25
    issues.push("Contains disrespectful language")
    suggestions.push("Use respectful and culturally appropriate terminology")
  }

  // Check for cultural stereotypes
  if (hasCulturalStereotypes(script)) {
    score -= 20
    issues.push("Contains cultural stereotypes")
    suggestions.push("Avoid oversimplified cultural representations")
  }

  // Check for authentic cultural elements
  const hasAuthenticElements = checkAuthenticCulturalElements(script)
  if (!hasAuthenticElements) {
    score -= 15
    issues.push("Missing authentic cultural elements")
    suggestions.push("Include specific cultural details and traditions")
  }

  return {
    passed: score >= 70,
    score: Math.max(0, score),
    issues,
    suggestions
  }
}

// Storytelling quality validation
function validateStorytellingQuality(script: any, context: any): ValidationResult {
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 100

  // Check narrator caption quality
  const caption = script.narrator_caption || ""
  
  if (caption.length < 15) {
    score -= 15
    issues.push("Narrator caption too short")
    suggestions.push("Provide more descriptive narration")
  }

  if (caption.length > 35) {
    score -= 10
    issues.push("Narrator caption too long")
    suggestions.push("Keep narration concise but impactful")
  }

  // Check dialogue quality
  const dialogue = script.dialogue || ""
  if (dialogue && dialogue.length > 20) {
    score -= 10
    issues.push("Dialogue too long")
    suggestions.push("Keep dialogue short and impactful")
  }

  // Check emotional impact
  const emotionalWords = ['divine', 'sacred', 'majestic', 'powerful', 'beautiful', 'awe-inspiring']
  const hasEmotionalImpact = emotionalWords.some(word => 
    caption.toLowerCase().includes(word) || dialogue.toLowerCase().includes(word)
  )

  if (!hasEmotionalImpact) {
    score -= 15
    issues.push("Lacks emotional impact")
    suggestions.push("Include words that convey mythological grandeur")
  }

  // Check narrative structure
  if (!hasNarrativeStructure(caption)) {
    score -= 10
    issues.push("Poor narrative structure")
    suggestions.push("Create a clear beginning, middle, and end in the narration")
  }

  return {
    passed: score >= 70,
    score: Math.max(0, score),
    issues,
    suggestions
  }
}

// Helper functions
function extractCharacterNames(scene: string): string[] {
  const characterKeywords = [
    'krishna', 'rama', 'hanuman', 'shiva', 'durga', 'ganesha',
    'arjuna', 'sita', 'lakshmana', 'bharata', 'radha', 'parvati'
  ]
  
  return characterKeywords.filter(keyword => 
    scene.toLowerCase().includes(keyword)
  )
}

function checkCharacterAccuracy(character: string, script: any): {
  accurate: boolean
  issues: string[]
  suggestions: string[]
} {
  const issues: string[] = []
  const suggestions: string[] = []
  
  // Basic character validation logic
  if (character === 'krishna' && script.image_description?.includes('evil')) {
    issues.push("Krishna should not be portrayed as evil")
    suggestions.push("Focus on Krishna's divine and protective nature")
  }
  
  return {
    accurate: issues.length === 0,
    issues,
    suggestions
  }
}

function checkMythologicalElements(script: any): boolean {
  const mythologicalKeywords = [
    'divine', 'sacred', 'cosmic', 'spiritual', 'temple', 'ashram',
    'guru', 'yoga', 'meditation', 'dharma', 'karma', 'moksha'
  ]
  
  const content = `${script.narrator_caption} ${script.image_description}`.toLowerCase()
  return mythologicalKeywords.some(keyword => content.includes(keyword))
}

function checkCulturalContext(script: any): {
  issues: string[]
  suggestions: string[]
} {
  const issues: string[] = []
  const suggestions: string[] = []
  
  // Add cultural context validation logic here
  
  return { issues, suggestions }
}

function hasLogicalInconsistencies(imageDesc: string): boolean {
  // Check for logical inconsistencies in visual description
  const inconsistencies = [
    'day' && 'stars',
    'indoor' && 'mountain',
    'underwater' && 'fire'
  ]
  
  return inconsistencies.some(([a, b]) => 
    imageDesc.toLowerCase().includes(a) && imageDesc.toLowerCase().includes(b)
  )
}

function hasCulturalStereotypes(script: any): boolean {
  // Check for cultural stereotypes
  const stereotypes = [
    'mystical east', 'exotic', 'oriental', 'primitive'
  ]
  
  const content = `${script.narrator_caption} ${script.image_description}`.toLowerCase()
  return stereotypes.some(stereotype => content.includes(stereotype))
}

function checkAuthenticCulturalElements(script: any): boolean {
  // Check for authentic cultural elements
  const authenticElements = [
    'temple', 'ashram', 'guru', 'yoga', 'meditation',
    'bhakti', 'dharma', 'karma', 'moksha'
  ]
  
  const content = `${script.narrator_caption} ${script.image_description}`.toLowerCase()
  return authenticElements.some(element => content.includes(element))
}

function hasNarrativeStructure(caption: string): boolean {
  // Simple check for narrative structure
  const words = caption.split(' ')
  return words.length >= 10 && caption.includes(',') && caption.endsWith('.')
}
