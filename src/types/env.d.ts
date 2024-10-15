/**
 * env.d.ts
 * 
 * 環境変数の型定義ファイル。
 * 
 * このファイルは、プロジェクトで使用される環境変数の型を定義します。
 * TypeScriptに環境変数の存在を認識させ、型安全性を確保するために使用されます。
 * 
 * 定義されている環境変数:
 * - NEXT_PUBLIC_OPENAI_API_KEY: OpenAI APIのキー
 * 
 * 注意: このファイルは型定義のみを行い、実際の値は.envファイルやデプロイ環境で設定します。
 * 
 * @module EnvironmentVariables
 */

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_OPENAI_API_KEY: string;
  }
}
