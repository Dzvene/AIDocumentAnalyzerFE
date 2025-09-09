import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '../../store/hooks'
import { exportAnalysisToPDF } from './pdfExport'
import { exportAnalysisToPDFWithUnicode } from './pdfExportWithFont'
import './DocumentAnalyzer.scss'
import ErrorNotification from '../../components/ErrorNotification/ErrorNotification'

// Calculate price
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
  const { t, i18n } = useTranslation()
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
  const [signerRole, setSignerRole] = useState<'employer' | 'employee'>('employee')
  const [customPrompt, setCustomPrompt] = useState('')
  const [pageCount, setPageCount] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isCountingPages, setIsCountingPages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setSelectedFile(file)
      setIsCountingPages(true)
      
      // Get real page count from backend
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        const apiUrl = process.env.REACT_APP_API_URL || 'http://api.clearcontract.io'
        const response = await fetch(`${apiUrl}/api/analysis/count-pages`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        })
        
        if (response.ok) {
          const data = await response.json()
          setPageCount(data.page_count)
        } else {
          // Fallback to rough estimate
          const estimatedPages = Math.max(1, Math.ceil(file.size / 3000))
          setPageCount(estimatedPages)
        }
      } catch (error) {
        // Fallback to rough estimate
        const estimatedPages = Math.ceil(file.size / 3000)
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
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    noClick: true
  })

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onDrop([files[0]])
    }
  }

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
    formData.append('signerRole', signerRole)
    formData.append('customPrompt', customPrompt)
    
    try {
      const authToken = token || localStorage.getItem('auth_token')
      
      if (!authToken) {
        setError(t('documentAnalyzer.errors.notAuthenticated') || 'Authentication required')
        setTimeout(() => navigate('/login'), 2000)
        return
      }
      
      const headers: any = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://api.clearcontract.io'
      const response = await fetch(`${apiUrl}/api/analysis/quick-analyze`, {
        method: 'POST',
        headers,
        credentials: 'include',
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

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="document-analyzer">
      {/* Header */}
      <header className="analyzer-header-bar">
        <div className="analyzer-header-content">
          <div className="analyzer-logo">Authorize</div>
          <div className="analyzer-header-right">
            <button 
              className={`lang-btn ${i18n.language === 'de' ? 'active' : ''}`}
              onClick={() => changeLanguage('de')}
            >
              DE
            </button>
            <button className="menu-btn">☰</button>
          </div>
        </div>
      </header>

      {!analysisResult ? (
        <>
          {!selectedFile ? (
            // Initial upload screen - exactly as in design
            <div className="upload-container">
              <div className="upload-icon-wrapper">
                <svg className="upload-icon" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="20" stroke="#6B46C1" strokeWidth="2" strokeDasharray="4 4"/>
                  <path d="M24 16L24 32M24 16L20 20M24 16L28 20" stroke="#6B46C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <h1 className="upload-title">Upload your document</h1>
              <p className="upload-subtitle">PDF and DOCX files are supported.</p>
              
              <div {...getRootProps()} className="dropzone-wrapper">
                <input {...getInputProps()} />
                <label htmlFor="file-upload" className="upload-button">
                  Upload file
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                />
              </div>

              <div className="privacy-notice">
                <p className="privacy-text">
                  We prioritize your privacy. Your document is never stored on our servers — it exists only during the active session. Once the analysis is complete, both the file and its history are permanently deleted, ensuring your data remains fully private and secure.
                </p>
              </div>

              <div className="ai-service-info">
                <p className="ai-info-text">
                  Our service is an AI, not a lawyer, and it can make mistakes. Always consult with a legal professional for critical decisions. The analysis is AI-powered by OpenAI and Claude.
                </p>
              </div>
            </div>
          ) : (
            // File uploaded - show configuration
            <div className="analyzer-workspace">
              <div className="upload-section">
                <div className="file-info-card">
                  <div className="file-icon">📄</div>
                  <div className="file-details">
                    <p className="file-name">{selectedFile.name}</p>
                    <p className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p className="page-count">
                      {isCountingPages ? 'Counting pages...' : `${pageCount} pages`}
                    </p>
                  </div>
                  <button 
                    className="remove-file"
                    onClick={() => {
                      setSelectedFile(null)
                      setPageCount(0)
                    }}
                  >
                    ✕
                  </button>
                </div>

                {priceInfo && (
                  <div className={`price-card tier-${priceInfo.tier}`}>
                    <div className="price-header">
                      <span className="pages">{pageCount} pages</span>
                      {priceInfo.discount > 0 && (
                        <span className="discount-badge">-{priceInfo.discount}%</span>
                      )}
                    </div>
                    <div className="price-amount">
                      {priceInfo.price.toFixed(2)}€
                    </div>
                  </div>
                )}
              </div>

              <div className="config-section">
                {/* Signer Role Selection */}
                <div className="signer-role-section">
                  <h3>Your role in the document</h3>
                  <div className="role-options">
                    <label className={`role-option ${signerRole === 'employer' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="signerRole"
                        value="employer"
                        checked={signerRole === 'employer'}
                        onChange={(e) => setSignerRole(e.target.value as 'employer' | 'employee')}
                      />
                      <span className="role-icon">👔</span>
                      <span className="role-label">Employer</span>
                    </label>
                    <label className={`role-option ${signerRole === 'employee' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="signerRole"
                        value="employee"
                        checked={signerRole === 'employee'}
                        onChange={(e) => setSignerRole(e.target.value as 'employer' | 'employee')}
                      />
                      <span className="role-icon">👤</span>
                      <span className="role-label">Employee</span>
                    </label>
                  </div>
                  <p className="role-description">
                    Select your perspective to get tailored analysis focusing on your interests and potential risks.
                  </p>
                </div>

                {/* Document Type Selection */}
                <div className="document-types">
                  <h3>Select document type</h3>
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
                    <h3>What to check</h3>
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
                  <h3>Additional questions (optional)</h3>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Ask specific questions about your document..."
                    rows={3}
                  />
                </div>

                {/* Analyze Button */}
                <button
                  className={`analyze-button ${isAnalyzing ? 'analyzing' : ''}`}
                  onClick={handleAnalyze}
                  disabled={!selectedFile || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <span className="spinner">⏳</span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      Analyze Document
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        // Results section
        <div className="results-section">
          <div className="results-header">
            <h2>📊 Analysis Results</h2>
            <div className="result-actions">
              <button 
                className="export-pdf"
                onClick={() => {
                  exportAnalysisToPDFWithUnicode({
                    summary: analysisResult.summary,
                    risks: analysisResult.risks,
                    recommendations: analysisResult.recommendations,
                    pageCount: analysisResult.pageCount,
                    documentType: documentType.name,
                    fileName: selectedFile?.name,
                    analysisDate: new Date(),
                    pricing: analysisResult.pricing
                  })
                }}
              >
                📥 Export PDF
              </button>
              <button 
                className="new-analysis"
                onClick={() => {
                  setAnalysisResult(null)
                  setSelectedFile(null)
                  setPageCount(0)
                }}
              >
                📄 New Document
              </button>
            </div>
          </div>

          <div className="analysis-results">
            <div className="summary-card">
              <h3>📋 Summary</h3>
              <p>{analysisResult.summary}</p>
            </div>

            {analysisResult.risks && analysisResult.risks.length > 0 && (
              <div className="risks-section">
                <h3>⚠️ Risks</h3>
                {analysisResult.risks.map((risk: any, index: number) => (
                  <div key={index} className={`risk-item risk-${risk.level}`}>
                    <div className="risk-header">
                      <span className="risk-indicator">
                        {risk.level === 'high' ? '🔴' : risk.level === 'medium' ? '🟡' : '🔵'}
                      </span>
                      <span className="risk-level-label">{risk.level}</span>
                    </div>
                    <p className="risk-text">{risk.text}</p>
                  </div>
                ))}
              </div>
            )}

            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <div className="recommendations-section">
                <h3>💡 Recommendations</h3>
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