'use server'

import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const model = formData.get('model') as string

    if (!file || !model) {
      return NextResponse.json({ error: 'ファイルまたはモデル名が提供されていません。' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'APIキーが設定されていません。' }, { status: 500 })
    }

    // OpenAI API に文字起こしリクエストを送信
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'multipart/form-data',
      },
    })

    const data = response.data
    return NextResponse.json({ text: data.text })
  } catch (error) {
    console.error('Error in transcribe API:', error)
    return NextResponse.json({ error: '文字起こし中にエラーが発生しました。' }, { status: 500 })
  }
}
