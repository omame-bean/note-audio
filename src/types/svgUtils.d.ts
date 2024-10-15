/**
 * svgUtils.d.ts
 * 
 * svgUtils モジュールの型定義ファイル。
 * 
 * このファイルは、svgUtils モジュールで提供される関数の型定義を行います。
 * 特に generateSVGDiagram 関数の型を定義し、TypeScriptプロジェクトでの
 * 型安全性を確保します。
 * 
 * @module SVGUtilsTypes
 */

declare module '@/utils/svgUtils' {
  export const generateSVGDiagram: (apiKey: string, noteContent: string) => Promise<string>;
}
