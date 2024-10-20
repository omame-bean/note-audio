import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AI音声ノートアプリ - 音声からスマートノートを作成",
  description: "AIを活用して音声をスマートなノートに変換。図や画像の自動生成機能付き。動画も作成も可能！スマホからも操作できます。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-blue-50 to-indigo-100`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <header className="mb-8 pt-5">
            <h1 className="text-4xl font-bold text-indigo-900 text-center">AI音声ノートアプリ</h1>
            <p className="text-xl text-indigo-700 text-center mt-2">音声からスマートノートを瞬時に作成</p>
            <p className="text-x0 text-indigo-500 text-center mt-0">ノート内容の動画も作成できる！</p>
            <p className="text-x0 text-indigo-500 text-center mt-0">スマホからの操作もOK！</p>
          </header>

            {children}

          <footer className="mt-8 text-center text-indigo-600">
            <p>© 2024 AI音声ノートアプリ. All rights reserved.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
