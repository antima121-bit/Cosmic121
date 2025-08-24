// Local storage utilities for managing comic panels

export interface SavedComicPanel {
  id: string
  scene: string
  narratorCaption: string
  dialogue?: string
  imageUrl: string
  styleType: string
  sceneType: string
  timestamp: string
  isFavorite?: boolean
}

const STORAGE_KEY = "mythos-engine-panels"

export function saveComicPanel(panel: Omit<SavedComicPanel, "id" | "timestamp">): SavedComicPanel {
  const savedPanel: SavedComicPanel = {
    ...panel,
    id: generateId(),
    timestamp: new Date().toISOString(),
    isFavorite: false,
  }

  const existingPanels = getSavedPanels()
  const updatedPanels = [savedPanel, ...existingPanels]

  // Keep only the last 50 panels to avoid storage bloat
  const trimmedPanels = updatedPanels.slice(0, 50)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedPanels))
  return savedPanel
}

export function getSavedPanels(): SavedComicPanel[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error loading saved panels:", error)
    return []
  }
}

export function deleteComicPanel(id: string): void {
  const panels = getSavedPanels()
  const filteredPanels = panels.filter((panel) => panel.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPanels))
}

export function toggleFavorite(id: string): void {
  const panels = getSavedPanels()
  const updatedPanels = panels.map((panel) => (panel.id === id ? { ...panel, isFavorite: !panel.isFavorite } : panel))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPanels))
}

export function clearAllPanels(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function exportPanelsAsJSON(): string {
  const panels = getSavedPanels()
  return JSON.stringify(panels, null, 2)
}

export function getStorageStats(): { count: number; favorites: number; storageSize: string } {
  const panels = getSavedPanels()
  const favorites = panels.filter((panel) => panel.isFavorite).length
  const storageSize = new Blob([JSON.stringify(panels)]).size
  const sizeInKB = (storageSize / 1024).toFixed(1)

  return {
    count: panels.length,
    favorites,
    storageSize: `${sizeInKB} KB`,
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
