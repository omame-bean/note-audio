/**
 * AudioRecorder.tsx
 * 
 * 音声入力（マイクまたはファイルアップロード）を処理し、文字起こしを行うコンポーネント。
 * 
 * 主な機能:
 * - マイクを使用したリアルタイム音声認識
 * - 音声ファイルのアップロードと文字起こし
 * - 録音時間の管理と表示
 * - エラーハンドリング
 * - 使用方法と制限事項の表示
 * 
 * このコンポーネントは、音声入力を文字に変換し、親コンポーネントに結果を渡す役割を果たします。
 * また、VRMキャラクターの表示も含まれており、音声入力に応じて感情を変更することができます。
 * 
 * @module AudioRecorder
 */

"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Upload } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Character from './Character'

// AudioRecorderコンポーネントのプロパティ定義
interface AudioRecorderProps {
  setTranscription: React.Dispatch<React.SetStateAction<string>>;
  setError: (error: string | null) => void;
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
  isTranscribing: boolean;
  setIsTranscribing: (transcribing: boolean) => void;
  emotion: 'happy' | 'angry' | 'sad' | 'relaxed' | 'surprised' | 'neutral';
  setEmotion: (emotion: 'happy' | 'angry' | 'sad' | 'relaxed' | 'surprised' | 'neutral') => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  setTranscription,
  setError,
  audioFile,
  setAudioFile,
  isTranscribing,
  setIsTranscribing,
  emotion,
  setEmotion,
}) => {
  // 状態の初期化
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [totalRecordingTime, setTotalRecordingTime] = useState(0)
  const [currentSessionTime, setCurrentSessionTime] = useState(0)
  
  // トグル用の状態
  const [isManualVisible, setIsManualVisible] = useState(false)

  // 定数の定義
  const MAX_RECORDING_TIME = 5 * 60; // 5分（秒単位）
  const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB（バイト単位）

  // トグル関数
  const toggleManual = () => {
    setIsManualVisible(!isManualVisible)
  }

  // SpeechRecognitionの初期化と設定
  useEffect(() => {
    const SpeechRecognitionClass = (window as typeof window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      recognitionRef.current = new SpeechRecognitionClass();
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'ja-JP'

        // 音声認識結果の処理
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
            }
          }

          if (finalTranscript !== '') {
            setTranscription(prevTranscription => prevTranscription + finalTranscript)
          }
        }

        // エラー処理
        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          setError(`音声認識エラー: ${event.error}`)
          setIsRecording(false)
        }
      }
    } else {
      setError('お使いのブラウザは音声認識をサポートしていません。')
    }

    // コンポーネントのクリーンアップ
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [setTranscription, setError])

  // 録音開始・停止の処理
  const handleStartRecording = () => {
    if (recognitionRef.current) {
      if (!isRecording) {
        const remainingTime = Math.max(0, MAX_RECORDING_TIME - totalRecordingTime)
        if (remainingTime === 0) {
          setError('録音可能な最大時間（5分）に達しました。')
          return
        }

        recognitionRef.current.start()
        setIsRecording(true)
        setError(null)
        setCurrentSessionTime(0)

        // 残り時間または5分後に録音を自動停止するタイマーを設定
        recordingTimeoutRef.current = setTimeout(() => {
          handleStopRecording()
        }, remainingTime * 1000)

        // 1秒ごとに録音時間を更新
        recordingIntervalRef.current = setInterval(() => {
          setCurrentSessionTime(prevTime => prevTime + 1)
          setTotalRecordingTime(prevTotal => prevTotal + 1)
        }, 1000)
      } else {
        handleStopRecording()
      }
    } else {
      setError('音声認識を初期化できませんでした。')
    }
  }

  // 録音停止の処理
  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current)
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  // 残り時間を計算する関数
  const getRemainingTime = () => {
    const remainingSeconds = Math.max(0, MAX_RECORDING_TIME - totalRecordingTime)
    const minutes = Math.floor(remainingSeconds / 60)
    const seconds = remainingSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // ファイルアップロードの処理
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'audio/wav' && file.type !== 'audio/mpeg') {
        setError('WAVまたはMP3ファイルのみアップロード可能です。')
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('ファイルサイズは4MB未満にしてください。')
        return
      }
      setAudioFile(file)
      setError(null)
    }
  }

  // ファイルの文字起こし処理
  const handleTranscribeFile = async () => {
    if (!audioFile) {
      setError('音声ファイルをアップロードしてください。')
      return
    }

    setIsTranscribing(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', audioFile)
    formData.append('model', 'whisper-1')

    try {
      // OpenAI API への直接アクセスを廃止し、サーバーサイドのAPIエンドポイントを使用
      const response = await fetch('/api/transcribe', { // 変更点
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setTranscription(data.text)
    } catch (error) {
      setError('文字起こし中にエラーが発生しました: ' + (error as Error).message)
    } finally {
      setIsTranscribing(false)
    }
  }

  // コンポーネントのレンダリング
  return (
    <div className="space-y-4">
      {/* VRMキャラクターの表示をトグルの外側に移動 */}
      <div className="character-container">
        <div className="text-center mb-2 font-semibold">
          ナビゲーター：こはる
        </div>
        <Character emotion={emotion} setEmotion={setEmotion} />
      </div>

      {/* 使い方と制限事項セクション */}
      <div className="bg-gray-100 p-4 rounded-lg text-sm relative">
        <h3 
          className="font-bold mb-2 cursor-pointer flex justify-between items-center"
          onClick={toggleManual}
        >
          <span>使い方と制限事項</span>
          <span>
            {isManualVisible ? '▲' : '▼'}
          </span>
        </h3>
        {isManualVisible && (
          <div className="mt-2">
            <p className="mb-2">このアプリの使い方について、以下に詳細を説明します。各機能を順にご確認ください。</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                <strong>マイク入力:</strong>
                <p className="ml-4">マイクアイコンをクリックして録音を開始します。録音は最大5分間行え、制限時間に達すると自動的に停止します。録音中は現在の録音時間と合計録音時間が表示されます。</p>
              </li>
              <li>
                <strong>ファイル入力:</strong>
                <p className="ml-4">WAVまたはMP3形式の音声ファイル（最大4MB）をアップロードできます。アップロード後、「文字起こし開始」ボタンをクリックして音声ファイルの文字起こしを行います。</p>
              </li>
              <li>
                <strong>文字起こし結果:</strong>
                <p className="ml-4">音声入力またはファイル入力から得られた文字起こし結果はテキストエリアに表示されます。必要に応じて修正や編集が可能です。</p>
              </li>
              <li>
                <strong>ノート生成:</strong>
                <p className="ml-4">文字起こ結果に基づいてノートを生成します。プロンプトを選択し、「ノート生成」ボタンをクリックすると、整理されたノートが右側のエディタに表示されます。</p>
              </li>
              <li>
                <strong>ノート編集:</strong>
                <p className="ml-4">生成されたノートは編集可能です。フォーマットツールバーを使用してテキストの装飾やレイアウトの調整ができます。</p>
              </li>
              <li>
                <strong>図および画像の追加:</strong>
                <p className="ml-4">ノートに視覚的な要素を追加するために、SVG図や画像を生成して配置できます。生成したい箇所のノートのテキストを選択した状態で、図を生成するには「図を生成」ボタンを、画像を生成するには「画像を生成」ボタンを使用します。それぞれの図や画像はドラッグ＆ドロップで移動可能です。また、拡大縮小もできます。</p>
              </li>
              <li>
                <strong>PDF出力:</strong>
                <p className="ml-4">完成したノートはPDF形式でエクスポートできます。ツールバーのPDF出力ボタンをクリックすると、ノート全体が一つのPDFファイルとしてダウンロードされます。</p>
              </li>
              <li>
                <strong>動画生成:</strong>
                <p className="ml-4">生成されたノートから動画を作成できます。「動画タイプを選択」ドロップダウンメニューから、パソコン用（横向き）またはスマホ用（縦向き）の動画形式を選択できます。「動画を生成」ボタンをクリックすると、選択したタイプでノートの内容を基に動画が生成されます。生成には3～5分程度かかります。生成が完了すると、動画をダウンロードできます。</p>
              </li>
              <li>
                <strong>制限事項:</strong>
                <ul className="list-disc list-inside ml-8">
                  <li>図と画像は1ページにつき、それぞれ1つまでの設置が可能です。それを超えると上書きされます。</li>
                  <li>録音時間は最大5分までです。</li>
                  <li>アップロード可能な音声ファイルのサイズは4MBまでです。</li>
                  <li>文字起こしにはインターネット接続が必要です。</li>
                  <li>ブラウザによっては音声認識機能がサポートされていない場合があります。</li>
                  <li>動画生成には時間がかかり、サーバーの負荷状況によっては更に時間がかかる場合があります。</li>
                </ul>
              </li>
            </ol>
            <p className="mt-2">ご不明な点がございましたら、お気軽にお問い合わせください。</p>
          </div>
        )}
      </div>
      
      {/* タブコンテンツなど他のコンポーネント */}
      <Tabs defaultValue="microphone" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="microphone">マイク入力</TabsTrigger>
          <TabsTrigger value="file">ファイル入力</TabsTrigger>
        </TabsList>
        <TabsContent value="microphone">
          <Button 
            onClick={handleStartRecording} 
            className="w-full"
            disabled={totalRecordingTime >= MAX_RECORDING_TIME}
          >
            {isRecording ? (
              <>
                <Mic className="w-4 h-4 mr-2 animate-pulse text-red-500" />
                録音停止
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                録音開始
              </>
            )}
          </Button>
          <div className="mt-2 text-center">
            {isRecording ? (
              <>現在の録音時間: {currentSessionTime}秒</>
            ) : (
              <>合計録音時間: {totalRecordingTime}秒</>
            )}
          </div>
          <div className="mt-2 text-center">
            残り録音可能時間: {getRemainingTime()}
          </div>
        </TabsContent>
        <TabsContent value="file">
          <div className="space-y-2">
            <p className="text-xs text-gray-500 mb-1">ファイルサイズは4MBまでです。</p>
            <Input
              type="file"
              accept="audio/wav,audio/mpeg"
              onChange={handleFileUpload}
              className="w-full"
            />
            <Button onClick={handleTranscribeFile} disabled={!audioFile || isTranscribing} className="w-full">
              {isTranscribing ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  文字起こし中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  文字起こし開始
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AudioRecorder;
