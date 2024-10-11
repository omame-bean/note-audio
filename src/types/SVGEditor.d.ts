declare module '@/components/SVGEditor' {
  import React from 'react';

  interface SVGEditorProps {
    svgContent: string;
    isEditing: boolean;
    onUpdate: (newSvgContent: string) => void;
    onDelete: () => void;
  }

  const SVGEditor: React.FC<SVGEditorProps>;
  export default SVGEditor;
}