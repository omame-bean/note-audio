/**
 * imageUtils.ts
 * 
 * 画像生成に関するユーティリティ関数を提供するモジュール。
 * 
 * 主な機能:
 * - OpenAI APIを使用した画像生成
 * 
 * このモジュールは、与えられたプロンプトに基づいて画像を生成し、
 * 生成された画像のURLを返す機能を提供します。
 * 
 * @module imageUtils
 */

import axios from 'axios'

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post('/api/generate-image', { prompt })
    if (response.data && response.data.imageUrl) {
      return response.data.imageUrl
    } else {
      throw new Error('画像URLが見つかりません。')
    }
  } catch (error) {
    console.error('Error generating image:', error)
    if (axios.isAxiosError(error) && error.response) {
      // サーバーからのエラーレスポンスを確認
      console.error('Server error response:', error.response.data)
      throw new Error(`画像生成エラー: ${error.response.data.error || '不明なエラー'}`)
    } else {
      throw new Error('画像の生成中にエラーが発生しました。')
    }
  }
}
