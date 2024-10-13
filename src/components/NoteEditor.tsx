"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Bold, Type, ZoomIn, ZoomOut, Edit, ChevronLeft, ChevronRight, Download, Highlighter, X, Loader2 } from 'lucide-react'
import SVGEditor from '@/components/SVGEditor'
import { cleanupSVGContent, generateSVGDiagram } from '../utils/svgUtils'
import { generateImage } from '../utils/imageUtils'
import Image from 'next/image'
import ImageEditor from './ImageEditor'
import { handleExportPDF as exportPDF } from '../utils/noteUtils'

interface NoteEditorProps {
  generatedNotes: string[]
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  noteRef: React.RefObject<HTMLDivElement>
  containerRef: React.RefObject<HTMLDivElement>
  updateNote: (pageIndex: number, content: string) => void
  svgDiagrams: (string | null)[]
  setSvgDiagrams: React.Dispatch<React.SetStateAction<(string | null)[]>>
  svgScales: number[]
  setSvgScales: React.Dispatch<React.SetStateAction<number[]>>
  svgPositions: { x: number; y: number }[]
  setSvgPositions: React.Dispatch<React.SetStateAction<{ x: number; y: number }[]>>
  setError: React.Dispatch<React.SetStateAction<string | null>>
  generatedImages: (string | null)[]
  setGeneratedImages: React.Dispatch<React.SetStateAction<(string | null)[]>>
  imageScales: number[] // 追加
  setImageScales: React.Dispatch<React.SetStateAction<number[]>> // 追加
  imagePositions: { x: number; y: number }[] // 追加
  setImagePositions: React.Dispatch<React.SetStateAction<{ x: number; y: number }[]>> // 追加
}

