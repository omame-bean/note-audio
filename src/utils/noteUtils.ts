/**
 * noteUtils.ts
 * 
 * ノートの生成、編集、エクスポートに関するユーティリティ関数を提供するモジュール。
 * 
 * 主な機能:
 * - ノートコンテンツの複数ページへの分割
 * - PDFへのエクスポート（SVGと画像を含む）
 * - ページコンテンツのHTMLラッピング
 * - 要素の高さ推定
 * 
 * このモジュールは、ノートアプリケーションの中核となる機能を提供し、
 * ノートの管理とエクスポートを支援します。
 * 
 * @module noteUtils
 */

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import noteEditorStyles from '../styles/NoteEditor.css';
const styles = noteEditorStyles as { [key: string]: string };

// A4サイズとレイアウトの定数
const PAGE_HEIGHT = 297; // A4サイズの高さ（mm）
const PAGE_WIDTH = 210; // A4サイズの幅（mm）
const PADDING_TOP = 40; // 上部のパディング（px）
const PADDING_BOTTOM = 0; // 下部のパディング（px）
const MM_TO_PX = 3.779528; // mmをpxに変換する定数

// 使用可能なページの高さ
export const USABLE_PAGE_HEIGHT = PAGE_HEIGHT * MM_TO_PX - PADDING_TOP - PADDING_BOTTOM;

// 画像の読み込みを待つヘルパー関数を追加
const waitForImages = (element: HTMLElement): Promise<void> => {
  const images = Array.from(element.getElementsByTagName('img'));
  const promises = images.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve; // エラー時も続行
    });
  });
  return Promise.all(promises).then(() => {});
};

// ノートを複数ページに分割する関数
export const generateNotePages = (content: string): string[] => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const elements = Array.from(tempDiv.children);

  const pages: string[] = [];
  let currentPage = '';
  let currentHeight = 0; // ページの現在の高さを追跡

  elements.forEach((element) => {
    const elementHtml = element.outerHTML;
    const elementHeight = estimateElementHeight(element);

    if (currentHeight + elementHeight > USABLE_PAGE_HEIGHT) {
      if (currentHeight > 0) {
        pages.push(wrapPageContent(currentPage, pages.length));
        currentPage = '';
        currentHeight = 0;
      }
    }

    currentPage += elementHtml;
    currentHeight += elementHeight;
  });

  if (currentPage) {
    pages.push(wrapPageContent(currentPage, pages.length));
  }

  return pages;
};

// 要素の高さをピクセルで推定する関数
const estimateElementHeight = (element: Element): number => {
  const style = window.getComputedStyle(element);
  const lineHeight = parseFloat(style.lineHeight || '40'); // デフォルトラインハイト

  const text = element.textContent || '';
  const lines = Math.ceil(text.length / 47); // 47文字で1行と仮定（countLines関数と一致）

  return lines * lineHeight;
};

// ページコンテンツをHTMLでラップする関数を更新
const wrapPageContent = (content: string, pageNumber: number, fixedHeight: boolean = true): string => {
  const contentStyles = Object.entries(styles)
    .map(([key, value]) => {
      if (key === 'note-content') {
        if (fixedHeight) {
          // 高さを固定するスタイル
          return `.${key} { 
            font-family: 'Zen Kurenaido', sans-serif; 
            font-size: 16px; 
            line-height: 40px; 
            width: 210mm; 
            height: 297mm; /* 固定高さを再追加 */
            position: relative; 
            background: linear-gradient(to bottom, #ffffff 39px, #00b0d7 1px); 
            background-size: 100% 40px; 
            background-position: 0 2px; 
            box-sizing: border-box; 
            overflow: hidden; 
            padding: 0 2mm; 
          }`;
        } else {
          // 高さを固定しないスタイル
          return `.${key} { 
            font-family: 'Zen Kurenaido', sans-serif; 
            font-size: 16px; 
            line-height: 40px; 
            width: 210mm; 
            /* height: 297mm; 削除 */
            position: relative; 
            background: linear-gradient(to bottom, #ffffff 39px, #00b0d7 1px); 
            background-size: 100% 40px; 
            background-position: 0 2px; 
            box-sizing: border-box; 
            overflow: hidden; 
            padding: 0 2mm; 
          }`;
        }
      }
      return `.${key} { ${value} }`;
    })
    .join('\n');

  return `
    <style>${contentStyles}</style>
    <div class="note-content">
      <div class="note-content-inner">
        ${content}
      </div>
      ${fixedHeight ? `<div class="page-number">- ${pageNumber + 1} -</div>` : ''}
    </div>
  `;
};

