import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { X, ZoomIn, ZoomOut } from 'lucide-react'

interface SVGEditorProps {
  svgContent: string
  isEditing: boolean
  onUpdate: (newScale: number) => void // 修正: スケールを数値として渡す
  onDelete: () => void
  scale: number
  onPositionChange: (newPosition: { x: number, y: number }) => void
}

export default function SVGEditor({ svgContent, isEditing, onUpdate, onDelete, scale, onPositionChange }: SVGEditorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showControls, setShowControls] = useState(false)
  const svgRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (svgRef.current) {
      svgRef.current.innerHTML = svgContent
    }
  }, [svgContent])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isEditing) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      setPosition({ x: newX, y: newY })
      onPositionChange({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseEnter = () => {
    if (isEditing) {
      setShowControls(true)
    }
  }

  const handleMouseLeave = () => {
    setShowControls(false)
  }

  const handleZoomIn = () => {
    const newScale = Math.min(scale + 0.1, 2)
    onUpdate(newScale)
  }

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.1, 0.5)
    onUpdate(newScale)
  }

  return (
    <div 
      ref={containerRef}
      style={{
        transform: `scale(${1 / scale})`, // ノートのスケールを相殺
        transformOrigin: 'top left',
        pointerEvents: isEditing ? 'auto' : 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseEnter={handleMouseEnter}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          cursor: isEditing ? 'move' : 'default',
        }}
      >
        <div
          ref={svgRef}
          dangerouslySetInnerHTML={{ __html: svgContent }}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </div>
      {isEditing && showControls && (
        <div className="absolute top-0 right-0 flex space-x-1">
          <Button size="sm" variant="outline" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={onDelete}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
