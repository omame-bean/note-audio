"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Upload } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// AudioRecorderコンポーネントのプロパティ定義
interface AudioRecorderProps {
  setTranscription: React.Dispatch<React.SetStateAction<string>>
  setError: React.Dispatch<React.SetStateAction<string | null>>
  apiKey: string
  audioFile: File | null
  setAudioFile: React.Dispatch<React.SetStateAction<File | null>>
  isTranscribing: boolean
  setIsTranscribing: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AudioRecorder({
  setTranscription,
  setError,
  apiKey,
  audioFile,
  setAudioFile,
  isTranscribing,
  setIsTranscribing
}: AudioRecorderProps) {
  // 状態の初期化
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [totalRecordingTime, setTotalRecordingTime] = useState(0)
  const [currentSessionTime, setCurrentSessionTime] = useState(0)

  // SpeechRecognitionの初期化と設定
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
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
        const remainingTime = Math.max(0, 15 * 60 - totalRecordingTime)
        if (remainingTime === 0) {
          setError('録音可能な最大時間（15分）に達しました。')
          return
        }

        recognitionRef.current.start()
        setIsRecording(true)
        setError(null)
        setCurrentSessionTime(0)

        // 残り時間または15分後に録音を自動停止するタイマーを設定
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
    const remainingSeconds = Math.max(0, 15 * 60 - totalRecordingTime)
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
      if (file.size > 25 * 1024 * 1024) { // 25MB limit (approx. 15 minutes of audio)
        setError('ファイルサイズは25MB以下にしてください（約15分の音声）。')
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
    if (!apiKey) {
      setError('APIキーが設定されていません。')
      return
    }

    setIsTranscribing(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', audioFile)
    formData.append('model', 'whisper-1')

    try {
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
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
      <div className="bg-gray-100 p-4 rounded-lg text-sm">
        <h3 className="font-bold mb-2">使い方と制限事項：</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>マイク入力：最大15分間の録音が可能です。15分経過すると自動的に停止します。</li>
          <li>ファイル入力：WAVまたはMP3形式の音声ファイル（最大25MB）をアップロードできます。</li>
          <li>25MBは約15分の音声に相当します（音質により異なる場合があります）。</li>
          <li>文字起こしには、OpenAI社のWhisperモデルを使用しています。</li>
        </ul>
      </div>

      <Tabs defaultValue="microphone" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="microphone">マイク入力</TabsTrigger>
          <TabsTrigger value="file">ファイル入力</TabsTrigger>
        </TabsList>
        <TabsContent value="microphone">
          <Button 
            onClick={handleStartRecording} 
            className="w-full"
            disabled={totalRecordingTime >= 15 * 60}
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