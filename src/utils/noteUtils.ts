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
        background-position: 0 0;
        outline: none;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }
      .note-content h1 {
        text-align: center;
        margin: 0 0 40px;
        color: #1a237e;
        font-size: 24px;
        line-height: 40px;
      }
      .note-content h2 {
        margin: 0;
        color: #1976d2;
        font-size: 20px;
        line-height: 40px;
      }
      .note-content p, .note-content ul {
        margin: 0;
        padding: 0;
      }
      .note-content ul {
        list-style-type: none;
      }
      .note-content li {
        padding-left: 20px;
        position: relative;
      }
      .note-content li::before {
        content: '•';
        position: absolute;
        left: 0;
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

// PDFエクスポート処理
export const handleExportPDF = async (generatedNotes: string[]) => {
  const pdf = new jsPDF('p', 'mm', 'a4');

  for (let i = 0; i < generatedNotes.length; i++) {
    const pageElement = document.createElement('div');
    pageElement.innerHTML = generatedNotes[i];
    pageElement.style.width = `${PAGE_WIDTH}mm`;
    pageElement.style.height = `${PAGE_HEIGHT}mm`;
    document.body.appendChild(pageElement);

    const canvas = await html2canvas(pageElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: PAGE_WIDTH * 3.779528, // 1mmあたり約3.779528ピクセル（72dpi）
      height: PAGE_HEIGHT * 3.779528
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT);

    document.body.removeChild(pageElement);
  }

  pdf.save('generated_note.pdf');
};