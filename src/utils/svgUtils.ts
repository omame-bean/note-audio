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
          { role: 'system', content: `
あなたはSVG図を生成する専門家です。与えられたノートの内容を元に、適切なSVG図を生成してください（表、グラフ、チャート、シーケンス図、アーキテクチャ、ER図など内容に応じて選ぶこと）。以下の点に注意してください：

1. テキストのみのSVGは禁止です。
2. SVGのコードのみを返してください。
3. テキストは少なめにし、シンプルな図を生成してください。
4. SVGのコードは、<svg>タグで始まり、</svg>タグで終わるものとします。前後の余計な文字列は不要です。
5. 高コントラストの色の組み合わせを使用し、背景色と文字色のコントラスト比が4.5:1以上になるようにしてください。
6. 色覚異常の方にも配慮し、青と黄色、緑と青などの組み合わせを使用してください。赤と緑の組み合わせは避けてください。
7. 文字サイズは最小でも14px以上にし、読みやすいフォントを使用してください。
8. 図のタイトルはいらない。
9. パターンや形状の違いも活用し、色だけに頼らない情報伝達を心がけてください。
` },
          { role: 'user', content: `
以下のノート内容を元に、内容を視覚化するSVG図を生成してください。SVGのコードのみを返してください。
SVG図は視認性を重視し、色覚異常者にも見やすい色使いにしてください。
また、文字は読みやすいサイズとフォントを使用し、背景とのコントラストを十分に確保してください。

ノート内容：

${noteContent}
` }
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

// 必要に応じてコメントや関数を確認
