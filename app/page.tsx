"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Scroll, Palette, Download, Loader2, AlertCircle, ImageIcon } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Gallery } from "@/components/gallery"
import { ComicPanel } from "@/components/comic-panel"
import { saveComicPanel } from "@/lib/storage"
import {
  generateCompleteComicPanel,
  detectSceneType,
  detectStyleType,
  validateSceneInput,
  type CompleteComicPanelResponse,
} from "@/lib/api-client"

export default function MythosEngine() {
  const [currentView, setCurrentView] = useState<"generator" | "gallery">("generator")
  const [scene, setScene] = useState("")
  const [styleType, setStyleType] = useState<"vibrant" | "earth" | "divine">("vibrant")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPanel, setGeneratedPanel] = useState<CompleteComicPanelResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generationStage, setGenerationStage] = useState<"script" | "image" | "complete">("complete")

  const handleGenerate = async () => {
    // Validate input
    const validation = validateSceneInput(scene)
    if (!validation.isValid) {
      setError(validation.error || "Invalid input")
      return
    }

    setIsGenerating(true)
    setError(null)
    setGenerationStage("script")

    try {
      const sceneType = detectSceneType(scene)
      const autoStyleType = detectStyleType(scene)

      // Use user-selected style or auto-detected
      const finalStyleType = styleType || autoStyleType

      setGenerationStage("image")
      const result = await generateCompleteComicPanel({
        scene,
        sceneType,
        styleType: finalStyleType,
      })

      if (result.success) {
        setGeneratedPanel(result)
        setGenerationStage("complete")

        if (result.script && result.imageUrl) {
          saveComicPanel({
            scene: result.metadata?.scene || scene,
            narratorCaption: result.script.narrator_caption,
            dialogue: result.script.dialogue,
            imageUrl: result.imageUrl,
            styleType: result.metadata?.styleType || finalStyleType,
            sceneType: result.metadata?.sceneType || sceneType,
          })
        }
      } else {
        setError(result.error || "Failed to generate comic panel")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExampleClick = (example: string) => {
    setScene(example)
    setError(null)
    setGeneratedPanel(null)
    // Auto-detect style for the example
    setStyleType(detectStyleType(example))
  }

  const handleRandomScene = () => {
    const randomScenes = [
      "Krishna lifts the Govardhan Hill to protect villagers",
      "Hanuman leaps across the ocean carrying the mountain",
      "Sita is abducted by Ravana in his golden chariot",
      "Shiva opens his third eye, cosmic destruction begins",
      "Ganesha writes the Mahabharata as Vyasa dictates",
      "Durga battles the buffalo demon Mahishasura",
      "Rama breaks Shiva's bow at Sita's swayamvara",
      "Arjuna receives divine vision from Krishna",
    ]
    const randomScene = randomScenes[Math.floor(Math.random() * randomScenes.length)]
    handleExampleClick(randomScene)
  }

  const getGenerationStatusText = () => {
    if (!isGenerating) return ""
    switch (generationStage) {
      case "script":
        return "Generating comic script..."
      case "image":
        return "Creating artwork..."
      case "complete":
        return "Finalizing panel..."
      default:
        return "Generating..."
    }
  }

  if (currentView === "gallery") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <Gallery />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Scroll className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground">Mythos Engine</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Transform simple mythological scene descriptions into stunning comic book panels using AI. Bring ancient
            stories to life with the power of modern technology.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge variant="secondary" className="text-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="outline" className="text-sm">
              Indian Mythology
            </Badge>
            <Badge variant="outline" className="text-sm">
              Comic Art Style
            </Badge>
          </div>
        </div>

        {/* Main Interface */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-serif text-primary">Create Your Comic Panel</CardTitle>
              <CardDescription className="text-base">
                Describe a single dramatic moment from Indian mythology in 5-15 words
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Input Section */}
              <div className="space-y-4">
                <Textarea
                  value={scene}
                  onChange={(e) => setScene(e.target.value)}
                  placeholder="Krishna lifts the Govardhan Hill to protect villagers..."
                  className="min-h-[120px] text-lg resize-none border-2 border-muted focus:border-primary transition-colors"
                  disabled={isGenerating}
                />

                {/* Style Selection */}
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Art Style</label>
                    <Select
                      value={styleType}
                      onValueChange={(value: "vibrant" | "earth" | "divine") => setStyleType(value)}
                      disabled={isGenerating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vibrant">Vibrant - Rich jewel tones and golden highlights</SelectItem>
                        <SelectItem value="earth">Earth - Warm earth tones and natural pigments</SelectItem>
                        <SelectItem value="divine">Divine - Ethereal blues and celestial radiance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    className="flex-1 text-lg font-medium"
                    onClick={handleGenerate}
                    disabled={isGenerating || !scene.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        {getGenerationStatusText()}
                      </>
                    ) : (
                      <>
                        <Palette className="h-5 w-5 mr-2" />
                        Generate Comic Panel
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleRandomScene} disabled={isGenerating}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Random Scene
                  </Button>
                </div>
              </div>

              {/* Examples Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-serif font-semibold mb-4 text-center">Example Scenes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Hanuman leaps across the ocean carrying the mountain",
                    "Sita is abducted by Ravana in his golden chariot",
                    "Shiva opens his third eye, cosmic destruction begins",
                    "Ganesha writes the Mahabharata as Vyasa dictates",
                    "Durga battles the buffalo demon Mahishasura",
                    "Rama breaks Shiva's bow at Sita's swayamvara",
                  ].map((example, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="h-auto p-3 text-left justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                      onClick={() => handleExampleClick(example)}
                      disabled={isGenerating}
                    >
                      "{example}"
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Comic Panel Display */}
          {generatedPanel?.success && generatedPanel.script && generatedPanel.imageUrl && (
            <div className="mt-8">
              <Card className="border-2 border-secondary/20 mb-6">
                <CardHeader>
                  <CardTitle className="text-xl font-serif text-secondary flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Generated Comic Panel
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Auto-saved to Gallery
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Scene: "{generatedPanel.metadata?.scene}" • Style: {generatedPanel.metadata?.styleType}
                  </CardDescription>
                </CardHeader>
              </Card>

              <ComicPanel
                imageUrl={generatedPanel.imageUrl}
                narratorCaption={generatedPanel.script.narrator_caption}
                dialogue={generatedPanel.script.dialogue}
                scene={generatedPanel.metadata?.scene || scene}
                styleType={generatedPanel.metadata?.styleType || styleType}
                onDownload={() => console.log("Panel downloaded")}
              />

              {/* Script Details */}
              <Card className="mt-6 border-dashed border-2 border-muted">
                <CardHeader>
                  <CardTitle className="text-lg font-serif">Script Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">NARRATOR CAPTION</h4>
                    <p className="text-foreground italic">"{generatedPanel.script.narrator_caption}"</p>
                  </div>

                  {generatedPanel.script.dialogue && (
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">DIALOGUE</h4>
                      <p className="text-foreground font-medium">"{generatedPanel.script.dialogue}"</p>
                    </div>
                  )}

                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">IMAGE DESCRIPTION</h4>
                    <p className="text-foreground text-sm">{generatedPanel.script.image_description}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Preview Section Placeholder */}
          {!generatedPanel && (
            <Card className="mt-8 border-dashed border-2 border-muted">
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                    <Scroll className="h-12 w-12" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-2">Your Comic Panel Will Appear Here</h3>
                  <p className="text-sm max-w-md mx-auto">
                    Enter a mythological scene above and click "Generate Comic Panel" to see your AI-created artwork
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-serif font-semibold mb-2">AI-Powered Generation</h3>
            <p className="text-sm text-muted-foreground">
              Advanced AI transforms your descriptions into detailed comic scripts and stunning visuals
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
              <Scroll className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-lg font-serif font-semibold mb-2">Authentic Mythology</h3>
            <p className="text-sm text-muted-foreground">
              Faithful to traditional Indian mythology with culturally accurate details and symbolism
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
              <Download className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-lg font-serif font-semibold mb-2">High-Quality Output</h3>
            <p className="text-sm text-muted-foreground">
              Professional comic book style artwork ready for download and sharing
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
