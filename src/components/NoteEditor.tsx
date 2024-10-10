"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Edit, ChevronLeft, ChevronRight, Download, Type, Highlighter, X } from 'lucide-react'

interface NoteEditorProps {
  generatedNotes: string[]
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  noteRef: React.RefObject<HTMLDivElement>
  containerRef: React.RefObject<HTMLDivElement>
  handleExportPDF: () => void
  updateNote: (pageIndex: number, content: string) => void
}

export default function NoteEditor({
  generatedNotes,
  currentPage,
  setCurrentPage,
  noteRef,
  containerRef,
  handleExportPDF,
  updateNote
}: NoteEditorProps) {
  const [scale, setScale] = useState(1)
  const [isEditing, setIsEditing] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && !isEditing) {
      editorRef.current.innerHTML = generatedNotes[currentPage]
    }
  }, [currentPage, generatedNotes, isEditing])

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.1, 2))
  }

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.5))
  }

  const handleToggleEdit = () => {
    setIsEditing(prev => !prev)
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
          <Button onClick={() => handleFormatText('removeFormat')} size="sm" variant="outline">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ノート表示エリア */}
      <div ref={containerRef} className="flex-grow overflow-auto">
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
            className="shadow-lg bg-white note-content"
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
          />
        </div>
      </div>
    </div>
  )
}