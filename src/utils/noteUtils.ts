import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// A4サイズとレイアウトの定数
const PAGE_HEIGHT = 297; // A4サイズの高さ（mm）
const PAGE_WIDTH = 210; // A4サイズの幅（mm）
const LINE_HEIGHT = 40; // 1行の高さ（px）
const PADDING_TOP = 40; // 上部のパディング（px）
const PADDING_BOTTOM = 60; // 下部のパディング（px）
const LINE_PER_PAGE = 25; // 1ページあたりの最大行数
const MM_TO_PX = 3.779528; // mmをpxに変換する定数

// 使用可能なページの高さ
const USABLE_PAGE_HEIGHT = PAGE_HEIGHT * MM_TO_PX - PADDING_TOP - PADDING_BOTTOM;

// 定数の定義を更新
const MARGIN = 5 // 左右のマージンを5mmに設定

// ノートを複数ページに分割する関数
export const generateNotePages = (content: string): string[] => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const elements = Array.from(tempDiv.children);

  const pages: string[] = [];
  let currentPage = '';
  let currentHeight = 0; // ページの現在の高さを追跡

  elements.forEach((element) => {
    if (element.tagName.toLowerCase() === 'ul') {
      // <ul>要素の処理を追加
      const ulHtml = element.outerHTML;
      const ulHeight = estimateElementHeight(element);

      if (currentHeight + ulHeight > USABLE_PAGE_HEIGHT) {
        if (currentHeight > 0) {
          pages.push(wrapPageContent(currentPage, pages.length));
          currentPage = '';
          currentHeight = 0;
        }
      }

      currentPage += ulHtml;
      currentHeight += ulHeight;
    } else {
      const elementHtml = element.outerHTML;
      const elementHeight = estimateElementHeight(element);

      if (currentHeight + elementHeight > USABLE_PAGE_HEIGHT) { // 修正: 使用可能なページ高さを使用
        if (currentHeight > 0) {
          pages.push(wrapPageContent(currentPage, pages.length));
          currentPage = '';
          currentHeight = 0;
        }
      }

      currentPage += elementHtml;
      currentHeight += elementHeight;
    }
  });

  if (currentPage) {
    pages.push(wrapPageContent(currentPage, pages.length));
  }

  return pages;
};

// 要素の高さをピクセルで推定する関数
const estimateElementHeight = (element: Element): number => {
  const style = window.getComputedStyle(element);
  const fontSize = parseFloat(style.fontSize || '16'); // デフォルトフォントサイズ
  const lineHeight = parseFloat(style.lineHeight || '40'); // デフォルトラインハイト

  let height = 0;

  switch (element.tagName.toLowerCase()) {
    case 'h1':
      height += lineHeight * 2;
      break;
    case 'h2':
      height += lineHeight * 1.5;
      break;
    case 'ul':
      height += element.children.length * lineHeight;
      break;
    case 'p':
      const text = element.textContent || '';
      const lines = Math.ceil(text.length / 40); // 40文字で1行と仮定
      height += lines * lineHeight;
      break;
    default:
      height += lineHeight;
      break;
  }

  return height;
};

// ページコンテンツをHTMLでラップする関数を更新
const wrapPageContent = (content: string, pageNumber: number): string => {
  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Zen+Kurenaido&display=swap');
      .note-content {
        font-family: 'Zen Kurenaido', sans-serif;
        font-size: 16px;
        line-height: 40px;
        width: 210mm;
        height: 297mm;
        position: relative;
        background: linear-gradient(to bottom, #ffffff 39px, #00b0d7 1px);
        background-size: 100% 40px;
        background-position: 0 -4px; /* 背景の罫線を4px下に移動 */
        box-sizing: border-box;
      }
      .note-content-inner {
        width: 200mm;
        margin: 0 auto;
        padding: 0 5mm;
        box-sizing: border-box;
        position: relative;
        top: -4px; /* コンテンツを4px上に移動 */
      }
      .highlight {
        background-color: yellow;
      }
      .red-text {
        color: red;
      }
      .blue-text {
        color: blue;
      }
      b, strong {
        font-weight: bold;
      }
      [style*="font-size: larger"] {
        font-size: 18px; /* 2px大きく */
        line-height: 1.0;
      }
      .page-number {
        position: absolute;
        bottom: 20px;
        right: 20px;
        font-size: 14px;
        color: #666;
      }
    </style>
    <div class="note-content">
      <div class="note-content-inner">
        ${content}
      </div>
      <div class="page-number">- ${pageNumber + 1} -</div>
    </div>
  `;
};

// PDFエクスポート処理の修正
export const handleExportPDF = async (
  generatedNotes: string[],
  svgDiagrams: (string | null)[],
  svgScales: number[],
  svgPositions: { x: number; y: number }[]
) => {
  console.log('=== handleExportPDF Start ===');
  console.log('Generated Notes:', generatedNotes);
  console.log('SVG Diagrams:', svgDiagrams);
  console.log('SVG Scales:', svgScales);
  console.log('SVG Positions:', svgPositions);

  const pdf = new jsPDF('p', 'mm', 'a4');

  for (let i = 0; i < generatedNotes.length; i++) {
    console.log(`--- Processing Page ${i + 1} ---`);
    const pageElement = document.createElement('div');
    pageElement.innerHTML = generatedNotes[i];
    pageElement.style.width = `${PAGE_WIDTH}mm`;
    pageElement.style.height = `${PAGE_HEIGHT}mm`;
    pageElement.style.position = 'relative';
    pageElement.style.padding = '0';
    pageElement.style.boxSizing = 'border-box';
    pageElement.style.backgroundColor = 'white';
    pageElement.style.overflow = 'hidden';
    document.body.appendChild(pageElement);

    if (svgDiagrams[i]) {
      // 現在のページのSVGを追加
      const svgDiagram = svgDiagrams[i];
      const svgScale = svgScales[i];
      const svgPosition = svgPositions[i];

      const svgElement = document.createElement('div');
      svgElement.innerHTML = svgDiagram!;
      svgElement.style.position = 'absolute';
      svgElement.style.left = `${svgPosition.x}px`;
      svgElement.style.top = `${svgPosition.y}px`;
      svgElement.style.transform = `scale(${svgScale})`;
      svgElement.style.transformOrigin = 'top left';
      pageElement.appendChild(svgElement);
    }

    await new Promise<void>(resolve => {
      html2canvas(pageElement, {
        scale: 2,
        useCORS: true,
        logging: true,
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
  console.log('PDF saved successfully');
};