export default function NoteEditor({
  generatedNotes,
  currentPage,
  setCurrentPage,
  noteRef,
  containerRef,
  updateNote,
  svgDiagrams,
  setSvgDiagrams,
  svgScales,
  setSvgScales,
  svgPositions,
  setSvgPositions,
  setError,
  generatedImages,
  setGeneratedImages,
  imageScales,
  setImageScales,
  imagePositions,
  setImagePositions,
}: NoteEditorProps) {
  // useStateを使用してスケールを定義
  const [scale, setScale] = useState(1)

  const [isEditing, setIsEditing] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  // SVG生成中の状態管理
  const [isGeneratingSVG, setIsGeneratingSVG] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  useEffect(() => {
    if (editorRef.current && !isEditing) {
      editorRef.current.innerHTML = generatedNotes[currentPage] || '<p class="text-gray-400">ノートを生成してください</p>'
    }
  }, [currentPage, generatedNotes, isEditing])

  // 初期化時に各ページの画像スケールと位置を設定
  useEffect(() => {
    const initializeImageState = () => {
      if (generatedImages.length > 0) {
        setImageScales(prev => {
          const newScales = [...prev]
          for (let i = 0; i < generatedImages.length; i++) {
            if (newScales[i] === undefined) {
              newScales[i] = 1
            }
          }
          return newScales
        })
        setImagePositions(prev => {
          const newPositions = [...prev]
          for (let i = 0; i < generatedImages.length; i++) {
            if (newPositions[i] === undefined) {
              newPositions[i] = { x: 100, y: 100 }
            }
          }
          return newPositions
        })
      }
    }
    initializeImageState()
  }, [generatedImages])

  // ズーム処理を更新
  const handleZoomIn = () => {
    setScale(prevScale => {
      const newScale = Math.min(prevScale + 0.1, 2)
      console.log('Zoom In: ', newScale)
      return newScale
    })
  }

  const handleZoomOut = () => {
    setScale(prevScale => {
      const newScale = Math.max(prevScale - 0.1, 0.5)
      console.log('Zoom Out: ', newScale)
      return newScale
    })
  }

  const handleToggleEdit = () => {
    if (isEditing && editorRef.current) {
      updateNote(currentPage, editorRef.current.innerHTML)
    }
    setIsEditing(prev => !prev)
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      if (isEditing && editorRef.current) {
        updateNote(currentPage, editorRef.current.innerHTML)
      }
      setCurrentPage(prev => prev - 1)
      setIsEditing(false)
    }
  }

  const handleNextPage = () => {
    if (currentPage < generatedNotes.length - 1) {
      if (isEditing && editorRef.current) {
        updateNote(currentPage, editorRef.current.innerHTML)
      }
      setCurrentPage(prev => prev + 1)
      setIsEditing(false)
    }
  }

  const handleExportPDFClick = () => {
    // 配列の長さを生成ノートに合わせて統一
    const maxLength = generatedNotes.length

    // 配列を必要な長さに拡張
    const extendArray = <T,>(arr: T[], defaultValue: T): T[] => {
      return arr.length >= maxLength ? arr : [...arr, ...Array(maxLength - arr.length).fill(defaultValue)]
    }

    exportPDF(
      extendArray(generatedNotes, ''),
      extendArray(svgDiagrams, null),
      extendArray(svgScales, 1),
      extendArray(svgPositions, { x: 0, y: 0 }),
      extendArray(generatedImages, null),
      extendArray(imageScales, 1),
      extendArray(imagePositions, { x: 0, y: 0 })
    )
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
        applyFormat('fontSize', '5') // 2px大きくするために'5'を使用
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
    setSvgDiagrams(prevDiagrams => {
      const newDiagrams = [...prevDiagrams]
      newDiagrams[currentPage] = cleanedSvgContent
      return newDiagrams
    })
  }

  // SVGの位置を更新する関数
  const handleSvgPositionChange = (newPosition: { x: number; y: number }) => {
    setSvgPositions(prevPositions => {
      const newPositions = [...prevPositions]
      newPositions[currentPage] = newPosition
      return newPositions
    })
  }

  // SVGのスケールを更新する関数
  const handleSvgScaleUpdate = (newSvgScale: number) => {
    setSvgScales(prevScales => {
      const newScales = [...prevScales]
      newScales[currentPage] = newSvgScale
      return newScales
    })
  }

  // SVGを削除する関数
  const handleSvgDelete = () => {
    setSvgDiagrams(prevDiagrams => {
      const newDiagrams = [...prevDiagrams]
      newDiagrams[currentPage] = null
      return newDiagrams
    })
  }

  // 選択されたテキストを取得する関数
  const getSelectedText = (): string => {
    if (editorRef.current) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        return selection.toString()
      }
    }
    return ''
  }

  // SVG図を生成するハンドラーを追加
  const handleGenerateSVG = async () => {
    const selectedText = getSelectedText()
    if (!selectedText) {
      setError('テキストが選択されていません。')
      return
    }

    setIsGeneratingSVG(true) // 生成開始時に状態を設定

    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      if (!apiKey) {
        throw new Error('APIキーが設定されていません。')
      }
      const svgContent = await generateSVGDiagram(apiKey, selectedText)
      
      // 現在のページにSVG図を設定
      setSvgDiagrams(prevDiagrams => {
        const newDiagrams = [...prevDiagrams]
        newDiagrams[currentPage] = svgContent
        return newDiagrams
      })
      setSvgScales(prevScales => {
        const newScales = [...prevScales]
        newScales[currentPage] = 1
        return newScales
      })
      setSvgPositions(prevPositions => {
        const newPositions = [...prevPositions]
        newPositions[currentPage] = { x: 50, y: 100 }
        return newPositions
      })
    } catch (error) {
      console.error('SVG図の生成中にエラーが発生しました:', error)
      setError('SVG図の生成中にエラーが発生しました。')
    } finally {
      setIsGeneratingSVG(false) // 生成終了時に状態をリセット
    }
  }

  // 画像生成ハンドラーを追加
  const handleGenerateImage = async () => {
    const selectedText = getSelectedText()
    if (!selectedText) {
      setError('テキストが選択されていません。')
      return
    }

    // プロンプトの長さを制限（例：1000文字）
    const truncatedPrompt = selectedText.slice(0, 1000)

    setIsGeneratingImage(true)

    try {
      const imageUrl = await generateImage(truncatedPrompt)
      
      setGeneratedImages(prevImages => {
        const newImages = [...prevImages]
        newImages[currentPage] = imageUrl
        return newImages
      })
    } catch (error) {
      console.error('画像の生成中にエラーが発生しました:', error)
      setError('画像の生成中にエラーが発生しました。')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  // 画像のスケールを更新する関数
  const handleImageScaleUpdate = (newImageScale: number) => {
    setImageScales(prevScales => {
      const newScales = [...prevScales]
      newScales[currentPage] = newImageScale
      return newScales
    })
  }

  // 画像の位置を更新する関数
  const handleImagePositionChange = (newPosition: { x: number; y: number }) => {
    setImagePositions(prevPositions => {
      const newPositions = [...prevPositions]
      newPositions[currentPage] = newPosition
      return newPositions
    })
  }

  // 画像を削除する関数
  const handleImageDelete = () => {
    setGeneratedImages(prevImages => {
      const newImages = [...prevImages]
      newImages[currentPage] = null
      return newImages
    })
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
          {/* SVG生成ボタンにローディングインジケーターを追加 */}
          <Button 
            onClick={handleGenerateSVG} 
            size="sm" 
            variant="outline" 
            className="ml-2" 
            disabled={isGeneratingSVG} // 生成中はボタンを無効化
          >
            {isGeneratingSVG ? (
              <Loader2 className="animate-spin h-4 w-4" /> // ローディングスピナーを表示
            ) : (
              '図を生成'
            )}
          </Button>
          <Button 
            onClick={handleGenerateImage} 
            size="sm" 
            variant="outline" 
            className="ml-2" 
            disabled={isGeneratingImage}
          >
            {isGeneratingImage ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              '画像を生成'
            )}
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
            height: '297mm',
            overflow: 'hidden',
          }}
        >
          <div
            ref={editorRef}
            contentEditable={isEditing}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="shadow-lg bg-white note-content relative"
            style={{
              width: '210mm',
              height: '297mm',
              padding: '0',
              boxSizing: 'border-box',
              fontFamily: '"Zen Kurenaido", sans-serif',
              fontSize: '16px',
              lineHeight: '40px',
              background: 'linear-gradient(to bottom, #ffffff 39px, #00b0d7 1px)',
              backgroundSize: '100% 40px',
              backgroundAttachment: 'local',
              overflow: 'hidden',
              wordWrap: 'break-word',
            }}
            suppressContentEditableWarning={true}
          >
            <div style={{
              width: '200mm',
              margin: '0 auto',
              padding: '0 5mm',
              boxSizing: 'border-box',
            }}>
              {/* ノートのHTMLコンテンツ */}
            </div>
          </div>
          {svgDiagrams[currentPage] && (
            <div
              className="absolute"
              style={{
                left: `${svgPositions[currentPage].x}px`,
                top: `${svgPositions[currentPage].y}px`,
                transform: `scale(${svgScales[currentPage]})`,
                transformOrigin: 'top left',
              }}
            >
              <SVGEditor
                svgContent={svgDiagrams[currentPage]!}
                isEditing={isEditing}
                onUpdate={handleSvgScaleUpdate}
                onDelete={handleSvgDelete}
                scale={svgScales[currentPage]}
                onPositionChange={handleSvgPositionChange}
              />
            </div>
          )}
          {generatedImages[currentPage] && (
            <ImageEditor
              imageUrl={generatedImages[currentPage]!}
              isEditing={isEditing}
              onUpdate={handleImageScaleUpdate}
              onDelete={handleImageDelete}
              scale={imageScales[currentPage] || 1}
              onPositionChange={handleImagePositionChange}
              parentScale={scale} // 親のスケールを渡す
              initialPosition={imagePositions[currentPage] || { x: 100, y: 100 }} // 追加
            />
          )}
        </div>
      </div>
    </div>
  )
}