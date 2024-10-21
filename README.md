# AI音声ノートアプリ

このプロジェクトは、音声入力や音声ファイルからスマートなノートを作成するAIアプリケーションです。ユーザーは音声をテキストに変換し、AIの力を借りて整理されたノートを生成できます。また、生成されたノートには図や画像を追加することも可能です。さらに、VRMキャラクターがアプリの使い方を説明し、ユーザーの質問に対応します。キャラクターは感情に応じて表情を変えるため、直感的な操作が可能です。

## 目次

- [機能](#機能)
- [インストール方法](#インストール方法)
- [使い方](#使い方)
  - [1. 音声入力](#1-音声入力)
  - [2. 音声ファイルのアップロード](#2-音声ファイルのアップロード)
  - [3. 文字起こし結果の確認](#3-文字起こし結果の確認)
  - [4. ノート生成](#4-ノート生成)
  - [5. ノートの編集](#5-ノートの編集)
  - [6. 図や画像の追加](#6-図や画像の追加)
  - [7. PDF出力](#7-pdf出力)
  - [8. VRMキャラクターとのインタラクション](#8-vrmキャラクターとのインタラクション)
  - [9. 動画生成](#9-動画生成)
- [注意事項](#注意事項)
- [技術スタック](#技術スタック)

## 機能

- **音声入力**: マイクを使用して直接録音。
- **音声ファイルのアップロード**: WAVまたはMP3形式の音声ファイルをアップロード。
- **自動文字起こし**: 録音またはアップロードされた音声をテキストに変換。
- **ノート生成**: 文字起こし結果を基にAIが整理されたノートを作成。
- **ノート編集**: 生成されたノートをリアルタイムで編集可能。
- **図や画像の追加**: テキストから関連する図や画像を自動生成し、ノートに挿入。
- **PDF出力**: 完成したノートをPDF形式でダウンロード。
- **VRMキャラクターによるガイドとインタラクション**:
  - **使い方の説明**: VRMキャラクターがアプリの使い方を分かりやすく説明します。
  - **質問対応**: ユーザーはアプリに関するあらゆる質問をキャラクターに投げかけることができます。
  - **感情表現の変化**: キャラクターは感情に応じて表情を変え、より親しみやすいインターフェースを提供します。
- **動画生成**: 生成されたノートの内容を基に、説明動画を自動生成。

## インストール方法

1. **リポジトリをクローンする**

   ```bash
   git clone https://github.com/omame-bean/note-audio.git
   ```

2. **ディレクトリに移動する**

   ```bash
   cd note-audio
   ```

3. **依存関係をインストールする**

   ```bash
   npm install
   # または
   yarn install
   # または
   pnpm install
   ```

4. **環境変数を設定する**

   プロジェクトルートに `.env.local` ファイルを作成し、必要な環境変数を追加します。

   ```
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000  # バックエンドサーバーのURL
   ```

5. **開発サーバーを起動する**

   ```bash
   npm run dev
   # または
   yarn dev
   # または
   pnpm dev
   ```

6. **ブラウザでアプリを確認する**

   [http://localhost:3000](http://localhost:3000) にアクセスしてください。

## 使い方

### 1. 音声入力

1. **「マイク入力」タブを選択**
   
   アプリの上部にあるタブメニューから「マイク入力」を選択します。

2. **録音開始**
   
   「録音開始」ボタンをクリックして、音声の録音を開始します。

3. **録音中の表示**
   
   録音中は、現在の録音時間と合計録音時間が画面に表示されます。

4. **録音停止**
   
   録音を停止するには、再度「録音開始」ボタンをクリックします。録音は最大5分間可能です。

### 2. 音声ファイルのアップロード

1. **「ファイル入力」タブを選択**
   
   タブメニューから「ファイル入力」を選びます。

2. **音声ファイルをアップロード**
   
   WAVまたはMP3形式の音声ファイル（最大4MB）をドラッグ＆ドロップするか、「ファイルを選択」ボタンをクリックしてアップロードします。

3. **文字起こし開始**
   
   ファイルがアップロードされたら、「文字起こし開始」ボタンをクリックして、音声ファイルの文字起こしを行います。

### 3. 文字起こし結果の確認

- 音声入力またはファイルアップロード後、文字起こしされたテキストがテキストエリアに表示されます。
- 必要に応じて、テキストを手動で修正・編集することができます。

### 4. ノート生成

1. **プロンプトを選択**
   
   ドロップダウンメニューから適切なプロンプト（例：「会議内容を整理する」）を選びます。

2. **ノート生成**
   
   「ノート生成」ボタンをクリックします。AIが文字起こし結果を基に整理されたノートを生成し、右側のエディタに表示します。

### 5. ノートの編集

- **編集モードに切替**
  
  生成されたノート内の「編集」ボタンをクリックすると、編集モードに切り替わります。

- **テキストの修正**
  
  必要に応じてテキストを追加・削除・修正できます。

- **フォーマット調整**
  
  ツールバーのオプションを使用して、テキストのフォントやスタイルを変更できます。

### 6. 図や画像の追加

1. **テキストの選択**
   
   ノート内の追加したいテキスト部分を選択します。

2. **図や画像の生成**
   
   「図を生成」または「画像を生成」ボタンをクリックします。AIが選択したテキストに基づいて関連する図や画像を自動生成します。

3. **配置と調整**
   
   生成された図や画像はドラッグ＆ドロップで任意の位置に配置し、サイズや位置を調整できます。

### 7. PDF出力

- **PDF形式でダウンロード**
  
  完成したノートを「PDF出力」ボタンをクリックすることで、PDF形式でダウンロードできます。これにより、オフラインでも閲覧や印刷が可能です。

### 8. VRMキャラクターとのインタラクション

1. **キャラクターのガイド機能**
   
   アプリを起動すると、画面上部にVRMキャラクター「こはる」が表示されます。キャラクターがアプリの各機能を紹介し、使い方をガイドします。

2. **質問機能**
   
   キャラクターに対して、あらゆる質問を投げかけることができます。例えば、「この機能の使い方を教えて」といった質問に対して、キャラクターが応答します。

3. **感情による表情変化**
   
   キャラクターはユーザーのインタラクションやアプリの状態に応じて、感情表現（喜び、驚き、困惑など）が変化します。これにより、より親しみやすく、直感的なユーザー体験を提供します。

### 9. 動画生成

1. **動画生成の開始**
   
   ノートエディタの下部にある「動画を生成」ボタンをクリックします。

2. **生成プロセス**
   
   動画の生成には約4〜5分かかります（サーバーによって変わります）。

3. **動画のダウンロード**
   
   生成が完了すると、「動画をダウンロード」ボタンが表示されます。クリックして動画をダウンロードできます。

注意: 動画生成にはサーバーリソースを使用するため、生成には時間がかかります。また、この機能はサーバーの性能に依存します。

## 注意事項

- **録音時間の制限**
  
  録音は最大5分間まで可能です。5分を超える録音を試みると、自動的に録音が停止します。

- **ファイルサイズの制限**
  
  アップロードできる音声ファイルのサイズは最大4MBです。これを超えるファイルはアップロードできません。

- **インターネット接続**
  
  このアプリケーションはAI機能を利用するため、安定したインターネット接続が必要です。

- **プライバシー**
  
  録音された音声データは、文字起こしおよびノート生成のみに使用され、他の目的には利用されません。ただし、プライバシーに関する詳細はプライバシーポリシーをご確認ください。

- **動画生成の制限**
  
  動画生成機能は、サーバーリソースを大量に消費します。使用頻度に制限がある場合があります。

## 技術スタック

このプロジェクトでは以下の技術を使用しています：

- [Next.js](https://nextjs.org/docs) - Reactベースのフレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - ユーティリティファーストのCSSフレームワーク
- [OpenAI API](https://openai.com/blog/openai-api) - 自然言語処理と画像生成
- [Three.js](https://threejs.org/) - 3Dグラフィックスライブラリ
- [Axios](https://axios-http.com/) - HTTPクライアント
- [@pixiv/three-vrm](https://github.com/pixiv/three-vrm) - VRMモデルのローダーとレンダリング
- その他多くのライブラリとツールを使用しています。詳細は `package.json` をご確認ください。
