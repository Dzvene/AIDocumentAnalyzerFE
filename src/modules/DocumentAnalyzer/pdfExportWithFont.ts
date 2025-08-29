import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface Risk {
  level: string
  text: string
}

interface AnalysisResult {
  summary: string
  risks: Risk[]
  recommendations?: string[]
  pageCount?: number
  documentType?: string
  fileName?: string
  analysisDate?: Date
  pricing?: {
    total_price: number
    discount: number
    tier: string
  }
}

/**
 * Export analysis to PDF using HTML rendering for better Unicode support
 */
export const exportAnalysisToPDFWithUnicode = async (result: AnalysisResult) => {
  // Create HTML content with proper Unicode support
  const htmlContent = generatePDFHTML(result)
  
  // Create a temporary container
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.width = '210mm' // A4 width
  container.innerHTML = htmlContent
  document.body.appendChild(container)
  
  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })
    
    // Create PDF from canvas
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    // Save the PDF
    const fileName = result.fileName ? 
      `analysis_${result.fileName.replace(/\.[^/.]+$/, '')}_${Date.now()}.pdf` :
      `document_analysis_${Date.now()}.pdf`
    
    pdf.save(fileName)
  } finally {
    // Clean up
    document.body.removeChild(container)
  }
}

/**
 * Generate HTML content for PDF with proper styling
 */
function generatePDFHTML(result: AnalysisResult): string {
  const date = result.analysisDate || new Date()
  const dateStr = date.toLocaleDateString('ru-RU', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  let risksHTML = ''
  if (result.risks && result.risks.length > 0) {
    result.risks.forEach(risk => {
      const riskClass = `risk-${risk.level}`
      const riskIcon = risk.level === 'high' ? '⚠️' : 
                      risk.level === 'medium' ? '⚡' : 
                      'ℹ️'
      risksHTML += `
        <div class="${riskClass}">
          <span class="risk-icon">${riskIcon}</span>
          <span class="risk-level">${risk.level.toUpperCase()} RISK</span>
          <p>${risk.text}</p>
        </div>
      `
    })
  }
  
  let recommendationsHTML = ''
  if (result.recommendations && result.recommendations.length > 0) {
    recommendationsHTML = '<ul>' + 
      result.recommendations.map(rec => `<li>${rec}</li>`).join('') +
      '</ul>'
  }
  
  let pricingHTML = ''
  if (result.pricing) {
    const discountText = result.pricing.discount > 0 ? 
      ` (${result.pricing.discount}% скидка)` : ''
    pricingHTML = `€${result.pricing.total_price.toFixed(2)}${discountText}`
  }
  
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #333;">
      <h1 style="color: #2563eb; text-align: center; margin-bottom: 30px;">
        AI Document Analysis Report
      </h1>
      
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 5px 0;"><strong>Дата анализа:</strong> ${dateStr}</p>
        ${result.fileName ? `<p style="margin: 5px 0;"><strong>Документ:</strong> ${result.fileName}</p>` : ''}
        ${result.documentType ? `<p style="margin: 5px 0;"><strong>Тип:</strong> ${result.documentType}</p>` : ''}
        ${result.pageCount ? `<p style="margin: 5px 0;"><strong>Страниц проанализировано:</strong> ${result.pageCount}</p>` : ''}
        ${pricingHTML ? `<p style="margin: 5px 0;"><strong>Стоимость:</strong> ${pricingHTML}</p>` : ''}
      </div>
      
      ${result.summary ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Краткое резюме
          </h2>
          <p style="line-height: 1.6;">${result.summary}</p>
        </div>
      ` : ''}
      
      ${risksHTML ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Обнаруженные риски и важные условия
          </h2>
          <style>
            .risk-high {
              background: #fee2e2;
              border-left: 4px solid #dc2626;
              padding: 10px;
              margin: 10px 0;
              border-radius: 4px;
            }
            .risk-medium {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 10px;
              margin: 10px 0;
              border-radius: 4px;
            }
            .risk-info, .risk-low {
              background: #dbeafe;
              border-left: 4px solid #3b82f6;
              padding: 10px;
              margin: 10px 0;
              border-radius: 4px;
            }
            .risk-icon {
              font-size: 1.2em;
              margin-right: 8px;
            }
            .risk-level {
              font-weight: bold;
              margin-right: 10px;
            }
          </style>
          ${risksHTML}
        </div>
      ` : ''}
      
      ${recommendationsHTML ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Рекомендации
          </h2>
          ${recommendationsHTML}
        </div>
      ` : ''}
      
      <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p>Сгенерировано AI Document Analyzer</p>
        <p>© ${new Date().getFullYear()} Все права защищены</p>
      </div>
    </div>
  `
}