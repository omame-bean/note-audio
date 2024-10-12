import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// A4サイズとレイアウトの定数
const PAGE_HEIGHT = 297; // A4サイズの高さ（mm）
const PAGE_WIDTH = 210; // A4サイズの幅（mm）
const LINE_HEIGHT = 40; // 1行の高さ（px）
const PADDING_TOP = 40; // 上部のパディング（px）
const PADDING_BOTTOM = 60; // 下部のパディング（px）
const LINES_PER_PAGE = 28; // 1ページあたりの罫線数
const MAX_LINES_PER_PAGE = Math.floor(LINES_PER_PAGE * 0.95); // ページの95%まで使用
const MM_TO_PX = 3.779528; // mmをpxに変換する定数

// 定数の定義
const MARGIN = 5 // mmのマージンを設定

// ノートを複数ページに分割する関数
export const generateNotePages = (content: string): string[] => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const elements = Array.from(tempDiv.children);

  const pages: string[] = [];
  let currentPage = '';
  let currentLines = 0;

  elements.forEach((element) => {
    const elementContent = element.outerHTML;
    const elementLines = getElementLines(element);
    
    if (currentLines + elementLines > MAX_LINES_PER_PAGE) {
      if (currentLines > 0) {
        pages.push(wrapPageContent(currentPage, pages.length));
        currentPage = '';
        currentLines = 0;
      }
    }
    
    currentPage += elementContent;
    currentLines += elementLines;
  });

  if (currentPage) {
    pages.push(wrapPageContent(currentPage, pages.length));
  }

  return pages;
};

// 要素の行数を推定する関数
const getElementLines = (element: Element): number => {
  const content = element.textContent || '';
  const lines = Math.ceil(content.length / 40); // 40文字で1行と仮定

  switch (element.tagName.toLowerCase()) {
    case 'h1':
      return 2; // h1は2行分
    case 'h2':
      return 1; // h2は1行分
    case 'ul':
      return element.children.length; // リストの各項目を1行とカウント
    case 'p':
      return lines;
    default:
      return 1;
  }
};

// ページコンテンツをHTMLでラップする関数
const wrapPageContent = (content: string, pageNumber: number): string => {
  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Zen+Kurenaido&display=swap');
      .note-content {
        font-family: 'Zen Kurenaido', sans-serif;
        font-size: 16px;
        line-height: 40px;
        padding: 40px 20px 20px;
        width: 210mm;
        height: 297mm;
        position: relative;
        background: linear-gradient(to bottom, #ffffff 39px, #00b0d7 1px);
        background-size: 100% 40px;
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
      ${content}
      <div class="page-number">- ${pageNumber + 1} -</div>
    </div>
  `;
};

// PDFエクスポート処理の修正
export const handleExportPDF = async (
  generatedNotes: string[],
  svgDiagram: string | null,
  svgScale: number,
  svgPosition: { x: number; y: number }
) => {
  console.log('=== handleExportPDF Start ===');
  console.log('Generated Notes:', generatedNotes);
  console.log('SVG Diagram:', svgDiagram);
  console.log('SVG Scale:', svgScale);
  console.log('SVG Position:', svgPosition);

  const pdf = new jsPDF('p', 'mm', 'a4');

  for (let i = 0; i < generatedNotes.length; i++) {
    console.log(`--- Processing Page ${i + 1} ---`);
    const pageElement = document.createElement('div');
    pageElement.innerHTML = generatedNotes[i];
    pageElement.style.width = `${PAGE_WIDTH}mm`;
    pageElement.style.height = `${PAGE_HEIGHT}mm`;
    pageElement.style.position = 'relative';
    pageElement.style.padding = `${MARGIN}mm`;
    pageElement.style.boxSizing = 'border-box';
    pageElement.style.backgroundColor = 'white';
    pageElement.style.overflow = 'hidden';
    document.body.appendChild(pageElement);

    if (svgDiagram) {
      console.log('Adding SVG to the page');
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgDiagram, 'image/svg+xml');
      const svgElement = svgDoc.querySelector('svg');

      if (svgElement instanceof SVGElement) {
        const originalWidth = parseFloat(svgElement.getAttribute('width') || '400');
        const originalHeight = parseFloat(svgElement.getAttribute('height') || '300');

        console.log('Original SVG Size (px):', originalWidth, originalHeight);

        // スケールを適用
        let scaledWidth = originalWidth * svgScale;
        let scaledHeight = originalHeight * svgScale;

        console.log('Scaled SVG Size (px):', scaledWidth, scaledHeight);

        let scaledWidth_mm = scaledWidth / MM_TO_PX;
        let scaledHeight_mm = scaledHeight / MM_TO_PX;

        console.log('Scaled SVG Size (mm):', scaledWidth_mm, scaledHeight_mm);

        // ブラウザ上の位置をPDF上の位置に変換
        let x_mm = svgPosition.x / MM_TO_PX;
        let y_mm = svgPosition.y / MM_TO_PX;

        console.log('Original SVG Position (mm):', x_mm, y_mm);

        // SVGがページ外に出ないように位置を調整
        const maxWidth = PAGE_WIDTH - 2 * MARGIN;
        const maxHeight = PAGE_HEIGHT - 2 * MARGIN;
        const scaleRatio = Math.min(maxWidth / scaledWidth_mm, maxHeight / scaledHeight_mm, 1);

        if (scaleRatio < 1) {
          scaledWidth_mm *= scaleRatio;
          scaledHeight_mm *= scaleRatio;
          scaledWidth *= scaleRatio;
          scaledHeight *= scaleRatio;
          console.log('Adjusted SVG Size (mm):', scaledWidth_mm, scaledHeight_mm);
        }

        x_mm = Math.max(MARGIN, Math.min(x_mm, PAGE_WIDTH - scaledWidth_mm - MARGIN));
        y_mm = Math.max(MARGIN, Math.min(y_mm, PAGE_HEIGHT - scaledHeight_mm - MARGIN));

        console.log('Adjusted SVG Position (mm):', x_mm, y_mm);

        // SVG全体のスケールを調整するために、viewBox属性を設定し、widthとheightを指定
        svgElement.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`);
        svgElement.setAttribute('width', `${scaledWidth_mm}mm`);
        svgElement.setAttribute('height', `${scaledHeight_mm}mm`);

        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

        const svgImg = document.createElement('img');
        svgImg.src = svgUrl;
        svgImg.style.position = 'absolute';
        svgImg.style.left = `${x_mm}mm`;
        svgImg.style.top = `${y_mm}mm`;
        svgImg.style.width = `${scaledWidth_mm}mm`;
        svgImg.style.height = `${scaledHeight_mm}mm`;

        pageElement.appendChild(svgImg);
      } else {
        console.warn('SVG要素が見つかりませんでした。');
      }
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