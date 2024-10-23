import { NextRequest, NextResponse } from 'next/server'
import { generateSVGDiagram } from '@/utils/svgUtils'

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'APIキーが設定されていません。' }, { status: 500 })
    }

    const svgContent = await generateSVGDiagram(apiKey, content)

    return NextResponse.json({ svg: svgContent })
  } catch (error) {
    console.error('Error in generate-svg API:', error)
    return NextResponse.json({ error: 'SVG図の生成中にエラーが発生しました。' }, { status: 500 })
  }
}
