"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Maximize2, Minimize2 } from "lucide-react"

interface ComicPanelProps {
  imageUrl: string
  narratorCaption: string
  dialogue?: string
  scene: string
  styleType: string
  onDownload?: () => void
}

export function ComicPanel({ imageUrl, narratorCaption, dialogue, scene, styleType, onDownload }: ComicPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions for comic panel (3:4 aspect ratio)
    const width = 600
    const height = 800
    canvas.width = width
    canvas.height = height

    // Load and draw the image
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      setIsLoading(false)
      drawComicPanel(ctx, img, width, height, narratorCaption, dialogue, styleType)
    }
    img.onerror = () => {
      setIsLoading(false)
      drawPlaceholderPanel(ctx, width, height, narratorCaption, dialogue, styleType)
    }
    img.src = imageUrl
  }, [imageUrl, narratorCaption, dialogue, styleType])

  const drawComicPanel = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    width: number,
    height: number,
    caption: string,
    dialogue?: string,
    style?: string,
  ) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw comic panel border
    const borderWidth = 8
    const innerWidth = width - borderWidth * 2
    const innerHeight = height - borderWidth * 2

    // Outer border (black)
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, width, height)

    // Inner border (white)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(borderWidth / 2, borderWidth / 2, innerWidth + borderWidth, innerHeight + borderWidth)

    // Draw the main image
    const imageY = borderWidth + 40 // Leave space for caption
    const imageHeight = innerHeight - 120 // Leave space for caption and dialogue
    const imageWidth = innerWidth

    ctx.drawImage(img, borderWidth, imageY, imageWidth, imageHeight)

    // Draw narrator caption box at top
    if (caption) {
      drawCaptionBox(ctx, caption, borderWidth, borderWidth, innerWidth, 35)
    }

    // Draw dialogue bubble at bottom if present
    if (dialogue) {
      const dialogueY = height - 80
      drawDialogueBubble(ctx, dialogue, borderWidth, dialogueY, innerWidth, 60)
    }

    // Add comic panel effects
    addComicEffects(ctx, width, height, style)
  }

  const drawPlaceholderPanel = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    caption: string,
    dialogue?: string,
    style?: string,
  ) => {
    // Draw a placeholder when image fails to load
    const borderWidth = 8

    // Outer border
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, width, height)

    // Inner area
    ctx.fillStyle = "#f0f0f0"
    ctx.fillRect(borderWidth, borderWidth, width - borderWidth * 2, height - borderWidth * 2)

    // Placeholder text
    ctx.fillStyle = "#666666"
    ctx.font = "24px serif"
    ctx.textAlign = "center"
    ctx.fillText("Comic Panel", width / 2, height / 2)

    // Draw caption and dialogue
    if (caption) {
      drawCaptionBox(ctx, caption, borderWidth, borderWidth, width - borderWidth * 2, 35)
    }
    if (dialogue) {
      drawDialogueBubble(ctx, dialogue, borderWidth, height - 80, width - borderWidth * 2, 60)
    }
  }

  const drawCaptionBox = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => {
    // Caption box background
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
    ctx.fillRect(x, y, width, height)

    // Caption box border
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)

    // Caption text
    ctx.fillStyle = "#000000"
    ctx.font = "14px serif"
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"

    // Word wrap the caption text
    const words = text.split(" ")
    const lines = []
    let currentLine = ""
    const maxWidth = width - 20

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)

    // Draw each line
    const lineHeight = 16
    const startY = y + height / 2 - ((lines.length - 1) * lineHeight) / 2
    lines.forEach((line, index) => {
      ctx.fillText(line, x + 10, startY + index * lineHeight)
    })
  }

  const drawDialogueBubble = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => {
    const bubbleWidth = Math.min(width - 40, 300)
    const bubbleX = x + (width - bubbleWidth) / 2
    const bubbleY = y

    // Speech bubble background
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.roundRect(bubbleX, bubbleY, bubbleWidth, height - 20, 15)
    ctx.fill()

    // Speech bubble border
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 3
    ctx.stroke()

    // Speech bubble tail
    ctx.beginPath()
    ctx.moveTo(bubbleX + bubbleWidth / 2 - 10, bubbleY + height - 20)
    ctx.lineTo(bubbleX + bubbleWidth / 2, bubbleY + height - 5)
    ctx.lineTo(bubbleX + bubbleWidth / 2 + 10, bubbleY + height - 20)
    ctx.closePath()
    ctx.fillStyle = "#ffffff"
    ctx.fill()
    ctx.stroke()

    // Dialogue text
    ctx.fillStyle = "#000000"
    ctx.font = "bold 16px serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Word wrap dialogue
    const words = text.split(" ")
    const lines = []
    let currentLine = ""
    const maxWidth = bubbleWidth - 30

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)

    // Draw dialogue lines
    const lineHeight = 18
    const startY = bubbleY + (height - 20) / 2 - ((lines.length - 1) * lineHeight) / 2
    lines.forEach((line, index) => {
      ctx.fillText(line, bubbleX + bubbleWidth / 2, startY + index * lineHeight)
    })
  }

  const addComicEffects = (ctx: CanvasRenderingContext2D, width: number, height: number, style?: string) => {
    // Add subtle comic book effects based on style
    if (style === "divine") {
      // Add divine glow effect
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2)
      gradient.addColorStop(0, "rgba(135, 206, 250, 0.1)")
      gradient.addColorStop(1, "rgba(135, 206, 250, 0)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    } else if (style === "earth") {
      // Add earth tone overlay
      ctx.fillStyle = "rgba(139, 69, 19, 0.05)"
      ctx.fillRect(0, 0, width, height)
    }

    // Add corner decorations
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 3
    const cornerSize = 20

    // Top-left corner
    ctx.beginPath()
    ctx.moveTo(cornerSize, 8)
    ctx.lineTo(8, 8)
    ctx.lineTo(8, cornerSize)
    ctx.stroke()

    // Top-right corner
    ctx.beginPath()
    ctx.moveTo(width - cornerSize, 8)
    ctx.lineTo(width - 8, 8)
    ctx.lineTo(width - 8, cornerSize)
    ctx.stroke()

    // Bottom-left corner
    ctx.beginPath()
    ctx.moveTo(8, height - cornerSize)
    ctx.lineTo(8, height - 8)
    ctx.lineTo(cornerSize, height - 8)
    ctx.stroke()

    // Bottom-right corner
    ctx.beginPath()
    ctx.moveTo(width - 8, height - cornerSize)
    ctx.lineTo(width - 8, height - 8)
    ctx.lineTo(width - cornerSize, height - 8)
    ctx.stroke()
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Create download link
    const link = document.createElement("a")
    link.download = `mythos-panel-${scene.replace(/\s+/g, "-").toLowerCase()}.png`
    link.href = canvas.toDataURL("image/png", 1.0)
    link.click()

    onDownload?.()
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className="space-y-4">
      <Card
        className={`overflow-hidden transition-all duration-300 ${isFullscreen ? "fixed inset-4 z-50 bg-black/90 backdrop-blur" : ""}`}
      >
        <div className={`flex ${isFullscreen ? "h-full items-center justify-center p-8" : "flex-col"}`}>
          <div className={`relative ${isFullscreen ? "max-h-full max-w-full" : ""}`}>
            <canvas
              ref={canvasRef}
              className={`border-2 border-primary/20 shadow-lg transition-all duration-300 ${
                isFullscreen ? "max-h-[90vh] max-w-[90vw] object-contain" : "w-full max-w-md mx-auto"
              }`}
              style={{ imageRendering: "crisp-edges" }}
            />

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Assembling comic panel...</p>
                </div>
              </div>
            )}
          </div>

          {isFullscreen && (
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="secondary" size="sm" onClick={toggleFullscreen}>
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      {!isFullscreen && (
        <div className="flex gap-3 justify-center">
          <Button onClick={handleDownload} className="flex-1 max-w-xs">
            <Download className="h-4 w-4 mr-2" />
            Download Panel
          </Button>
          <Button variant="outline" onClick={toggleFullscreen}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      )}
    </div>
  )
}
