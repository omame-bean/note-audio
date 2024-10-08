"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Edit, ChevronLeft, ChevronRight, Download, Type, Highlighter, X } from 'lucide-react'

// NoteEditorコンポーネントのプロパティ定義
interface NoteEditorProps {
  generatedNotes: string[]
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  noteRef: React.RefObject<HTMLDivElement>
  containerRef: React.RefObject<HTMLDivElement>
  handleExportPDF: () => void
}

export default function NoteEditor({
  generatedNotes,
  currentPage,
  setCurrentPage,
  noteRef,
  containerRef,
  handleExportPDF
}: NoteEditorProps) {
  // 状態の初期化
  const [scale, setScale] = useState(1)
  const [isEditing, setIsEditing] = useState(false)
  const [activeFormat, setActiveFormat] = useState<string | null>(null)

  // ズームイン機能
  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.1, 2))
  }

  // ズームアウト機能
  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.5))
  }

  // 編集モードの切り替え
  const handleToggleEdit = () => {
    setIsEditing(!isEditing)
    setScale(1)
    setActiveFormat(null)
  }

  // 前のページに移動
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0))
  }

  // 次のページに移動
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, generatedNotes.length - 1))
  }

  // テキストのフォーマット適用
  const handleFormatText = (format: string) => {
    if (!isEditing) return

    setActiveFormat(prevFormat => prevFormat === format ? null : format)

    if (noteRef.current) {
      noteRef.current.focus()
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const span = document.createElement('span')
        span.className = format
        
        if (range.toString().trim() === '') {
          // カーソルの位置に新しい空のスパンを挿入
          range.insertNode(span)
          range.setStartAfter(span)
          range.setEndAfter(span)
        } else {
          //選択されたテキストを新しいスパンで囲む
          range.surroundContents(span)
          range.setStartAfter(span)
          range.setEndAfter(span)
        }
        
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }

  // キーダウンイベントの処理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      document.execCommand('insertLineBreak')
    }
  }

  // 入力イベントの処理
  const handleInput = () => {
    if (noteRef.current) {
      const updatedContent = noteRef.current.innerHTML
      // Here you would update the generatedNotes state in the parent component
    }
  }

  // ノートが生成されていない場合のメッセージ表示
  if (generatedNotes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        ノートを生成すると、ここに表示されます。
      </div>
    )
  }

  // メインのコンポーネントレンダリング
  return (
    <div className="w-full md:w-2/3 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      {/* ツールバー */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
        {/* ズームとエディットボタン */}
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
        {/* ページナビゲーション */}
        <div className="flex items-center space-x-2">
          <Button onClick={handlePrevPage} size="sm" variant="outline" disabled={currentPage === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{currentPage + 1} / {generatedNotes.length}</span>
          <Button onClick={handleNextPage} size="sm" variant="outline" disabled={currentPage === generatedNotes.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {/* PDF出力ボタン */}
        <Button onClick={handleExportPDF} size="sm">
          <Download className="h-4 w-4 mr-2" /> PDF出力
        </Button>
      </div>
      {/* フォーマットツールバー（編集モード時のみ表示） */}
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
            maxWidth: '210mm', // A4サイズの幅
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          <div
            ref={noteRef}
            dangerouslySetInnerHTML={{ __html: generatedNotes[currentPage] }}
            contentEditable={isEditing}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            className="shadow-lg bg-white"
            style={{
              width: '100%',
              minHeight: '297mm', // A4サイズの高さ
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    </div>
  )
}