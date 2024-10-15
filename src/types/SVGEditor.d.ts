/**
 * SVGEditor.d.ts
 * 
 * SVGEditor コンポーネントの型定義ファイル。
 * 
 * このファイルは、SVGEditor コンポーネントのプロパティの型を定義します。
 * SVGEditor コンポーネントを使用する際の型安全性を確保し、
 * 開発者が正しいプロパティを渡すことを支援します。
 * 
 * @module SVGEditorTypes
 */

declare module '@/components/SVGEditor' {
  import React from 'react';

  interface SVGEditorProps {
    svgContent: string;
    isEditing: boolean;
    onUpdate: (newSvgScale: number) => void;
    onDelete: () => void;
    scale: number;
    onPositionChange: (newPosition: { x: number; y: number }) => void;
  }

  const SVGEditor: React.FC<SVGEditorProps>;
  export default SVGEditor;
}
