import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { X, ZoomIn, ZoomOut } from 'lucide-react'

interface SVGEditorProps {
  svgContent: string
  isEditing: boolean
  onUpdate: (newSvgContent: string) => void
  onDelete: () => void
}

export default function SVGEditor({ svgContent, isEditing, onUpdate, onDelete }: SVGEditorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (svgRef.current && containerRef.current) {
      // SVG内容を設定
      svgRef.current.innerHTML = svgContent

      // SVGのサイズを取得
      const svgElement = svgRef.current.firstElementChild as SVGElement
      if (svgElement) {
        let width: number
        let height: number

        // viewBoxからサイズを取得
        const viewBox = svgElement.getAttribute('viewBox')
        if (viewBox) {
          const [, , w, h] = viewBox.split(' ').map(Number)
          width = w
          height = h
        } else {
          // width/height属性からサイズを取得
          width = parseFloat(svgElement.getAttribute('width') || '400')
          height = parseFloat(svgElement.getAttribute('height') || '400')
        }

        // コンテナとSVGのサイズを設定
        containerRef.current.style.width = `${width}px`
        containerRef.current.style.height = `${height}px`
        svgRef.current.setAttribute('width', `${width}`)
        svgRef.current.setAttribute('height', `${height}`)

        // SVGの viewBox を設定（存在しない場合）
        if (!viewBox) {
          svgRef.current.setAttribute('viewBox', `0 0 ${width} ${height}`)
        }
      }
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
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.1, 2))
  }

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.5))
  }

  return (
    <div 
      ref={containerRef}
      className="absolute"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        pointerEvents: isEditing ? 'auto' : 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        ref={svgRef}
        style={{
          cursor: isEditing ? 'move' : 'default',
          width: '100%',
          height: '100%',
        }}
      />
      {isEditing && (
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