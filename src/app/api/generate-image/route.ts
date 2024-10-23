import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: Request) {
  const { prompt } = await request.json()

  if (!prompt) {
    return NextResponse.json({ message: 'プロンプトが必要です。' }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json({ message: 'APIキーが設定されていません。' }, { status: 500 })
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const imageUrl = response.data.data[0].url

    // 画像を取得してBase64に変換
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64')
    const dataUrl = `data:image/png;base64,${base64Image}`

    return NextResponse.json({ imageUrl: dataUrl })
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json({ message: '画像生成中にエラーが発生しました。' }, { status: 500 })
  }
}
