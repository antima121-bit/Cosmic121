// Advanced character recognition and style optimization system

export interface CharacterProfile {
  name: string
  aliases: string[]
  appearance: string[]
  weapons: string[]
  vehicles: string[]
  companions: string[]
  styleKeywords: string[]
  colorPreferences: string[]
  culturalContext: string[]
}

// Comprehensive character database for Indian mythology
export const CHARACTER_DATABASE: Record<string, CharacterProfile> = {
  krishna: {
    name: "Krishna",
    aliases: ["krishna", "krishn", "kanha", "gopal", "madhava", "govinda"],
    appearance: [
      "dark blue skin", "peacock feather crown", "yellow silk garments", "golden ornaments",
      "lotus flower", "flute", "cowherd attire", "divine aura", "youthful appearance"
    ],
    weapons: ["sudarshana chakra", "kaumodaki mace", "sharanga bow", "nandaka sword"],
    vehicles: ["garuda", "eagle"],
    companions: ["radha", "gopis", "cows", "peacocks"],
    styleKeywords: ["divine", "youthful", "playful", "majestic", "pastoral"],
    colorPreferences: ["blue", "yellow", "gold", "green", "white"],
    culturalContext: ["vaishnavism", "bhakti", "gita", "mathura", "vrindavan"]
  },
  hanuman: {
    name: "Hanuman",
    aliases: ["hanuman", "hanumant", "anjani", "maruti", "pavanasuta"],
    appearance: [
      "orange fur", "muscular build", "long tail", "devotional expression",
      "rudraksha beads", "sacred thread", "monkey form", "divine strength"
    ],
    weapons: ["gada", "mace", "divine power"],
    vehicles: ["clouds", "wind"],
    companions: ["rama", "lakshmana", "sita", "vanaras"],
    styleKeywords: ["devotional", "powerful", "loyal", "monkey", "strength"],
    colorPreferences: ["orange", "red", "saffron", "gold"],
    culturalContext: ["ramayana", "vaishnavism", "bhakti", "devotion"]
  },
  shiva: {
    name: "Shiva",
    aliases: ["shiva", "mahadeva", "rudra", "bholenath", "shankar", "trilokinath"],
    appearance: [
      "ash-covered skin", "third eye", "serpents around neck", "tiger skin",
      "matted hair", "crescent moon", "trident", "damru", "blue throat"
    ],
    weapons: ["trishula", "damru", "pinaka bow", "parashu axe"],
    vehicles: ["nandi", "bull"],
    companions: ["parvati", "ganesha", "kartikeya", "nandi"],
    styleKeywords: ["ascetic", "destroyer", "yogi", "cosmic", "mystical"],
    colorPreferences: ["ash", "white", "blue", "red", "orange"],
    culturalContext: ["shaivism", "yoga", "meditation", "kailash", "destruction"]
  },
  durga: {
    name: "Durga",
    aliases: ["durga", "devi", "shakti", "parvati", "ambika", "chandi"],
    appearance: [
      "multiple arms", "various weapons", "riding tiger/lion", "beautiful form",
      "divine radiance", "warrior goddess", "protective mother", "fierce expression"
    ],
    weapons: ["trishula", "sword", "bow", "arrow", "chakra", "conch"],
    vehicles: ["tiger", "lion"],
    companions: ["goddesses", "demons", "devotees"],
    styleKeywords: ["warrior", "protective", "fierce", "beautiful", "divine"],
    colorPreferences: ["red", "gold", "orange", "yellow", "white"],
    culturalContext: ["shaktism", "navratri", "protection", "feminine power"]
  },
  rama: {
    name: "Rama",
    aliases: ["rama", "ram", "ramachandra", "maryada purushottam", "ayodhya"],
    appearance: [
      "noble bearing", "bow and arrows", "royal garments", "crown",
      "divine aura", "righteous king", "blue skin", "lotus eyes"
    ],
    weapons: ["kodanda bow", "arrows", "sword"],
    vehicles: ["pushpaka vimana", "chariot"],
    companions: ["sita", "lakshmana", "hanuman", "bharata"],
    styleKeywords: ["noble", "righteous", "royal", "warrior", "ideal"],
    colorPreferences: ["blue", "gold", "white", "red"],
    culturalContext: ["ramayana", "dharma", "righteousness", "ayodhya"]
  },
  ganesha: {
    name: "Ganesha",
    aliases: ["ganesha", "ganesh", "ganapati", "vighnaharta", "ekadanta"],
    appearance: [
      "elephant head", "rotund belly", "mouse companion", "modak sweets",
      "broken tusk", "trunk", "large ears", "auspicious form"
    ],
    weapons: ["axe", "noose", "goad"],
    vehicles: ["mouse", "rat"],
    companions: ["mouse", "modak", "lotus"],
    styleKeywords: ["auspicious", "wise", "remover of obstacles", "elephant", "beloved"],
    colorPreferences: ["red", "orange", "yellow", "gold"],
    culturalContext: ["ganesh chaturthi", "auspicious beginnings", "wisdom", "success"]
  },
  arjuna: {
    name: "Arjuna",
    aliases: ["arjuna", "arjun", "phalguna", "kiriti", "savyasachi"],
    appearance: [
      "handsome warrior", "bow and arrows", "armor", "crown",
      "divine chariot", "krishna as charioteer", "white horses"
    ],
    weapons: ["gandiva bow", "celestial arrows", "sword", "mace"],
    vehicles: ["divine chariot"],
    companions: ["krishna", "draupadi", "pandavas"],
    styleKeywords: ["warrior", "archer", "noble", "skilled", "divine"],
    colorPreferences: ["white", "gold", "blue", "red"],
    culturalContext: ["mahabharata", "kurukshetra", "gita", "archery"]
  },
  sita: {
    name: "Sita",
    aliases: ["sita", "janaki", "vaidehi", "rama's wife", "earth's daughter"],
    appearance: [
      "beautiful form", "golden complexion", "lotus eyes", "royal garments",
      "divine beauty", "lotus flower", "golden ornaments"
    ],
    weapons: ["divine power", "chastity"],
    vehicles: ["pushpaka vimana"],
    companions: ["rama", "lakshmana", "hanuman"],
    styleKeywords: ["beautiful", "virtuous", "royal", "divine", "feminine"],
    colorPreferences: ["gold", "yellow", "white", "red", "orange"],
    culturalContext: ["ramayana", "virtue", "chastity", "ayodhya", "feminine power"]
  }
}

