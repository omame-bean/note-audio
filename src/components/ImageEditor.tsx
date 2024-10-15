/**
 * ImageEditor.tsx
 * 
 * 画像の編集と操作を行うためのコンポーネント。
 * 
 * 主な機能:
 * - 画像の表示と拡大/縮小
 * - ドラッグによる画像の位置調整
 * - 編集モードでの操作コントロールの表示
 * - 画像の削除機能
 * 
 * このコンポーネントは、ユーザーが画像を直感的に操作し、
 * レイアウトを調整するための機能を提供します。
 * 親コンポーネントと連携して、画像の状態を管理します。
 * 
 * @module ImageEditor
 */

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { X, ZoomIn, ZoomOut } from 'lucide-react'
import Image from 'next/image'

interface ImageEditorProps {
  imageUrl: string
  isEditing: boolean
  onUpdate: (newScale: number) => void
  onDelete: () => void
  scale: number
  onPositionChange: (newPosition: { x: number, y: number }) => void
  parentScale: number
  initialPosition: { x: number, y: number } // 追加
}

export default function ImageEditor({
  imageUrl,
  isEditing,
  onUpdate,
  onDelete,
  scale,
  onPositionChange,
  parentScale,
  initialPosition, // 追加
}: ImageEditorProps) {
  const [position, setPosition] = useState(initialPosition) // 修正
  const [isDragging, setIsDragging] = useState(false)
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 })
  const [initialPositionState, setInitialPositionState] = useState({ x: 0, y: 0 })
  const [showControls, setShowControls] = useState(false)

  useEffect(() => {
    setPosition(initialPosition) // 親からの初期位置を反映
  }, [initialPosition])

  useEffect(() => {
    console.log('Scale updated:', scale)
  }, [scale])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) {
      setIsDragging(true)
      setInitialMousePos({ x: e.clientX, y: e.clientY })
      setInitialPositionState({ ...position })
      console.log('Mouse down:', { x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isEditing) {
      const deltaX = (e.clientX - initialMousePos.x) / parentScale
      const deltaY = (e.clientY - initialMousePos.y) / parentScale
      const newX = initialPositionState.x + deltaX
      const newY = initialPositionState.y + deltaY
      setPosition({ x: newX, y: newY })
      onPositionChange({ x: newX, y: newY })
      console.log('Mouse move:', { x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    console.log('Mouse up')
  }

  const handleMouseEnter = () => {
    if (isEditing) {
      setShowControls(true)
    }
  }

  //const handleMouseLeave = () => {
  //  setShowControls(false)
  //  setIsDragging(false)
  //}

  const handleZoomIn = () => {
    const newScale = Math.min(scale + 0.1, 2)
    onUpdate(newScale)
    console.log('Zoom in:', newScale)
  }

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.1, 0.5)
    onUpdate(newScale)
    console.log('Zoom out:', newScale)
  }

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
        width: '512px',
        height: '512px',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      //onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <Image
        src={imageUrl}
        alt="Generated image"
        width={512}
        height={512}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none',
        }}
      />
      {isEditing && showControls && (
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