// PDFエクスポート処理の修正
export const handleExportPDF = async (
  generatedNotes: string[],
  svgDiagrams: (string | null)[],
  svgScales: number[],
  svgPositions: { x: number; y: number }[],
  generatedImages: (string | null)[],
  imageScales: number[],
  imagePositions: { x: number; y: number }[]
) => {
  const pdf = new jsPDF('p', 'mm', 'a4');

  for (let i = 0; i < generatedNotes.length; i++) {
    const pageElement = document.createElement('div');
    pageElement.innerHTML = generatedNotes[i] || '';
    pageElement.style.width = `${PAGE_WIDTH}mm`;
    pageElement.style.height = `${PAGE_HEIGHT}mm`;
    pageElement.style.position = 'relative';
    pageElement.style.padding = '0';
    pageElement.style.boxSizing = 'border-box';
    pageElement.style.overflow = 'hidden';
    pageElement.style.background = 'linear-gradient(to bottom, #ffffff 39px, #00b0d7 1px) 0% 0% / 100% 40px';

    document.body.appendChild(pageElement);

    if (svgDiagrams[i]) {
      const svgDiagram = svgDiagrams[i];
      const svgScale = svgScales[i] || 1;
      const svgPosition = svgPositions[i] || { x: 0, y: 0 };

      const svgElement = document.createElement('div');
      svgElement.innerHTML = svgDiagram!;
      svgElement.style.position = 'absolute';
      svgElement.style.left = `${svgPosition.x}px`;
      svgElement.style.top = `${svgPosition.y}px`;
      svgElement.style.transform = `scale(${svgScale})`;
      svgElement.style.transformOrigin = 'top left';
      pageElement.appendChild(svgElement);
    }

    if (generatedImages[i]) {
      const imageUrl = generatedImages[i];
      const imageScale = imageScales[i] || 1;
      const imagePosition = imagePositions[i] || { x: 0, y: 0 };

      const imageElement = document.createElement('img');
      imageElement.src = imageUrl!;
      imageElement.style.position = 'absolute';
      imageElement.style.left = `${imagePosition.x}px`;
      imageElement.style.top = `${imagePosition.y}px`;
      imageElement.style.width = '512px';
      imageElement.style.height = '512px';
      imageElement.style.transform = `scale(${imageScale})`;
      imageElement.style.transformOrigin = 'top left';
      imageElement.crossOrigin = 'anonymous';
      pageElement.appendChild(imageElement);
    }

    await waitForImages(pageElement);

    await new Promise<void>(resolve => {
      html2canvas(pageElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
        document.body.removeChild(pageElement);
        resolve();
      });
    });
  }

  pdf.save('generated_note.pdf');
};

/**
 * コンテンツの高さをピクセルで推定する関数
 */
export const estimateContentHeight = (content: string): number => {
  const tempDiv = document.createElement('div');
  tempDiv.style.visibility = 'hidden';
  tempDiv.style.position = 'absolute';
  tempDiv.style.width = `${PAGE_WIDTH * MM_TO_PX}px`;
  tempDiv.innerHTML = wrapPageContent(content, 0, false);
  document.body.appendChild(tempDiv);
  const height = tempDiv.scrollHeight;
  document.body.removeChild(tempDiv);
  return height;
};
