"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Bold, Type, ZoomIn, ZoomOut, Edit, ChevronLeft, ChevronRight, Download, Highlighter, X } from 'lucide-react'
import SVGEditor from '@/components/SVGEditor'
import { cleanupSVGContent } from '@/utils/svgUtils'

interface NoteEditorProps {
  generatedNotes: string[]
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  noteRef: React.RefObject<HTMLDivElement>
  containerRef: React.RefObject<HTMLDivElement>
  handleExportPDF: () => void
  updateNote: (pageIndex: number, content: string) => void
  svgDiagram: string | null
  setSvgDiagram: React.Dispatch<React.SetStateAction<string | null>>
}

export default function NoteEditor({
  generatedNotes,
  currentPage,
  setCurrentPage,
  noteRef,
  containerRef,
  handleExportPDF,
  updateNote,
  svgDiagram,
  setSvgDiagram
}: NoteEditorProps) {
  const [scale, setScale] = useState(1)
  const [isEditing, setIsEditing] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  // SVGの位置とスケールを管理する状態を追加
  const [svgPosition, setSvgPosition] = useState({ x: 50, y: 100 })
  const [svgScale, setSvgScale] = useState(1)

  useEffect(() => {
    if (editorRef.current && !isEditing) {
      editorRef.current.innerHTML = generatedNotes[currentPage] || '<p class="text-gray-400">ノートを生成してください</p>'
    }
  }, [currentPage, generatedNotes, isEditing])

  // ズーム処理を更新
  const handleZoomIn = () => {
    setScale(prevScale => {
      const newScale = Math.min(prevScale + 0.1, 2)
      setSvgScale(newScale) // SVGのスケールも更新
      return newScale
    })
  }

  const handleZoomOut = () => {
    setScale(prevScale => {
      const newScale = Math.max(prevScale - 0.1, 0.5)
      setSvgScale(newScale) // SVGのスケールも更新
      return newScale
    })
  }

  const handleToggleEdit = () => {
    setIsEditing(prev => !prev)
    // ノートの編集状態が変わってもSVGの編集状態は変更しない
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < generatedNotes.length - 1) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handleExportPDFClick = () => {
    handleExportPDF()
  }

  const applyFormat = (command: string, value: string = '') => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      updateNote(currentPage, editorRef.current.innerHTML)
    }
  }

  const handleFormatText = (format: string) => {
    if (!isEditing || !editorRef.current) return

    switch (format) {
      case 'highlight':
        applyFormat('backColor', 'yellow')
        break
      case 'red-text':
        applyFormat('foreColor', 'red')
        break
      case 'blue-text':
        applyFormat('foreColor', 'blue')
        break
      case 'bold':
        applyFormat('bold')
        break
      case 'large-text':
        applyFormat('fontSize', '5') // 2px大きくするために'4'を使用
        break
      case 'removeFormat':
        applyFormat('removeFormat')
        break
      default:
        break
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      document.execCommand('insertLineBreak')
    }
  }

  const handleBlur = () => {
    if (isEditing && editorRef.current) {
      updateNote(currentPage, editorRef.current.innerHTML)
    }
  }

  const handleSetSvgDiagram = (newSvgContent: string) => {
    const cleanedSvgContent = cleanupSVGContent(newSvgContent)
    setSvgDiagram(cleanedSvgContent)
  }

  // SVGの位置を更新する関数
  const handleSvgPositionChange = (newPosition: { x: number, y: number }) => {
    setSvgPosition(newPosition)
  }

  return (
    <div className="w-full md:w-2/3 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      {/* ツールバー */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
        <div className="flex space-x-2">
          <Button onClick={handleZoomOut} size="sm" variant="outline">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button onClick={handleZoomIn} size="sm" variant="outline">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button onClick={handleToggleEdit} size="sm" variant="outline">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handlePrevPage} size="sm" variant="outline" disabled={currentPage === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{currentPage + 1} / {generatedNotes.length}</span>
          <Button onClick={handleNextPage} size="sm" variant="outline" disabled={currentPage === generatedNotes.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={handleExportPDFClick} size="sm">
          <Download className="h-4 w-4 mr-2" /> PDF出力
        </Button>
      </div>

      {/* フォーマットツールバー */}
      {isEditing && (
        <div className="flex space-x-2 p-2 bg-gray-100 border-b">
          <Button onClick={() => handleFormatText('highlight')} size="sm" variant="outline">
            <Highlighter className="h-4 w-4 text-yellow-500" />
          </Button>
          <Button onClick={() => handleFormatText('red-text')} size="sm" variant="outline">
            <Type className="h-4 w-4 text-red-500" />
          </Button>
          <Button onClick={() => handleFormatText('blue-text')} size="sm" variant="outline">
            <Type className="h-4 w-4 text-blue-500" />
          </Button>
          <Button onClick={() => handleFormatText('bold')} size="sm" variant="outline">
            <Bold className="h-4 w-4" />
          </Button>
          <Button onClick={() => handleFormatText('large-text')} size="sm" variant="outline">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button onClick={() => handleFormatText('removeFormat')} size="sm" variant="outline">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ノート表示エリア */}
      <div ref={containerRef} className="flex-grow overflow-auto relative">
        <div
          className="mx-auto"
          style={{
            width: `${100 / scale}%`,
            maxWidth: '210mm',
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          <div
            ref={editorRef}
            contentEditable={isEditing}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="shadow-lg bg-white note-content relative"
            style={{
              width: '100%',
              minHeight: '297mm',
              boxSizing: 'border-box',
              fontFamily: '"Zen Kurenaido", sans-serif',
              fontSize: '16px',
              lineHeight: '40px',
              padding: '0', // ここでpaddingを0に設定
              backgroundImage: 'linear-gradient(#00b0d7 1px, transparent 1px)',
              backgroundSize: '100% 40px',
              backgroundPosition: '0 0',
            }}
            suppressContentEditableWarning={true}
          >
            {/* ノートのHTMLコンテンツ */}
          </div>
          {svgDiagram && (
            <div
              className="absolute"
              style={{
                left: `${svgPosition.x}px`,
                top: `${svgPosition.y}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <SVGEditor
                svgContent={svgDiagram}
                isEditing={isEditing}
                onUpdate={handleSetSvgDiagram}
                onDelete={() => setSvgDiagram(null)}
                scale={svgScale}
                onPositionChange={handleSvgPositionChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
