/**
 * css.d.ts
 * 
 * このファイルは、TypeScriptプロジェクトでCSSモジュールを使用するための型定義を提供します。
 * CSSファイルをモジュールとしてインポートする際に、TypeScriptがそれを正しく認識できるようにします。
 * 
 * 使用例:
 * import styles from './styles.css';
 * // styles オブジェクトを通じてCSSクラス名にアクセスできます
 * // 例: <div className={styles.someClass}>...</div>
 */

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
