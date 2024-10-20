"use client"

import React, { useState, useEffect } from 'react'
import NoteTakingApp from '@/components/NoteTakingApp'

const LOGIN_EXPIRATION_TIME = 60 * 60 * 1000 // 1時間（ミリ秒）

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const checkAuthStatus = () => {
      const loginTimestamp = localStorage.getItem('loginTimestamp')
      if (loginTimestamp) {
        const currentTime = new Date().getTime()
        if (currentTime - parseInt(loginTimestamp) < LOGIN_EXPIRATION_TIME) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('loginTimestamp')
        }
      }
    }

    checkAuthStatus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.success) {
        setIsAuthenticated(true)
        localStorage.setItem('loginTimestamp', new Date().getTime().toString())
      } else {
        setError(data.message || 'パスワードが正しくありません。')
      }
    } catch (error) {
      setError('認証中にエラーが発生しました。')
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('loginTimestamp')
  }

  if (isAuthenticated) {
    return (
      <div>
        <button onClick={handleLogout} className="absolute top-4 right-4 px-2 py-1 text-sm bg-red-500 text-white rounded">
          ログアウト
        </button>
        <NoteTakingApp />
      </div>
    )
  }

  return (
    <div className="pt-5 p-5">
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md">
          <h2 className="mb-4 text-xl font-bold">パスワードを入力してください</h2>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-5 mb-4 border rounded pr-10"
              placeholder="パスワード"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            >
              {showPassword ? "隠す" : "表示"}
            </button>
          </div>
          {error && <p className="mb-4 text-red-500">{error}</p>}
          <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600">
            ログイン
          </button>
        </form>
      </div>
    </div>
  )
}
