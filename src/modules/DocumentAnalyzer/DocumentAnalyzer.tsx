import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '../../store/hooks'
import { exportAnalysisToPDF } from './pdfExport'
import { exportAnalysisToPDFWithUnicode } from './pdfExportWithFont'
import './DocumentAnalyzer.scss'
import ErrorNotification from '../../components/ErrorNotification/ErrorNotification'

// Расчет цены
const calculatePrice = (pages: number): { price: number; discount: number; tier: string } => {
  if (pages <= 10) {
    return { price: pages * 0.99, discount: 0, tier: 'standard' }
  } else if (pages <= 50) {
    return { price: pages * 0.79, discount: 20, tier: 'silver' }
  } else if (pages <= 100) {
    return { price: pages * 0.59, discount: 40, tier: 'gold' }
  } else {
    return { price: pages * 0.39, discount: 60, tier: 'platinum' }
  }
}

const DocumentAnalyzer: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { token, isAuthenticated } = useAppSelector((state) => state.auth)
  
  // Generate document types from translations
  const DOCUMENT_TYPES = useMemo(() => ({
    RENTAL: {
      id: 'rental',
      name: t('documentAnalyzer.documentTypes.rental'),
      icon: '🏠',
      checks: [
        { id: 'notice_period', label: t('documentAnalyzer.checks.rental.notice_period'), default: true },
        { id: 'penalties', label: t('documentAnalyzer.checks.rental.penalties'), default: true },
        { id: 'special_conditions', label: t('documentAnalyzer.checks.rental.special_conditions'), default: true },
        { id: 'termination', label: t('documentAnalyzer.checks.rental.termination'), default: true },
        { id: 'deposit', label: t('documentAnalyzer.checks.rental.deposit'), default: true },
        { id: 'rent_increase', label: t('documentAnalyzer.checks.rental.rent_increase'), default: false },
        { id: 'maintenance', label: t('documentAnalyzer.checks.rental.maintenance'), default: false },
      ]
    },
    INSURANCE: {
      id: 'insurance',
      name: t('documentAnalyzer.documentTypes.insurance'),
      icon: '🛡️',
      checks: [
        { id: 'exclusions', label: t('documentAnalyzer.checks.insurance.exclusions'), default: true },
        { id: 'deductible', label: t('documentAnalyzer.checks.insurance.deductible'), default: true },
        { id: 'limits', label: t('documentAnalyzer.checks.insurance.limits'), default: true },
        { id: 'claim_deadlines', label: t('documentAnalyzer.checks.insurance.claim_deadlines'), default: true },
        { id: 'cancellation', label: t('documentAnalyzer.checks.insurance.cancellation'), default: false },
        { id: 'premium_changes', label: t('documentAnalyzer.checks.insurance.premium_changes'), default: false },
        { id: 'waiting_period', label: t('documentAnalyzer.checks.insurance.waiting_period'), default: false },
      ]
    },
    EMPLOYMENT: {
      id: 'employment', 
      name: t('documentAnalyzer.documentTypes.employment'),
      icon: '💼',
      checks: [
        { id: 'probation', label: t('documentAnalyzer.checks.employment.probation'), default: true },
        { id: 'notice_termination', label: t('documentAnalyzer.checks.employment.notice_termination'), default: true },
        { id: 'non_compete', label: t('documentAnalyzer.checks.employment.non_compete'), default: true },
        { id: 'confidentiality', label: t('documentAnalyzer.checks.employment.confidentiality'), default: true },
        { id: 'overtime', label: t('documentAnalyzer.checks.employment.overtime'), default: false },
        { id: 'benefits', label: t('documentAnalyzer.checks.employment.benefits'), default: false },
        { id: 'intellectual_property', label: t('documentAnalyzer.checks.employment.intellectual_property'), default: false },
      ]
    },
    PURCHASE: {
      id: 'purchase',
      name: t('documentAnalyzer.documentTypes.purchase'),
      icon: '🛒',
      checks: [
        { id: 'warranties', label: t('documentAnalyzer.checks.purchase.warranties'), default: true },
        { id: 'return_policy', label: t('documentAnalyzer.checks.purchase.return_policy'), default: true },
        { id: 'hidden_fees', label: t('documentAnalyzer.checks.purchase.hidden_fees'), default: true },
        { id: 'delivery_terms', label: t('documentAnalyzer.checks.purchase.delivery_terms'), default: true },
        { id: 'payment_terms', label: t('documentAnalyzer.checks.purchase.payment_terms'), default: false },
        { id: 'ownership_transfer', label: t('documentAnalyzer.checks.purchase.ownership_transfer'), default: false },
      ]
    },
    LOAN: {
      id: 'loan',
      name: t('documentAnalyzer.documentTypes.loan'),
      icon: '💰',
      checks: [
        { id: 'interest_rate', label: t('documentAnalyzer.checks.loan.interest_rate'), default: true },
        { id: 'hidden_commissions', label: t('documentAnalyzer.checks.loan.hidden_commissions'), default: true },
        { id: 'early_repayment', label: t('documentAnalyzer.checks.loan.early_repayment'), default: true },
        { id: 'default_consequences', label: t('documentAnalyzer.checks.loan.default_consequences'), default: true },
        { id: 'collateral', label: t('documentAnalyzer.checks.loan.collateral'), default: false },
        { id: 'insurance_requirements', label: t('documentAnalyzer.checks.loan.insurance_requirements'), default: false },
      ]
    },
    CUSTOM: {
      id: 'custom',
      name: t('documentAnalyzer.documentTypes.custom'),
      icon: '📄',
      checks: []
    }
  }), [t])

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES.RENTAL)
  const [selectedChecks, setSelectedChecks] = useState<Set<string>>(
    new Set(documentType.checks.filter(c => c.default).map(c => c.id))
  )
  const [customPrompt, setCustomPrompt] = useState('')
  const [pageCount, setPageCount] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isCountingPages, setIsCountingPages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Remove authentication check - allow public access
  // Users can upload and analyze documents without login

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setSelectedFile(file)
      setIsCountingPages(true)
      
      // Get real page count from backend - no authentication required for counting pages
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        // No authentication required for page counting
        console.log('Sending file to backend for page count (no auth required)...')
        
        const response = await fetch('http://localhost:5055/api/analysis/count-pages', {
          method: 'POST',
          body: formData
        })
        
        console.log('Response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ REAL page count from backend:', data.page_count)
          console.log('Full backend response:', data)
          setPageCount(data.page_count)
        } else {
          const errorText = await response.text()
          console.error('❌ Backend error:', response.status, errorText)
          // Fallback to rough estimate if API fails
          const estimatedPages = Math.max(1, Math.ceil(file.size / 3000))
          console.log(`Using fallback estimate: ${estimatedPages} pages (file size: ${file.size} bytes)`)
          setPageCount(estimatedPages)
        }
      } catch (error) {
        console.error('❌ Network error counting pages:', error)
        // Fallback to rough estimate
        const estimatedPages = Math.ceil(file.size / 3000)
        console.log('Using fallback estimate:', estimatedPages)
        setPageCount(estimatedPages)
      } finally {
        setIsCountingPages(false)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  })

  const handleDocumentTypeChange = (type: typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES]) => {
    setDocumentType(type)
    setSelectedChecks(new Set(type.checks.filter(c => c.default).map(c => c.id)))
  }

  const toggleCheck = (checkId: string) => {
    const newChecks = new Set(selectedChecks)
    if (newChecks.has(checkId)) {
      newChecks.delete(checkId)
    } else {
      newChecks.add(checkId)
    }
    setSelectedChecks(newChecks)
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return
    
    // Check authentication before analysis
    if (!isAuthenticated) {
      setError(t('documentAnalyzer.errors.notAuthenticated') || 'Please login to analyze documents')
      setTimeout(() => navigate('/login'), 2000)
      return
    }
    
    setIsAnalyzing(true)
    
    // Prepare analysis request
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('documentType', documentType.id)
    formData.append('checks', JSON.stringify(Array.from(selectedChecks)))
    formData.append('customPrompt', customPrompt)
    
    try {
      // Use token from Redux store or localStorage as fallback  
      const authToken = token || localStorage.getItem('auth_token')
      
      if (!authToken) {
        setError(t('documentAnalyzer.errors.notAuthenticated') || 'Authentication required')
        setTimeout(() => navigate('/login'), 2000)
        return
      }
      
      // Call API
      const headers: any = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }
      
      const response = await fetch('http://localhost:5055/api/analysis/quick-analyze', {
        method: 'POST',
        headers,
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = errorData?.detail || `HTTP error! status: ${response.status}`
        
        if (response.status === 503) {
          setError(t('documentAnalyzer.errors.aiNotConfigured'))
        } else {
          setError(errorMessage || t('documentAnalyzer.errors.analysisError'))
        }
        
        throw new Error(errorMessage)
      }
      
      const result = await response.json()
      
      if (result.success && result.analysis) {
        // Format REAL risks from the analysis
        const risks = result.analysis.risks || []
        const formattedRisks = risks.map((risk: any) => ({
          level: risk.level,
          text: risk.text || risk.details
        }))
        
        setAnalysisResult({
          risks: formattedRisks.length > 0 ? formattedRisks : [
            { level: 'info', text: t('documentAnalyzer.results.noRisks') }
          ],
          summary: result.analysis.summary,
          pageCount: result.analysis.page_count,
          recommendations: result.analysis.recommendations,
          pricing: result.analysis.pricing,
          checked_items: result.analysis.checked_items,
          custom_analysis: result.analysis.custom_analysis,
          positive_points: result.analysis.positive_points,
          key_terms: result.analysis.key_terms
        })
      } else {
        // NO FALLBACK - NO MOCKS
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Analysis failed:', error)
      setError(t('documentAnalyzer.errors.generalError'))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const priceInfo = pageCount > 0 ? calculatePrice(pageCount) : null

  return (
    <div className="document-analyzer">
      <div className="analyzer-header">
        <h1>🔍 {t('documentAnalyzer.title')}</h1>
        <p>{t('documentAnalyzer.subtitle')}</p>
      </div>

      {!analysisResult ? (
        <div className="analyzer-workspace">
          {/* Upload Section */}
          <div className="upload-section">
            <div 
              {...getRootProps()} 
              className={`dropzone ${isDragActive ? 'active' : ''} ${selectedFile ? 'has-file' : ''}`}
            >
              <input {...getInputProps()} />
              {selectedFile ? (
                <div className="file-preview">
                  <span className="file-icon">📄</span>
                  <div className="file-info">
                    <p className="file-name">{selectedFile.name}</p>
                    <p className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p className="page-count">
                      {isCountingPages ? t('documentAnalyzer.upload.countingPages') : `${pageCount} ${t('documentAnalyzer.upload.pages')}`}
                    </p>
                  </div>
                  <button 
                    className="remove-file"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                      setPageCount(0)
                      setIsCountingPages(false)
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="dropzone-content">
                  <span className="upload-icon">⬆️</span>
                  <p>{t('documentAnalyzer.upload.dragDrop')}</p>
                  <p className="formats">{t('documentAnalyzer.upload.formats')}</p>
                </div>
              )}
            </div>

            {priceInfo && (
              <div className={`price-card tier-${priceInfo.tier}`}>
                <div className="price-header">
                  <span className="pages">{pageCount} {t('documentAnalyzer.pricing.pages')}</span>
                  {priceInfo.discount > 0 && (
                    <span className="discount-badge">-{priceInfo.discount}%</span>
                  )}
                </div>
                <div className="price-amount">
                  €{priceInfo.price.toFixed(2)}
                </div>
                <div className="price-details">
                  {priceInfo.tier === 'standard' && `📄 ${t('documentAnalyzer.pricing.tiers.standard')}`}
                  {priceInfo.tier === 'silver' && `📚 ${t('documentAnalyzer.pricing.tiers.silver')}`}
                  {priceInfo.tier === 'gold' && `📖 ${t('documentAnalyzer.pricing.tiers.gold')}`}
                  {priceInfo.tier === 'platinum' && `🏢 ${t('documentAnalyzer.pricing.tiers.platinum')}`}
                </div>
              </div>
            )}
          </div>

          {/* Configuration Section */}
          <div className="config-section">
            {/* Document Type Selection */}
            <div className="document-types">
              <h3>{t('documentAnalyzer.documentTypes.title')}</h3>
              <div className="type-grid">
                {Object.values(DOCUMENT_TYPES).map(type => (
                  <button
                    key={type.id}
                    className={`type-card ${documentType.id === type.id ? 'active' : ''}`}
                    onClick={() => handleDocumentTypeChange(type)}
                  >
                    <span className="type-icon">{type.icon}</span>
                    <span className="type-name">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Checks Selection */}
            {documentType.checks.length > 0 && (
              <div className="checks-section">
                <h3>{t('documentAnalyzer.checks.title')}</h3>
                <div className="checks-grid">
                  {documentType.checks.map(check => (
                    <label key={check.id} className="check-item">
                      <input
                        type="checkbox"
                        checked={selectedChecks.has(check.id)}
                        onChange={() => toggleCheck(check.id)}
                      />
                      <span className="check-label">{check.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Prompt */}
            <div className="custom-prompt">
              <h3>{t('documentAnalyzer.customPrompt.title')}</h3>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={t('documentAnalyzer.customPrompt.placeholder')}
                rows={3}
              />
            </div>

            {/* Analyze Button */}
            <button
              className={`analyze-button ${isAnalyzing ? 'analyzing' : ''} ${!isAuthenticated ? 'requires-auth' : ''}`}
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
              title={!isAuthenticated ? t('documentAnalyzer.buttons.loginRequired') || 'Login required for analysis' : ''}
            >
              {isAnalyzing ? (
                <>
                  <span className="spinner">⏳</span>
                  {t('documentAnalyzer.buttons.analyzing')}
                </>
              ) : !isAuthenticated ? (
                <>
                  <span>🔒</span>
                  {t('documentAnalyzer.buttons.loginToAnalyze') || 'Login to Analyze'}
                </>
              ) : (
                <>
                  <span>🔍</span>
                  {t('documentAnalyzer.buttons.startAnalysis')}
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="results-section">
          <div className="results-header">
            <h2>📊 {t('documentAnalyzer.results.title')}</h2>
            <div className="result-actions">
              <button 
                className="export-pdf"
                onClick={() => {
                  const documentTypeName = Object.values(DOCUMENT_TYPES)
                    .find(t => t.id === documentType.id)?.name || 'Document'
                  
                  // Use Unicode-compatible PDF export
                  exportAnalysisToPDFWithUnicode({
                    summary: analysisResult.summary,
                    risks: analysisResult.risks,
                    recommendations: analysisResult.recommendations,
                    pageCount: analysisResult.pageCount,
                    documentType: documentTypeName,
                    fileName: selectedFile?.name,
                    analysisDate: new Date(),
                    pricing: analysisResult.pricing
                  })
                }}
              >
                📥 {t('documentAnalyzer.buttons.exportPdf')}
              </button>
              <button 
                className="new-analysis"
                onClick={() => {
                  setAnalysisResult(null)
                  setSelectedFile(null)
                  setPageCount(0)
                }}
              >
                📄 {t('documentAnalyzer.buttons.newDocument')}
              </button>
            </div>
          </div>

          <div className="analysis-results">
            <div className="summary-card">
              <h3>📋 {t('documentAnalyzer.results.summary')}</h3>
              <p>{analysisResult.summary}</p>
            </div>

            {/* Checked Items Section - NEW */}
            {analysisResult.checked_items && Object.keys(analysisResult.checked_items).length > 0 && (
              <div className="checked-items-section">
                <h3>📝 {t('documentAnalyzer.results.checkedItems')}</h3>
                <div className="checked-items-grid">
                  {Object.entries(analysisResult.checked_items).map(([checkId, checkData]: [string, any]) => (
                    <div key={checkId} className={`check-item ${checkData.found ? 'found' : 'not-found'}`}>
                      <div className="check-header">
                        <span className="check-status">
                          {checkData.found ? '✅' : '❌'}
                        </span>
                        <span className="check-label">{checkData.label}</span>
                        {checkData.risk_level && checkData.risk_level !== 'none' && (
                          <span className={`risk-badge risk-${checkData.risk_level}`}>
                            {t(`documentAnalyzer.results.riskLevels.${checkData.risk_level}`)}
                          </span>
                        )}
                      </div>
                      <div className="check-details">
                        {checkData.found ? (
                          <>
                            <p className="check-text">{checkData.details}</p>
                            {checkData.quote && (
                              <blockquote className="check-quote">
                                "{checkData.quote}"
                              </blockquote>
                            )}
                            {checkData.recommendation && (
                              <div className="check-recommendation">
                                <strong>{t('documentAnalyzer.results.recommendation')}:</strong> {checkData.recommendation}
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="not-found-text">{t('documentAnalyzer.results.notFound')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Analysis Section - NEW */}
            {analysisResult.custom_analysis && (
              <div className="custom-analysis-section">
                <h3>❓ {t('documentAnalyzer.results.customAnalysis')}</h3>
                <div className="custom-question">
                  <strong>{t('documentAnalyzer.results.question')}:</strong> {analysisResult.custom_analysis.question}
                </div>
                <div className="custom-answer">
                  <p>{analysisResult.custom_analysis.answer}</p>
                  {analysisResult.custom_analysis.relevant_quotes && 
                   analysisResult.custom_analysis.relevant_quotes.length > 0 && (
                    <div className="relevant-quotes">
                      <strong>{t('documentAnalyzer.results.relevantQuotes')}:</strong>
                      {analysisResult.custom_analysis.relevant_quotes.map((quote: string, i: number) => (
                        <blockquote key={i}>"{quote}"</blockquote>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="risks-section">
              <h3>⚠️ {t('documentAnalyzer.results.risks')}</h3>
              {analysisResult.risks && analysisResult.risks.length > 0 ? (
                analysisResult.risks.map((risk: any, index: number) => (
                  <div key={index} className={`risk-item risk-${risk.level}`}>
                    <div className="risk-header">
                      <span className="risk-indicator">
                        {risk.level === 'high' ? '🔴' : risk.level === 'medium' ? '🟡' : '🔵'}
                      </span>
                      <span className="risk-level-label">
                        {t(`documentAnalyzer.results.riskLevels.${risk.level}`)}
                      </span>
                    </div>
                    <p className="risk-text">{risk.text}</p>
                    {risk.details && (
                      <div className="risk-details">
                        <strong>{t('documentAnalyzer.results.details')}:</strong> {risk.details}
                      </div>
                    )}
                    {risk.quote && (
                      <blockquote className="risk-quote">
                        <i>"{risk.quote}"</i>
                      </blockquote>
                    )}
                    {risk.section && (
                      <span className="risk-section">📍 {risk.section}</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-risks">{t('documentAnalyzer.results.noRisks')}</p>
              )}
            </div>

            {analysisResult.positive_points && analysisResult.positive_points.length > 0 && (
              <div className="positive-section">
                <h3>✅ {t('documentAnalyzer.results.positiveAspects')}</h3>
                <ul>
                  {analysisResult.positive_points.map((point: string, index: number) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <div className="recommendations-section">
                <h3>💡 {t('documentAnalyzer.results.recommendations')}</h3>
                <ul className="recommendations-list">
                  {analysisResult.recommendations.map((rec: string, index: number) => (
                    <li key={index}>
                      <span className="rec-number">{index + 1}.</span>
                      <span className="rec-text">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.key_terms && Object.keys(analysisResult.key_terms).length > 0 && (
              <div className="key-terms-section">
                <h3>📌 {t('documentAnalyzer.results.keyTerms')}</h3>
                <div className="key-terms-grid">
                  {Object.entries(analysisResult.key_terms).map(([key, value], index) => (
                    <div key={index} className="key-term-item">
                      <span className="term-key">{key}:</span>
                      <span className="term-value">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysisResult.pricing && (
              <div className="pricing-info">
                <h4>💰 {t('documentAnalyzer.results.pricingInfo')}</h4>
                <div className="pricing-details">
                  <span>{t('documentAnalyzer.results.pages')}: {analysisResult.page_count || analysisResult.pageCount}</span>
                  <span className="price-tag">€{analysisResult.pricing.total_price}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <ErrorNotification
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
    </div>
  )
}

export default DocumentAnalyzer