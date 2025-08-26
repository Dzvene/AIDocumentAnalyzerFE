import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { exportAnalysisToPDF } from './pdfExport'
import './DocumentAnalyzer.scss'
import ErrorNotification from '../../components/ErrorNotification/ErrorNotification'

// Типы документов с предустановленными проверками
const DOCUMENT_TYPES = {
  RENTAL: {
    id: 'rental',
    name: 'Договор аренды',
    icon: '🏠',
    checks: [
      { id: 'notice_period', label: 'Сроки уведомления', default: true },
      { id: 'penalties', label: 'Штрафы и пени', default: true },
      { id: 'special_conditions', label: 'Особые условия', default: true },
      { id: 'termination', label: 'Условия расторжения', default: true },
      { id: 'deposit', label: 'Депозит и его возврат', default: true },
      { id: 'rent_increase', label: 'Повышение арендной платы', default: false },
      { id: 'maintenance', label: 'Обязанности по ремонту', default: false },
    ]
  },
  INSURANCE: {
    id: 'insurance',
    name: 'Страховой полис',
    icon: '🛡️',
    checks: [
      { id: 'exclusions', label: 'Исключения из покрытия', default: true },
      { id: 'deductible', label: 'Франшиза', default: true },
      { id: 'limits', label: 'Лимиты выплат', default: true },
      { id: 'claim_deadlines', label: 'Сроки подачи заявлений', default: true },
      { id: 'cancellation', label: 'Условия отмены', default: false },
      { id: 'premium_changes', label: 'Изменение премий', default: false },
      { id: 'waiting_period', label: 'Период ожидания', default: false },
    ]
  },
  EMPLOYMENT: {
    id: 'employment', 
    name: 'Трудовой договор',
    icon: '💼',
    checks: [
      { id: 'probation', label: 'Испытательный срок', default: true },
      { id: 'notice_termination', label: 'Сроки увольнения', default: true },
      { id: 'non_compete', label: 'Запрет на конкуренцию', default: true },
      { id: 'confidentiality', label: 'Конфиденциальность', default: true },
      { id: 'overtime', label: 'Сверхурочная работа', default: false },
      { id: 'benefits', label: 'Льготы и компенсации', default: false },
      { id: 'intellectual_property', label: 'Интеллектуальная собственность', default: false },
    ]
  },
  PURCHASE: {
    id: 'purchase',
    name: 'Договор купли-продажи',
    icon: '🛒',
    checks: [
      { id: 'warranties', label: 'Гарантии и заверения', default: true },
      { id: 'return_policy', label: 'Условия возврата', default: true },
      { id: 'hidden_fees', label: 'Скрытые платежи', default: true },
      { id: 'delivery_terms', label: 'Условия доставки', default: true },
      { id: 'payment_terms', label: 'Условия оплаты', default: false },
      { id: 'ownership_transfer', label: 'Переход права собственности', default: false },
    ]
  },
  LOAN: {
    id: 'loan',
    name: 'Кредитный договор',
    icon: '💰',
    checks: [
      { id: 'interest_rate', label: 'Процентная ставка и её изменения', default: true },
      { id: 'hidden_commissions', label: 'Скрытые комиссии', default: true },
      { id: 'early_repayment', label: 'Досрочное погашение', default: true },
      { id: 'default_consequences', label: 'Последствия просрочки', default: true },
      { id: 'collateral', label: 'Обеспечение и залог', default: false },
      { id: 'insurance_requirements', label: 'Требования по страхованию', default: false },
    ]
  },
  CUSTOM: {
    id: 'custom',
    name: 'Другой документ',
    icon: '📄',
    checks: []
  }
}

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
  const { token, isAuthenticated } = useAppSelector((state) => state.auth)
  
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
  
  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated && !token) {
      navigate('/login')
    }
  }, [isAuthenticated, token, navigate])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setSelectedFile(file)
      setIsCountingPages(true)
      
      // Get real page count from backend
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        // Use token from Redux store or localStorage as fallback
        const authToken = token || localStorage.getItem('auth_token')
        
        if (!authToken) {
          console.error('No auth token! User should be logged in')
          // Redirect to login
          navigate('/login')
          return
        }
        
        console.log('Sending file to backend for page count...')
        const response = await fetch('http://localhost:5055/api/analysis/count-pages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
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
  }, [token, navigate])

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
        setError('Вы не авторизованы. Пожалуйста, войдите в систему.')
        setTimeout(() => navigate('/login'), 2000)
        return
      }
      
      // Call API
      const response = await fetch('http://localhost:5055/api/analysis/quick-analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = errorData?.detail || `HTTP error! status: ${response.status}`
        
        if (response.status === 503) {
          setError('AI сервис не настроен. Проверьте настройки сервера.')
        } else {
          setError(errorMessage || 'Ошибка при анализе документа')
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
            { level: 'info', text: 'Анализ завершен. Критических рисков не обнаружено.' }
          ],
          summary: result.analysis.summary,
          pageCount: result.analysis.page_count,
          recommendations: result.analysis.recommendations,
          pricing: result.analysis.pricing
        })
      } else {
        // NO FALLBACK - NO MOCKS
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Analysis failed:', error)
      setError('Произошла ошибка при анализе. Попробуйте еще раз.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const priceInfo = pageCount > 0 ? calculatePrice(pageCount) : null

  return (
    <div className="document-analyzer">
      <div className="analyzer-header">
        <h1>🔍 Анализ документов с AI</h1>
        <p>Загрузите документ и мы найдем все подводные камни и важные условия</p>
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
                      {isCountingPages ? 'Подсчет страниц...' : `${pageCount} страниц`}
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
                  <p>Перетащите документ сюда или нажмите для выбора</p>
                  <p className="formats">PDF, DOC, DOCX • Макс. 50MB</p>
                </div>
              )}
            </div>

            {priceInfo && (
              <div className={`price-card tier-${priceInfo.tier}`}>
                <div className="price-header">
                  <span className="pages">{pageCount} страниц</span>
                  {priceInfo.discount > 0 && (
                    <span className="discount-badge">-{priceInfo.discount}%</span>
                  )}
                </div>
                <div className="price-amount">
                  €{priceInfo.price.toFixed(2)}
                </div>
                <div className="price-details">
                  {priceInfo.tier === 'standard' && '📄 До 10 страниц: €0.99/стр'}
                  {priceInfo.tier === 'silver' && '📚 11-50 страниц: €0.79/стр'}
                  {priceInfo.tier === 'gold' && '📖 51-100 страниц: €0.59/стр'}
                  {priceInfo.tier === 'platinum' && '🏢 100+ страниц: €0.39/стр'}
                </div>
              </div>
            )}
          </div>

          {/* Configuration Section */}
          <div className="config-section">
            {/* Document Type Selection */}
            <div className="document-types">
              <h3>Тип документа</h3>
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
                <h3>Что проверить?</h3>
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
              <h3>Дополнительные вопросы</h3>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Например: Проверить условия о конфиденциальности, найти упоминания о третьих лицах..."
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
                  Анализируем документ...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  Начать анализ
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="results-section">
          <div className="results-header">
            <h2>📊 Результаты анализа</h2>
            <div className="result-actions">
              <button 
                className="export-pdf"
                onClick={() => {
                  const documentTypeName = Object.values(DOCUMENT_TYPES)
                    .find(t => t.id === documentType.id)?.name || 'Документ'
                  
                  exportAnalysisToPDF({
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
                📥 Скачать PDF отчет
              </button>
              <button 
                className="new-analysis"
                onClick={() => {
                  setAnalysisResult(null)
                  setSelectedFile(null)
                  setPageCount(0)
                }}
              >
                📄 Новый документ
              </button>
            </div>
          </div>

          <div className="analysis-results">
            <div className="summary-card">
              <h3>Краткое резюме</h3>
              <p>{analysisResult.summary}</p>
            </div>

            <div className="risks-section">
              <h3>Обнаруженные риски и важные условия</h3>
              {analysisResult.risks.map((risk: any, index: number) => (
                <div key={index} className={`risk-item risk-${risk.level}`}>
                  <span className="risk-indicator">
                    {risk.level === 'high' ? '⚠️' : risk.level === 'medium' ? '⚡' : 'ℹ️'}
                  </span>
                  <p>{risk.text}</p>
                </div>
              ))}
            </div>
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