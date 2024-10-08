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
import { generateNotePage, handleExportPDF } from '@/utils/noteUtils'
import axios from 'axios';

const promptOptions = [
  { value: 'lecture', label: '授業の内容をきれいにまとめる' },
  { value: 'meeting', label: '会議の内容をきれいにまとめる' },
  { value: 'memo', label: '簡単なメモとしてまとめる' },
]

// 新しい関数を追加
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

  const noteRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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
          model: 'gpt-4o',
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
      
      const generatedPages = [generateNotePage(generatedContent, 0)];
      setGeneratedNotes(generatedPages);
      setCurrentPage(0);
    } catch (error) {
      console.error('Error generating note:', error);
      setError('ノート生成中にエラーが発生しました。APIキーを確認してください。');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-800">AI Note Taking App</h1>
      </header>
      <main className="flex-grow flex flex-col md:flex-row p-4 space-y-4 md:space-y-0 md:space-x-4">
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-4 space-y-4">
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
          <AudioRecorder
            setTranscription={setTranscription}
            setError={setError}
            apiKey={apiKey}
            audioFile={audioFile}
            setAudioFile={setAudioFile}
            isTranscribing={isTranscribing}
            setIsTranscribing={setIsTranscribing}
          />
          {error && (
            <Alert variant="destructive">
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Textarea
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            placeholder="ここに文字起こしが表示されます..."
            rows={5}
            className="w-full resize-none"
          />
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
          <Button 
            onClick={handleGenerateNote} 
            disabled={!transcription || !selectedPrompt || !apiKey || isGenerating} 
            className="w-full"
          >
            {isGenerating ? 'ノート生成中...' : 'ノート生成'}
          </Button>
        </div>
        <NoteEditor
          generatedNotes={generatedNotes}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          noteRef={noteRef}
          containerRef={containerRef}
          handleExportPDF={() => handleExportPDF(generatedNotes)}
        />
      </main>
    </div>
  )
}