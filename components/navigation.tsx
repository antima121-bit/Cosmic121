"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Scroll, Battery as Gallery, Sparkles } from "lucide-react"
import { getStorageStats } from "@/lib/storage"

interface NavigationProps {
  currentView: "generator" | "gallery"
  onViewChange: (view: "generator" | "gallery") => void
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const [stats, setStats] = useState({ count: 0 })

  useEffect(() => {
    // Load stats after component mounts to avoid hydration mismatch
    setStats(getStorageStats())
  }, [])

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scroll className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-serif font-bold text-foreground">Mythos Engine</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={currentView === "generator" ? "default" : "ghost"}
              onClick={() => onViewChange("generator")}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generator
            </Button>

            <Button
              variant={currentView === "gallery" ? "default" : "ghost"}
              onClick={() => onViewChange("gallery")}
              className="flex items-center gap-2"
            >
              <Gallery className="h-4 w-4" />
              Gallery
              {stats.count > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {stats.count}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
