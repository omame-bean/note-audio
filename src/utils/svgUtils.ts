import axios from 'axios'

// SVGコンテンツをクリーンアップする関数
export const cleanupSVGContent = (content: string): string => {
  // SVGタグの開始と終了を探す
  const svgStart = content.indexOf('<svg')
  const svgEnd = content.lastIndexOf('</svg>') + 6 // '</svg>'の長さを加える

  if (svgStart !== -1 && svgEnd !== -1) {
    // SVGタグの中身だけを抽出
    return content.slice(svgStart, svgEnd)
  }

  // SVGタグが見つからない場合は元のコンテンツを返す
  return content
}

export const generateSVGDiagram = async (apiKey: string, noteContent: string): Promise<string> => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'あなたはSVG図を生成する専門家です。与えられたノートの内容を元に、適切なSVG図を生成してください。背景は付けず、SVGのコードのみを返してください。テキストは少なめにし、シンプルな図を生成してください。 SVGのコードは、<svg>タグで始まり、</svg>タグで終わるものとします。前後の余計な文字列は不要です。' },
          { role: 'user', content: `以下のノート内容を元に、内容を視覚化するSVG図を生成してください。SVGのコードのみを返してください。

ノート内容：

${noteContent}` }
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const svgContent = response.data.choices[0].message.content.trim()
    return cleanupSVGContent(svgContent) // クリーンアップ関数を適用
  } catch (error) {
    console.error('Error generating SVG diagram:', error)
    throw new Error('SVG図の生成中にエラーが発生しました。')
  }
}
