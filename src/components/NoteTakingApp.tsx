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
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [svgDiagram, setSvgDiagram] = useState<string | null>(null)

  // refの初期化
  const noteRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 環境変数からAPIキーを読み込む
  useEffect(() => {
    const envApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (envApiKey) {
      setApiKey(envApiKey)
    }
  }, [])

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
      const svgContent = await generateSVGDiagram(apiKey, noteContent)
      setSvgDiagram(svgContent)
    } catch (error) {
      console.error('Error generating SVG diagram:', error)
      setError('SVG図の生成中にエラーが発生しました。')
    }
  }

  // ノート生成処理を更新
  const handleGenerateNote = async () => {
    if (!apiKey) {
      setError('APIキーが設定されていません。');
      return;
    }
    if (!transcription || !selectedPrompt) {
      setError('文字起こしとプロンプトの両方が必要です。');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'あなたは優秀なノートテイカーです。与えられた文字起こしを整理し、読みやすくまとめてください。HTMLタグを使用して構造化してください。' },
            { role: 'user', content: `以下の文字起こしを「${promptOptions.find(p => p.value === selectedPrompt)?.label}」というプロンプトに基づいてまとめてください。以下の指示に従ってください：

1. 内容に応じた適切なタイトルをh1タグで1つだけつけてください。"会議ノート"などの一般的なタイトルは避けてください。
2. 内容を簡潔に要約し、重要なポイントを箇条書きでまとめてください。
3. 適切な見出しを使用して構造化してください。
4. リストや段落を適切に使用し、読みやすく整形してください。
5. マークダウン記法ではなく、HTMLタグを使用してフォーマットしてください。
6. コードブロックや "バッククォート3つ + html" のような記述は使用しないでください。

文字起こし：

${transcription}` }
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      let generatedContent = response.data.choices[0].message.content;
      
      // 生成されたコンテンツをクリーンアップ
      generatedContent = cleanGeneratedContent(generatedContent);
      
      // 複数ページに分割
      const generatedPages = generateNotePages(generatedContent);
      setGeneratedNotes(generatedPages);
      setCurrentPage(0);

      // SVG図を生成
      await generateSVGForNote(generatedContent);
    } catch (error) {
      console.error('Error generating note:', error);
      setError('ノート生成中にエラーが発生しました。APIキーを確認してください。');
    } finally {
      setIsGenerating(false);
    }
  }

  // コンポーネントのレンダリング
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-800">音声からノートを作るAPP</h1>
      </header>
      <main className="flex-grow flex flex-col md:flex-row p-4 space-y-4 md:space-y-0 md:space-x-4">
        {/* 左側のパネル */}
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-4 space-y-4">
          {/* APIキー入力フィールド */}
          <div className="relative">
            <Input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="OpenAI APIキーを入力"
              className="pr-10"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showApiKey ? (
                <EyeOffIcon className="h-4 w-4 text-gray-400" />
              ) : (
                <EyeIcon className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {/* 音声録音コンポーネント */}
          <AudioRecorder
            setTranscription={setTranscription}
            setError={setError}
            apiKey={apiKey}
            audioFile={audioFile}
            setAudioFile={setAudioFile}
            isTranscribing={isTranscribing}
            setIsTranscribing={setIsTranscribing}
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
            disabled={!transcription || !selectedPrompt || !apiKey || isGenerating} 
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
          handleExportPDF={() => handleExportPDF(generatedNotes)}
          updateNote={updateNote}
          svgDiagram={svgDiagram}
          setSvgDiagram={setSvgDiagram}
        />
      </main>
    </div>
  )
}