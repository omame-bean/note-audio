// SpeechRecognitionイベントのインターフェース定義
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: string | null;
}

// グローバルWindowオブジェクトにSpeechRecognitionを追加
interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}

// SpeechRecognitionコンストラクタの宣言
declare let SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

// webkitSpeechRecognitionコンストラクタの宣言（Chromeなどのブラウザ用）
declare let webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};