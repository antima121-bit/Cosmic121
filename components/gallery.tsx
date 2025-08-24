"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Heart,
  Trash2,
  Download,
  Search,
  Filter,
  Calendar,
  Palette,
  MoreVertical,
  Eye,
  AlertCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ComicPanel } from "@/components/comic-panel"
import {
  getSavedPanels,
  deleteComicPanel,
  toggleFavorite,
  clearAllPanels,
  exportPanelsAsJSON,
  getStorageStats,
  type SavedComicPanel,
} from "@/lib/storage"

export function Gallery() {
  const [panels, setPanels] = useState<SavedComicPanel[]>([])
  const [filteredPanels, setFilteredPanels] = useState<SavedComicPanel[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "favorites" | "vibrant" | "earth" | "divine">("all")
  const [selectedPanel, setSelectedPanel] = useState<SavedComicPanel | null>(null)
  const [stats, setStats] = useState(() => getStorageStats())

  useEffect(() => {
    loadPanels()
  }, [])

  useEffect(() => {
    filterPanels()
  }, [panels, searchQuery, filterType])

  const loadPanels = () => {
    const savedPanels = getSavedPanels()
    setPanels(savedPanels)
    setStats(getStorageStats())
  }

  const filterPanels = () => {
    let filtered = panels

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (panel) =>
          panel.scene.toLowerCase().includes(query) ||
          panel.narratorCaption.toLowerCase().includes(query) ||
          (panel.dialogue && panel.dialogue.toLowerCase().includes(query)),
      )
    }

    // Apply type filter
    if (filterType === "favorites") {
      filtered = filtered.filter((panel) => panel.isFavorite)
    } else if (filterType !== "all") {
      filtered = filtered.filter((panel) => panel.styleType === filterType)
    }

    setFilteredPanels(filtered)
  }

  const handleDelete = (id: string) => {
    deleteComicPanel(id)
    loadPanels()
  }

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id)
    loadPanels()
  }

  const handleClearAll = () => {
    if (confirm("Are you sure you want to delete all saved panels? This action cannot be undone.")) {
      clearAllPanels()
      loadPanels()
    }
  }

  const handleExport = () => {
    const jsonData = exportPanelsAsJSON()
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `mythos-panels-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStyleColor = (styleType: string) => {
    switch (styleType) {
      case "vibrant":
        return "bg-chart-1/20 text-chart-1"
      case "earth":
        return "bg-chart-2/20 text-chart-2"
      case "divine":
        return "bg-chart-3/20 text-chart-3"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (panels.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Palette className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-4">No Panels Yet</h2>
          <p className="text-muted-foreground mb-6">
            Start creating mythological comic panels to build your gallery. Your generated panels will be automatically
            saved here.
          </p>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Panels are saved locally in your browser. Clear your browser data will remove all saved panels.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Gallery Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-2">Your Comic Gallery</h2>
            <p className="text-muted-foreground">
              {stats.count} panels saved • {stats.favorites} favorites • {stats.storageSize} used
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleClearAll} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Panels
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search panels by scene, caption, or dialogue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Panels</SelectItem>
              <SelectItem value="favorites">Favorites Only</SelectItem>
              <SelectItem value="vibrant">Vibrant Style</SelectItem>
              <SelectItem value="earth">Earth Style</SelectItem>
              <SelectItem value="divine">Divine Style</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredPanels.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No panels match your search</h3>
          <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPanels.map((panel) => (
            <Card key={panel.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium truncate">{panel.scene}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(panel.timestamp)}
                    </CardDescription>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedPanel(panel)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Size
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleFavorite(panel.id)}>
                        <Heart className={`h-4 w-4 mr-2 ${panel.isFavorite ? "fill-current text-red-500" : ""}`} />
                        {panel.isFavorite ? "Remove Favorite" : "Add Favorite"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(panel.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Panel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Panel Preview */}
                <div
                  className="relative cursor-pointer rounded-lg overflow-hidden border-2 border-muted hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedPanel(panel)}
                >
                  <img
                    src={panel.imageUrl || "/placeholder.svg"}
                    alt={panel.scene}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Overlay badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge className={getStyleColor(panel.styleType)} variant="secondary">
                      {panel.styleType}
                    </Badge>
                    {panel.isFavorite && (
                      <Badge variant="secondary" className="bg-red-500/20 text-red-500">
                        <Heart className="h-3 w-3 fill-current" />
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Caption Preview */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground italic line-clamp-2">"{panel.narratorCaption}"</p>
                  {panel.dialogue && <p className="text-xs font-medium line-clamp-1">"{panel.dialogue}"</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full Size Panel Modal */}
      {selectedPanel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-serif font-semibold text-white">{selectedPanel.scene}</h3>
              <Button variant="secondary" onClick={() => setSelectedPanel(null)}>
                Close
              </Button>
            </div>

            <ComicPanel
              imageUrl={selectedPanel.imageUrl}
              narratorCaption={selectedPanel.narratorCaption}
              dialogue={selectedPanel.dialogue}
              scene={selectedPanel.scene}
              styleType={selectedPanel.styleType}
              onDownload={() => console.log("Downloaded from gallery")}
            />
          </div>
        </div>
      )}
    </div>
  )
}