// Character recognition function
export function recognizeCharacter(scene: string): CharacterProfile | null {
  const lowerScene = scene.toLowerCase()
  
  for (const [key, profile] of Object.entries(CHARACTER_DATABASE)) {
    // Check if any alias appears in the scene
    const hasAlias = profile.aliases.some(alias => 
      lowerScene.includes(alias.toLowerCase())
    )
    
    if (hasAlias) {
      return profile
    }
  }
  
  return null
}

// Style optimization based on character and scene type
export function optimizeStyle(
  character: CharacterProfile | null,
  sceneType: string,
  baseStyle: string
): string {
  let optimizedStyle = baseStyle
  
  if (character) {
    // Add character-specific style keywords
    optimizedStyle += `, ${character.styleKeywords.join(', ')}`
    
    // Add character-specific appearance details
    optimizedStyle += `, ${character.appearance.slice(0, 3).join(', ')}`
    
    // Add cultural context
    if (character.culturalContext.length > 0) {
      optimizedStyle += `, ${character.culturalContext[0]} tradition`
    }
  }
  
  // Add scene-specific enhancements
  switch (sceneType) {
    case 'action':
      optimizedStyle += ', dynamic action, heroic proportions, dramatic lighting'
      break
    case 'spiritual':
      optimizedStyle += ', divine radiance, ethereal atmosphere, cosmic elements'
      break
    case 'emotional':
      optimizedStyle += ', expressive faces, intimate framing, emotional depth'
      break
    default:
      optimizedStyle += ', mythological grandeur, cultural authenticity'
  }
  
  return optimizedStyle
}

// Cultural context enhancement
export function enhanceCulturalContext(scene: string): string[] {
  const culturalElements: string[] = []
  
  // Check for traditional elements
  if (scene.toLowerCase().includes('temple')) {
    culturalElements.push('ancient temple architecture', 'sacred geometry', 'religious symbolism')
  }
  
  if (scene.toLowerCase().includes('forest') || scene.toLowerCase().includes('jungle')) {
    culturalElements.push('sacred groves', 'ancient trees', 'natural spirituality')
  }
  
  if (scene.toLowerCase().includes('river') || scene.toLowerCase().includes('ganga')) {
    culturalElements.push('sacred waters', 'spiritual purification', 'life-giving force')
  }
  
  if (scene.toLowerCase().includes('mountain') || scene.toLowerCase().includes('himalaya')) {
    culturalElements.push('sacred peaks', 'divine abodes', 'cosmic connection')
  }
  
  return culturalElements
}

// Advanced prompt construction
export function constructAdvancedPrompt(
  baseDescription: string,
  character: CharacterProfile | null,
  sceneType: string,
  styleType: string
): string {
  let prompt = baseDescription
  
  // Add character-specific details
  if (character) {
    prompt += `, ${character.appearance.slice(0, 4).join(', ')}`
    
    if (character.weapons.length > 0) {
      prompt += `, wielding ${character.weapons[0]}`
    }
    
    if (character.vehicles.length > 0) {
      prompt += `, mounted on ${character.vehicles[0]}`
    }
  }
  
  // Add cultural context
  const culturalElements = enhanceCulturalContext(baseDescription)
  if (culturalElements.length > 0) {
    prompt += `, ${culturalElements.slice(0, 2).join(', ')}`
  }
  
  // Add style optimization
  const optimizedStyle = optimizeStyle(character, sceneType, styleType)
  prompt += `, ${optimizedStyle}`
  
  return prompt
}
