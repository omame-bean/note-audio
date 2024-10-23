import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: Request) {
  const { transcription, selectedPrompt } = await request.json()

  if (!transcription || !selectedPrompt) {
    return NextResponse.json({ message: '文字起こしとプロンプトの両方が必要です。' }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json({ message: 'APIキーが設定されていません。' }, { status: 500 })
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'あなたは優秀なノートテイカーです。与えられた文字起こしを整理し、読みやすくまとめてください。HTMLタグを使用して構造化してください。' },
          { role: 'user', content: `以下の文字起こしを「${selectedPrompt}」というプロンプトに基づいてまとめてください。以下の指示に従ってください：

1. すべてpタグでフォーマットしてください。
2. 内容を簡潔に要約し、重要なポイントを箇条書きでまとめてください。
3. 適切な見出しを使用して構造化してください。
4. リストや段落を適切に使用し、読みやすく整形してください。
5. マークダウン記法ではなく、HTMLタグのpタグを使用してフォーマットしてください。
6. ulタグやolタグ、hタグは使用しないでください。
7. コードブロックや "バッククォート3つ + html" のような記述は使用しないでください。

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
    )

    let generatedContent = response.data.choices[0].message.content

    // hタグ、ulタグ、olタグをpタグに変換
    generatedContent = generatedContent.replace(/<\/?h[1-6]>/g, '<p>')
    generatedContent = generatedContent.replace(/<\/?[uo]l>/g, '<p>')
    generatedContent = generatedContent.replace(/<\/?li>/g, '<p>')

    return NextResponse.json({ content: generatedContent })
  } catch (error) {
    console.error('Error generating note:', error)
    return NextResponse.json({ message: 'ノート生成中にエラーが発生しました。' }, { status: 500 })
  }
}
