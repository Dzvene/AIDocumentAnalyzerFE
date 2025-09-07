import axios from 'axios'

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
 * Export analysis to PDF using server-side generation for perfect Unicode support
 */
export const exportAnalysisToPDFServer = async (result: AnalysisResult) => {
  try {
    // Prepare data for server
    const requestData = {
      summary: result.summary || '',
      risks: result.risks || [],
      recommendations: result.recommendations || [],
      page_count: result.pageCount || 0,
      document_type: result.documentType || 'Document',
      pricing: result.pricing ? {
        total_price: result.pricing.total_price,
        discount: result.pricing.discount,
        tier: result.pricing.tier
      } : null
    }
    
    // Get API URL from environment or use default
    const apiUrl = process.env.REACT_APP_API_URL || 'http://api.clearcontract.io'
    
    // Request PDF from server
    const response = await axios.post(
      `${apiUrl}/api/analysis/export-pdf`,
      requestData,
      {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf'
        }
      }
    )
    
    // Create blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    const fileName = result.fileName ? 
      `analysis_${result.fileName.replace(/\.[^/.]+$/, '')}_${Date.now()}.pdf` :
      `document_analysis_${Date.now()}.pdf`
    
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export PDF:', error)
    // Fallback to client-side export
    await exportAnalysisToPDFClientFallback(result)
  }
}

/**
 * Fallback client-side PDF generation when server is unavailable
 */
async function exportAnalysisToPDFClientFallback(result: AnalysisResult) {
  // Dynamic import to avoid loading if not needed
  const { exportAnalysisToPDFWithUnicode } = await import('./pdfExportWithFont')
  await exportAnalysisToPDFWithUnicode(result)
}