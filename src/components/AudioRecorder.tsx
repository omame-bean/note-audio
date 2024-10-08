"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Upload } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// SpeechRecognitionの型定義のインポートを削除

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
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'ja-JP'

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

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          setError(`音声認識エラー: ${event.error}`)
          setIsRecording(false)
        }
      }
    } else {
      setError('お使いのブラウザは音声認識をサポートしていません。')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [setTranscription, setError])

  const handleStartRecording = () => {
    if (recognitionRef.current) {
      if (!isRecording) {
        recognitionRef.current.start()
        setIsRecording(true)
        setError(null)
        // Set a timeout to stop recording after 15 minutes
        recordingTimeoutRef.current = setTimeout(() => {
          handleStopRecording()
        }, 15 * 60 * 1000)
      } else {
        handleStopRecording()
      }
    } else {
      setError('音声認識を初期化できませんでした。')
    }
  }

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current)
      }
    }
  }

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

  return (
    <Tabs defaultValue="microphone" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="microphone">マイク入力</TabsTrigger>
        <TabsTrigger value="file">ファイル入力</TabsTrigger>
      </TabsList>
      <TabsContent value="microphone">
        <Button onClick={handleStartRecording} className="w-full">
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
  )
}