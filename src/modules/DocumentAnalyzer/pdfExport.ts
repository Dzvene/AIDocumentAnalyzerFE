import jsPDF from 'jspdf'

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

export const exportAnalysisToPDF = (result: AnalysisResult) => {
  const doc = new jsPDF()
  
  // Constants
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  const lineHeight = 7
  let yPosition = margin
  
  // Helper functions
  const addText = (text: string, fontSize = 12, isBold = false) => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2)
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin * 2) {
        doc.addPage()
        yPosition = margin
      }
      doc.text(line, margin, yPosition)
      yPosition += lineHeight
    })
  }
  
  const addSection = (title: string, content?: string | string[]) => {
    // Section title
    yPosition += 5
    addText(title, 14, true)
    yPosition += 3
    
    // Section content
    if (content) {
      if (Array.isArray(content)) {
        content.forEach(item => {
          doc.setFontSize(11)
          doc.setFont('helvetica', 'normal')
          const lines = doc.splitTextToSize(`• ${item}`, pageWidth - margin * 2 - 10)
          lines.forEach((line: string) => {
            if (yPosition > pageHeight - margin * 2) {
              doc.addPage()
              yPosition = margin
            }
            doc.text(line, margin + 5, yPosition)
            yPosition += lineHeight
          })
        })
      } else {
        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        const lines = doc.splitTextToSize(content, pageWidth - margin * 2)
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - margin * 2) {
            doc.addPage()
            yPosition = margin
          }
          doc.text(line, margin, yPosition)
          yPosition += lineHeight
        })
      }
    }
    yPosition += 5
  }
  
  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('AI Document Analysis Report', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 15
  
  // Document info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  
  const date = result.analysisDate || new Date()
  const dateStr = date.toLocaleDateString('ru-RU', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  doc.text(`Analysis Date: ${dateStr}`, margin, yPosition)
  yPosition += lineHeight
  
  if (result.fileName) {
    doc.text(`Document: ${result.fileName}`, margin, yPosition)
    yPosition += lineHeight
  }
  
  if (result.documentType) {
    doc.text(`Type: ${result.documentType}`, margin, yPosition)
    yPosition += lineHeight
  }
  
  if (result.pageCount) {
    doc.text(`Pages analyzed: ${result.pageCount}`, margin, yPosition)
    yPosition += lineHeight
  }
  
  if (result.pricing) {
    const priceStr = `Cost: €${result.pricing.total_price.toFixed(2)}`
    const discountStr = result.pricing.discount > 0 ? ` (${result.pricing.discount}% discount)` : ''
    doc.text(priceStr + discountStr, margin, yPosition)
    yPosition += lineHeight
  }
  
  doc.setTextColor(0)
  yPosition += 10
  
  // Add horizontal line
  doc.setDrawColor(200)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10
  
  // Summary
  if (result.summary) {
    addSection('Executive Summary', result.summary)
  }
  
  // Risks
  if (result.risks && result.risks.length > 0) {
    yPosition += 5
    addText('Identified Risks and Important Conditions', 14, true)
    yPosition += 5
    
    result.risks.forEach((risk, index) => {
      // Risk indicator based on level
      const indicator = risk.level === 'high' ? '⚠️ HIGH RISK' : 
                       risk.level === 'medium' ? '⚡ MEDIUM RISK' : 
                       'ℹ️ INFO'
      
      // Set color based on risk level
      if (risk.level === 'high') {
        doc.setTextColor(220, 53, 69) // Red
      } else if (risk.level === 'medium') {
        doc.setTextColor(255, 193, 7) // Yellow
      } else {
        doc.setTextColor(0, 123, 255) // Blue
      }
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      
      if (yPosition > pageHeight - margin * 2) {
        doc.addPage()
        yPosition = margin
      }
      
      doc.text(indicator, margin, yPosition)
      yPosition += lineHeight
      
      // Risk text
      doc.setTextColor(0)
      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(risk.text, pageWidth - margin * 2 - 10)
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin * 2) {
          doc.addPage()
          yPosition = margin
        }
        doc.text(line, margin + 5, yPosition)
        yPosition += lineHeight
      })
      
      yPosition += 3
    })
  }
  
  // Recommendations
  if (result.recommendations && result.recommendations.length > 0) {
    addSection('Recommendations', result.recommendations)
  }
  
  // Footer on last page
  const pageCount = doc.internal.pages.length - 1
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.setTextColor(150)
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
    doc.text(
      'Generated by AI Document Analyzer',
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    )
  }
  
  // Save the PDF
  const fileName = result.fileName ? 
    `analysis_${result.fileName.replace(/\.[^/.]+$/, '')}_${Date.now()}.pdf` :
    `document_analysis_${Date.now()}.pdf`
    
  doc.save(fileName)
}