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
