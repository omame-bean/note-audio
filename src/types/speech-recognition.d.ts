/**
 * speech-recognition.d.ts
 * 
 * Web Speech API の SpeechRecognition インターフェースに関する型定義ファイル。
 * 
 * このファイルは、ブラウザの音声認識機能を使用するための型定義を提供します。
 * SpeechRecognition オブジェクトとその関連インターフェースの型を定義し、
 * TypeScript プロジェクトでの音声認識機能の実装を支援します。
 * 
 * @module SpeechRecognitionTypes
 */

export {};

declare global {
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    start: () => void;
    stop: () => void;
  }

  interface SpeechRecognitionStatic {
    new (): SpeechRecognition;
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
  }

  interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence?: number;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
  }

  let SpeechRecognition: SpeechRecognitionStatic;
  let webkitSpeechRecognition: SpeechRecognitionStatic;
}
