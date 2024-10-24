import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// レート制限のための簡易的な実装
const WINDOW_MS = 15 * 60 * 1000 // 15分
const MAX_ATTEMPTS = 5 // 15分間で5回まで
const attempts = new Map<string, { count: number; timestamp: number }>()

export async function POST(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown'
  
  // レート制限のチェック
  const now = Date.now()
  const userAttempts = attempts.get(ip)
  
  if (userAttempts) {
    if (now - userAttempts.timestamp < WINDOW_MS) {
      if (userAttempts.count >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { success: false, message: '試行回数が多すぎます。しばらく待ってから再度お試しください。' },
          { status: 429 }
        )
      }
      userAttempts.count++
    } else {
      attempts.set(ip, { count: 1, timestamp: now })
    }
  } else {
    attempts.set(ip, { count: 1, timestamp: now })
  }

  const { password } = await request.json()

  // 環境変数に保存されているハッシュ化されたパスワードと比較
  const isValid = await bcrypt.compare(password, process.env.HASHED_PASSWORD || '')

  if (isValid) {
    // 認証成功時はその IPのアクセス試行回数をリセット
    attempts.delete(ip)
    return NextResponse.json({ success: true })
  } else {
    return NextResponse.json(
      { success: false, message: 'パスワードが正しくありません。' },
      { status: 401 }
    )
  }
}
