"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { EyeIcon, EyeOffIcon, Download } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AudioRecorder from '@/components/AudioRecorder'
import NoteEditor from '@/components/NoteEditor'
import { generateNotePages, handleExportPDF } from '@/utils/noteUtils'
import axios from 'axios';
import { generateSVGDiagram } from '@/utils/svgUtils'
import SVGEditor from '@/components/SVGEditor'
import Character from './Character'

// プロンプトオプションの定義
const promptOptions = [
  { value: 'lecture', label: '授業の内容をきれいにまとめる' },
  { value: 'meeting', label: '会議の内容をきれいにまとめる' },
  { value: 'memo', label: '簡単なメモとしてまとめる' },
]

// 生成されたコンテンツをクリーンアップする関数
const cleanGeneratedContent = (content: string): string => {
  // "会議ノート" という文字列を削除
  content = content.replace(/会議ノート/g, '');
  
  // HTMLタグを示す文字列を削除
  content = content.replace(/```html|```/g, '');
  
  // 先頭の空白行を削除
  content = content.replace(/^\s*\n/g, '');
  
  return content.trim();
};

export default function NoteTakingApp() {
  // 状態の初期化
  const [transcription, setTranscription] = useState('')
  const [selectedPrompt, setSelectedPrompt] = useState('')
  const [generatedNotes, setGeneratedNotes] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [svgDiagram, setSvgDiagram] = useState<string | null>(null)
  const [svgScale, setSvgScale] = useState(1) // 追加
  const [svgPosition, setSvgPosition] = useState({ x: 50, y: 100 }) // 追加
  const [svgDiagrams, setSvgDiagrams] = useState<(string | null)[]>([])
  const [svgScales, setSvgScales] = useState<number[]>([])
  const [svgPositions, setSvgPositions] = useState<{ x: number; y: number }[]>([])
  const [generatedImages, setGeneratedImages] = useState<(string | null)[]>([])
  const [imageScales, setImageScales] = useState<number[]>([])
  const [imagePositions, setImagePositions] = useState<{ x: number; y: number }[]>([])
  const [emotion, setEmotion] = useState<'happy' | 'angry' | 'neutral'>('neutral')

  // refの初期化
  const noteRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // ノートを更新する関数
  const updateNote = (pageIndex: number, content: string) => {
    setGeneratedNotes(prevNotes => {
      const newNotes = [...prevNotes]
      newNotes[pageIndex] = content
      return newNotes
    })
  }

  // ノート生成後にSVG図を生成する関数
  const generateSVGForNote = async (noteContent: string) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      if (!apiKey) {
        throw new Error('APIキーが設定されていません。')
      }
      const svgContent = await generateSVGDiagram(apiKey, noteContent)
      setSvgDiagrams(prevDiagrams => [...prevDiagrams, svgContent])
      setSvgScales(prevScales => [...prevScales, 1])
      setSvgPositions(prevPositions => [...prevPositions, { x: 50, y: 100 }])
    } catch (error) {
      console.error('Error generating SVG diagram:', error)
      setError('SVG図の生成中にエラーが発生しました。')
    }
  }

  // ノート生成処理を更新
  const handleGenerateNote = async () => {
    if (!transcription || !selectedPrompt) {
      setError('文字起こしとプロンプトの両方が必要です。');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await axios.post('/api/generate-note', {
        transcription,
        selectedPrompt,
      });

      let generatedContent = response.data.content;
      
      // 生成されたコンテンツをクリーンアップ
      generatedContent = cleanGeneratedContent(generatedContent);
      
      // 複数ページに分割
      const generatedPages = generateNotePages(generatedContent);
      setGeneratedNotes(generatedPages);
      setCurrentPage(0);

      // 初期化: 画像のスケールと位置を各ページに設定
      setGeneratedImages(Array(generatedPages.length).fill(null))
      setImageScales(Array(generatedPages.length).fill(1))
      setImagePositions(Array(generatedPages.length).fill({ x: 100, y: 100 }))

      // SVG図を生成
      await generateSVGForNote(generatedContent);
    } catch (error) {
      console.error('Error generating note:', error);
      setError('ノート生成中にエラーが発生しました。');
    } finally {
      setIsGenerating(false);
    }
  }

  // APIキーを環境変数から取得
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

  // ユーザーのプロンプトに応じて感情を更新する関数
  const updateEmotion = (message: string) => {
    if (message.includes('ありがとう') || message.includes('嬉しい')) {
      setEmotion('happy')
    } else if (message.includes('問題') || message.includes('困った')) {
      setEmotion('angry')
    } else {
      setEmotion('neutral')
    }
  }

  // 文字起こしやノート生成後に感情を更新
  useEffect(() => {
    if (transcription) {
      updateEmotion(transcription)
    }
  }, [transcription])

  // コンポーネントのレンダリング
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* ヘッダーを削除し、上部の余白を追加 */}
      <main className="flex-grow flex flex-col md:flex-row p-8 space-y-4 md:space-y-0 md:space-x-4">
        {/* 左側のパネル */}
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-4 space-y-4">
          {/* 音声録音コンポーネント */}
          <AudioRecorder
            setTranscription={setTranscription}
            setError={setError}
            audioFile={audioFile}
            setAudioFile={setAudioFile}
            isTranscribing={isTranscribing}
            setIsTranscribing={setIsTranscribing}
            apiKey={apiKey}
          />
          {/* エラー表示 */}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {/* 文字起こし表示エリア */}
          <Textarea
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            placeholder="ここに文字起こしが表示されます..."
            rows={5}
            className="w-full resize-none"
          />
          {/* プロンプト選択 */}
          <Select onValueChange={setSelectedPrompt}>
            <SelectTrigger>
              <SelectValue placeholder="プロンプトを選択" />
            </SelectTrigger>
            <SelectContent>
              {promptOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* ノート生成ボタン */}
          <Button 
            onClick={handleGenerateNote} 
            disabled={!transcription || !selectedPrompt || isGenerating} 
            className="w-full"
          >
            {isGenerating ? 'ノート生成中...' : 'ノート生成'}
          </Button>
        </div>
        {/* 右側のパネル（ノートエディタ） */}
        <NoteEditor
          generatedNotes={generatedNotes}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          noteRef={noteRef}
          containerRef={containerRef}
          updateNote={updateNote}
          svgDiagrams={svgDiagrams}
          setSvgDiagrams={setSvgDiagrams}
          svgScales={svgScales}
          setSvgScales={setSvgScales}
          svgPositions={svgPositions}
          setSvgPositions={setSvgPositions}
          setError={setError}
          generatedImages={generatedImages}
          setGeneratedImages={setGeneratedImages}
          imageScales={imageScales}
          setImageScales={setImageScales}
          imagePositions={imagePositions}
          setImagePositions={setImagePositions}
        />
      </main>
    </div>
  )
}