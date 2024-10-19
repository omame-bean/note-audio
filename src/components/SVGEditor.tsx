/**
 * SVGEditor.tsx
 * 
 * SVG図の表示、編集、および管理を行うためのコンポーネント。
 * 
 * 主な機能:
 * - SVG図の表示
 * - 拡大/縮小機能
 * - ドラッグによる位置調整
 * - 編集モードでの操作コントロールの表示
 * - SVG図の削除機能
 * 
 * このコンポーネントは、ユーザーがSVG図を直感的に操作し、
 * ノート内でのレイアウトを調整するための機能を提供します。
 * 親コンポーネントと連携して、SVG図の状態を管理します。
 * 
 * @module SVGEditor
 */

import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react'
import { Button } from "@/components/ui/button"
import { X, ZoomIn, ZoomOut } from 'lucide-react'

interface SVGEditorProps {
  svgContent: string
  isEditing: boolean
  onUpdate: (newScale: number) => void
  onDelete: () => void
  scale: number
  onPositionChange: (newPosition: { x: number; y: number }) => void
  parentScale: number // ここで parentScale を明示的に追加
  initialPosition: { x: number; y: number }
}

export default function SVGEditor({
  svgContent,
  isEditing,
  onUpdate,
  onDelete,
  scale,
  onPositionChange,
  parentScale = 1, // デフォルト値を設定
  initialPosition,
}: SVGEditorProps) {
  const [position, setPosition] = useState(initialPosition || { x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [svgSize, setSvgSize] = useState({ width: 512, height: 512 }) // デフォルトサイズを設定
  const svgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition)
    }
  }, [initialPosition])

  useLayoutEffect(() => { // useEffectからuseLayoutEffectに変更
    if (svgRef.current) {
      const svgElement = svgRef.current.querySelector('svg')
      if (svgElement) {
        const widthAttr = svgElement.getAttribute('width')
        const heightAttr = svgElement.getAttribute('height')
        if (widthAttr && heightAttr) {
          setSvgSize({ width: parseFloat(widthAttr), height: parseFloat(heightAttr) })
        } else {
          try {
            const bbox = svgElement.getBBox()
            setSvgSize({ width: bbox.width, height: bbox.height })
          } catch (error) {
            console.error('SVGのサイズ取得に失敗しました:', error)
            setSvgSize({ width: 512, height: 512 }) // フォールバックサイズ
          }
        }
      }
    }
  }, [svgContent]) // svgContentが変更されたときに実行

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true)
    setDragStart({ x: clientX / parentScale - position.x, y: clientY / parentScale - position.y })
    console.log('Drag start:', { x: clientX, y: clientY })
  }, [parentScale, position])

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (isDragging && isEditing) {
      const effectiveParentScale = parentScale || 1
      const newX = clientX / effectiveParentScale - dragStart.x
      const newY = clientY / effectiveParentScale - dragStart.y
      const newPosition = { x: newX, y: newY }
      setPosition(newPosition)
      onPositionChange(newPosition)
      console.log('Dragging:', { newPosition })
    }
  }, [isDragging, isEditing, dragStart, parentScale, onPositionChange])

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    console.log('Drag end')
  }, [])

  // 既存の handleMouseDown, handleMouseMove, handleMouseUp を以下のように修正または追加
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isEditing) {
      e.preventDefault()
      handleStart(e.clientX, e.clientY)
    }
  }, [isEditing, handleStart])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isEditing) {
      e.preventDefault()
      handleMove(e.clientX, e.clientY)
    }
  }, [isEditing, handleMove])

  const handleMouseUp = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  // 新規追加: タッチイベントハンドラー
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isEditing && e.touches.length === 1) {
      e.preventDefault() // 追加: デフォルトのタッチ動作を防止
      const touch = e.touches[0]
      handleStart(touch.clientX, touch.clientY)
    }
  }, [isEditing, handleStart])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isEditing && e.touches.length === 1) {
      e.preventDefault() // 追加: デフォルトのタッチ動作を防止
      const touch = e.touches[0]
      handleMove(touch.clientX, touch.clientY)
    }
  }, [isEditing, handleMove])

  const handleTouchEnd = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(scale + 0.1, 2)
    onUpdate(newScale)
    console.log('Zoom in:', newScale)
  }, [scale, onUpdate])

  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(scale - 0.1, 0.5)
    onUpdate(newScale)
    console.log('Zoom out:', newScale)
  }, [scale, onUpdate])

  console.log('Render:', { position, isEditing, scale, parentScale, svgSize })

  return (
    <div 
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        cursor: isEditing ? 'move' : 'default',
        pointerEvents: isEditing ? 'auto' : 'none',
        width: `${svgSize.width}px`,
        height: `${svgSize.height}px`,
        userSelect: 'none',
        touchAction: 'none', // 追加: タッチ操作時のスクロールを防止
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      // 新規追加: タッチイベントを追加
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={svgRef}
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
      {isEditing && (
        <div 
          className="absolute top-0 left-0 flex space-x-1"
          style={{ transform: `scale(${1 / scale})`, transformOrigin: 'top left' }}
        >
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
