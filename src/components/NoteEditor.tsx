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
  const [activeFormat, setActiveFormat] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = generatedNotes[currentPage]
    }
  }, [currentPage, generatedNotes])

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.1, 2))
  }

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.5))
  }

  const handleToggleEdit = () => {
    setIsEditing(!isEditing)
    setActiveFormat(null)
  }

  const handlePrevPage = () => {
    if (isEditing && editorRef.current) {
      updateNote(currentPage, editorRef.current.innerHTML)
    }
    setCurrentPage(prev => Math.max(prev - 1, 0))
  }

  const handleNextPage = () => {
    if (isEditing && editorRef.current) {
      updateNote(currentPage, editorRef.current.innerHTML)
    }
    setCurrentPage(prev => Math.min(prev + 1, generatedNotes.length - 1))
  }

  const handleFormatText = (format: string) => {
    if (!isEditing) return

    setActiveFormat(prevFormat => prevFormat === format ? null : format)

    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      
      if (format === '') {
        // フォーマット解除
        document.execCommand('removeFormat', false, undefined)
      } else {
        // フォーマット適用
        document.execCommand('styleWithCSS', false, 'true')
        switch (format) {
          case 'highlight':
            document.execCommand('backColor', false, 'yellow')
            break
          case 'red-text':
            document.execCommand('foreColor', false, 'red')
            break
          case 'blue-text':
            document.execCommand('foreColor', false, 'blue')
            break
        }
      }

      // 変更を保存
      if (editorRef.current) {
        updateNote(currentPage, editorRef.current.innerHTML)
      }
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

  if (generatedNotes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        ノートを生成すると、ここに表示されます。
      </div>
    )
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
        <Button onClick={handleExportPDF} size="sm">
          <Download className="h-4 w-4 mr-2" /> PDF出力
        </Button>
      </div>
      {/* フォーマットツールバー */}
      {isEditing && (
        <div className="flex justify-center space-x-2 p-2 bg-gray-50 border-b">
          <Button
            onClick={() => handleFormatText('highlight')}
            size="sm"
            variant="outline"
            className={`${activeFormat === 'highlight' ? 'bg-yellow-100' : ''}`}
          >
            <Highlighter className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => handleFormatText('red-text')}
            size="sm"
            variant="outline"
            className={`${activeFormat === 'red-text' ? 'bg-red-100' : ''}`}
          >
            <Type className="h-4 w-4 text-red-500" />
          </Button>
          <Button
            onClick={() => handleFormatText('blue-text')}
            size="sm"
            variant="outline"
            className={`${activeFormat === 'blue-text' ? 'bg-blue-100' : ''}`}
          >
            <Type className="h-4 w-4 text-blue-500" />
          </Button>
          <Button
            onClick={() => handleFormatText('')}
            size="sm"
            variant="outline"
            className={`${activeFormat === null ? 'bg-gray-200' : ''}`}
          >
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
              fontFamily: 'Zen Kurenaido, sans-serif',
              fontSize: '16px',
              lineHeight: '40px',
            }}
            dangerouslySetInnerHTML={{ __html: generatedNotes[currentPage] }}
          />
        </div>
      </div>
    </div>
  )
}