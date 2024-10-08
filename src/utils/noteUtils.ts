import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export const generateNotePage = (content: string, pageNumber: number) => {
  // A4サイズに合わせて行数を計算（余白を考慮）
  const linesPerPage = 25;
  const currentLines = content.split('<br>').length;
  const remainingLines = Math.max(0, linesPerPage - currentLines);
  const additionalLines = Array(remainingLines).fill('<br>').join('');

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
        background-color: #ffff00;
      }
      .red-text {
        color: #ff0000;
      }
      .blue-text {
        color: #0000ff;
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
      ${additionalLines}
      <div class="page-number">- ${pageNumber + 1} -</div>
    </div>
  `
}

export const handleExportPDF = async (generatedNotes: string[]) => {
  const pdf = new jsPDF('p', 'mm', 'a4')
  
  for (let i = 0; i < generatedNotes.length; i++) {
    const pageElement = document.createElement('div')
    pageElement.innerHTML = generatedNotes[i]
    document.body.appendChild(pageElement)

    const canvas = await html2canvas(pageElement, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: 210 * 3.7795275591, // A4 width in pixels at 96 DPI
      height: 297 * 3.7795275591, // A4 height in pixels at 96 DPI
      onclone: (document) => {
        const style = document.createElement('style')
        style.innerHTML = `
          @import url('https://fonts.googleapis.com/css2?family=Zen+Kurenaido&display=swap');
          body { font-family: 'Zen Kurenaido', sans-serif; }
        `
        document.head.appendChild(style)
      }
    })

    const imgData = canvas.toDataURL('image/png')
    if (i > 0) pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297)

    document.body.removeChild(pageElement)
  }

  pdf.save('generated-notes.pdf')
}