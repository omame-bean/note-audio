import axios from 'axios'

export const generateSVGDiagram = async (apiKey: string, noteContent: string): Promise<string> => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'あなたはSVG図を生成する専門家です。与えられたノートの内容を元に、適切なSVG図を生成してください。' },
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

    return response.data.choices[0].message.content.trim()
  } catch (error) {
    console.error('Error generating SVG diagram:', error)
    throw new Error('SVG図の生成中にエラーが発生しました。')
  }
}