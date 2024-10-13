import axios from 'axios'

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post('/api/generate-image', { prompt })
    return response.data.imageUrl // ここはデータURLになります
  } catch (error) {
    console.error('Error generating image:', error)
    throw new Error('画像の生成中にエラーが発生しました。')
  }
}
