import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import './DocumentAnalyzerStepper.scss'
import { Button } from '@components/Button'

// Types
interface DocumentType {
  id: string
  name: string
  icon: string
}

interface UserRole {
  id: string
  name: string
  icon: string
}

interface CheckOption {
  id: string
  label: string
  checked: boolean
}

interface AnalysisState {
  file: File | null
  documentType: string
  userRole: string
  checkOptions: CheckOption[]
  additionalQuestions: string
  pageCount: number
  price: number
}

// Document types
const DOCUMENT_TYPES: DocumentType[] = [
  { id: 'auto', name: 'Auto detect document', icon: '🤖' },
  { id: 'rental', name: 'Rental agreement', icon: '🏠' },
  { id: 'insurance', name: 'Insurance policy', icon: '🛡️' },
  { id: 'loan', name: 'Loan agreement', icon: '💰' },
  { id: 'employment', name: 'Employment contract', icon: '💼' },
  { id: 'purchase', name: 'Purchase agreement', icon: '🛒' },
  { id: 'other', name: 'Other document', icon: '📄' }
]

// Check options for insurance documents
const INSURANCE_CHECKS: CheckOption[] = [
  { id: 'coverage_exclusions', label: 'Coverage exclusions', checked: false },
  { id: 'deductible', label: 'Deductible', checked: false },
  { id: 'payout_limits', label: 'Payout limits', checked: false },
  { id: 'claim_deadlines', label: 'Claim submission deadlines', checked: false },
  { id: 'cancellation', label: 'Cancellation conditions', checked: false },
  { id: 'premium_changes', label: 'Premium changes', checked: false },
  { id: 'waiting_period', label: 'Waiting period', checked: false }
]

// Calculate price
const calculatePrice = (pages: number): number => {
  return pages * 0.99 // $0.99 per page as shown in screenshot
}

const DocumentAnalyzerStepper: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    file: null,
    documentType: '',
    userRole: '',
    checkOptions: [...INSURANCE_CHECKS],
    additionalQuestions: '',
    pageCount: 0,
    price: 0
  })

  // File upload handling
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      
      // Simulate getting page count (in real app, this would be from backend)
      const pageCount = 8 // Mock value as shown in screenshot
      const price = calculatePrice(pageCount)
      
      setAnalysisState(prev => ({
        ...prev,
        file,
        pageCount,
        price
      }))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false
  })

  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }



  // Step 1: Upload document
  const renderUploadStep = () => (
    <div className="step-content upload-step">
      <div className="breadcrumb">AI Documents / Concept</div>
      
      {!analysisState.file ? (
        <>
          <div className="upload-area">
            <div className="upload-icon-circle">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 14V4M10 4L6 8M10 4L14 8" stroke="#181450" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h2>Upload your <span>document</span></h2>
            
            <p className="upload-formats">
              PDF, DOCX and JPG files are supported.
            </p>
            
            <div {...getRootProps()} className="upload-button-wrapper">
              <input {...getInputProps()} />
              <Button 
                variant="gradient"
                size="lg"
                fullWidth
                icon={
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 10V3M7 3L4 6M7 3L10 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
              >
                Upload document
              </Button>
            </div>
          </div>
          
          <div className="privacy-notice">
            <p>
              We prioritize your privacy. Your document is never stored on our servers — it exists only during the active session. Once the analysis is complete, both the file and its history are permanently deleted, ensuring your data remains fully private and secure.
            </p>
          </div>
          
          <div className="service-notice">
            <p>
              Our service is an AI, not a lawyer, and it can make mistakes. Consider having your document reviewed by a human lawyer.
            </p>
          </div>
        </>
      ) : (
        <div className="file-info">
          <div className="file-card">
            <div className="file-icon">📄</div>
            <div className="file-details">
              <div className="file-name">{analysisState.file.name}</div>
              <div className="file-size">{analysisState.pageCount} pages</div>
            </div>
          </div>
          
          <div className="price-card">
            <div className="price">${analysisState.price.toFixed(2)}</div>
            <div className="pages">{analysisState.pageCount} pages</div>
          </div>
          
          <div className="bottom-navigation">
            <div className="nav-buttons">
              <Button 
                onClick={goToNextStep} 
                variant="gradient"
                size="lg"
                fullWidth
              >
                Continue request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Step 2: Select document type
  const renderDocumentTypeStep = () => (
    <div className="step-content document-type-step">
      <div className="breadcrumb">AI Documents / Select document / ...</div>
      <h2>Select document type:</h2>
      <p className="step-description">
        We'll now analyze your insurance terms for hidden risks, unfair clauses, 
        and areas you should know about.
      </p>
      
      <div className="types-grid">
        {DOCUMENT_TYPES.map((type) => (
          <div
            key={type.id}
            className={`type-card ${analysisState.documentType === type.id ? 'selected' : ''}`}
            onClick={() => {
              setAnalysisState(prev => ({ ...prev, documentType: type.id }))
              setTimeout(goToNextStep, 300)
            }}
          >
            <div className="type-icon">{type.icon}</div>
            <div className="type-name">{type.name}</div>
          </div>
        ))}
      </div>
      
      <div className="privacy-notice">
        <p>
          We prioritize your privacy. Your document is never stored on our servers — 
          it exists only during the active session. Once the analysis is complete, 
          both the file and its history are permanently deleted, ensuring your sensitive data remains fully private and secure.
        </p>
      </div>
      
      <div className="bottom-navigation">
        <div className="nav-buttons">
          <Button 
            onClick={goToPreviousStep} 
            variant="secondary"
            size="lg"
          >
            ←
          </Button>
        </div>
      </div>
    </div>
  )

  // Step 3: Select role
  const renderRoleStep = () => (
    <div className="step-content role-step">
      <div className="breadcrumb">AI Documents / Set role</div>
      <h2>Select your role:</h2>
      <p className="step-description">
        This helps us tailor the analysis to your specific needs and highlight the most relevant items to your situation.
      </p>
      
      <div className="role-cards">
        <div 
          className={`role-card ${analysisState.userRole === 'insured' ? 'selected' : ''}`}
          onClick={() => {
            setAnalysisState(prev => ({ ...prev, userRole: 'insured' }))
            setTimeout(goToNextStep, 300)
          }}
        >
          <div className="role-icon">👤</div>
          <div className="role-text">I am the insured / policyholder</div>
          <div className={`check-mark ${analysisState.userRole === 'insured' ? 'visible' : ''}`}>
            ✓
          </div>
        </div>
        
        <div 
          className={`role-card ${analysisState.userRole === 'company' ? 'selected' : ''}`}
          onClick={() => {
            setAnalysisState(prev => ({ ...prev, userRole: 'company' }))
            setTimeout(goToNextStep, 300)
          }}
        >
          <div className="role-icon">🏢</div>
          <div className="role-text">I represent the insurance company</div>
          <div className={`check-mark ${analysisState.userRole === 'company' ? 'visible' : ''}`}>
            ✓
          </div>
        </div>
      </div>
      
      <div className="bottom-navigation">
        <div className="nav-buttons">
          <Button 
            onClick={goToPreviousStep} 
            variant="secondary"
            size="lg"
          >
            ←
          </Button>
        </div>
      </div>
    </div>
  )

  // Step 4: Select check options
  const renderCheckOptionsStep = () => (
    <div className="step-content check-options-step">
      <div className="breadcrumb">AI Documents / Set role / Set</div>
      <h2>What needs your closest attention?</h2>
      <p className="step-description">
        Pick the areas you're most concerned about. We'll dive deeper into these sections for you.
      </p>
      
      <div className="check-list">
        {analysisState.checkOptions.map((option) => (
          <div key={option.id} className="check-item">
            <input
              type="checkbox"
              id={option.id}
              checked={option.checked}
              onChange={() => {
                setAnalysisState(prev => ({
                  ...prev,
                  checkOptions: prev.checkOptions.map(opt =>
                    opt.id === option.id ? { ...opt, checked: !opt.checked } : opt
                  )
                }))
              }}
            />
            <label htmlFor={option.id}>{option.label}</label>
          </div>
        ))}
      </div>
      
      <div className="additional-field">
        <label>Additional questions (optional):</label>
        <textarea
          placeholder="Ask specific questions about your document"
          value={analysisState.additionalQuestions}
          onChange={(e) => setAnalysisState(prev => ({
            ...prev,
            additionalQuestions: e.target.value
          }))}
        />
      </div>
      
      <div className="bottom-navigation">
        <div className="nav-buttons">
          <Button 
            onClick={goToPreviousStep} 
            variant="secondary"
            size="lg"
          >
            ←
          </Button>
          <Button
            onClick={() => {
              setIsAnalyzing(true)
              setTimeout(() => {
                setIsAnalyzing(false)
                goToNextStep()
              }, 2000)
            }}
            disabled={isAnalyzing}
            loading={isAnalyzing}
            variant="gradient"
            size="lg"
            fullWidth
          >
            Continue
          </Button>
        </div>
      </div>
      
      <div className="footer-logo">
        <div className="logo">Clear Contract</div>
      </div>
    </div>
  )

  // Step 5: Results
  const renderResultStep = () => (
    <div className="step-content result-step">
      <div className="breadcrumb">AI Documents / Analysis results</div>
      
      <div className="result-header">
        <div className="success-icon">✅</div>
        <h3>Analysis Complete</h3>
        <p>We've analyzed your insurance policy</p>
      </div>
      
      <div className="result-sections">
        <div className="section">
          <h4>Key Findings</h4>
          <div className="section-content">
            <ul>
              <li>No major red flags detected</li>
              <li>Standard insurance terms found</li>
              <li>Coverage appears comprehensive</li>
            </ul>
          </div>
        </div>
        
        <div className="section">
          <h4>Areas to Review</h4>
          <div className="section-content">
            <ul>
              {analysisState.checkOptions
                .filter(opt => opt.checked)
                .map(opt => (
                  <li key={opt.id}>{opt.label}: Review recommended</li>
                ))}
            </ul>
          </div>
        </div>
        
        <div className="section">
          <h4>Recommendations</h4>
          <div className="section-content">
            <ul>
              <li>Consider reviewing deductibles</li>
              <li>Check claim submission deadlines</li>
              <li>Understand cancellation terms</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bottom-navigation">
        <div className="nav-buttons">
          <Button 
            variant="secondary" 
            size="lg"
            fullWidth
          >
            Download Report
          </Button>
          <Button
            onClick={() => {
              // Reset and start over
              setCurrentStep(1)
              setAnalysisState({
                file: null,
                documentType: '',
                userRole: '',
                checkOptions: [...INSURANCE_CHECKS],
                additionalQuestions: '',
                pageCount: 0,
                price: 0
              })
            }}
            variant="gradient"
            size="lg"
            fullWidth
          >
            New Analysis
          </Button>
        </div>
      </div>
      
      <div className="footer-logo">
        <div className="logo">Clear Contract</div>
      </div>
    </div>
  )

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderUploadStep()
      case 2:
        return renderDocumentTypeStep()
      case 3:
        return renderRoleStep()
      case 4:
        return renderCheckOptionsStep()
      case 5:
        return renderResultStep()
      default:
        return null
    }
  }

  return (
    <div className="document-analyzer-stepper">
      <div className="analyzer-container">
        {renderCurrentStep()}
      </div>
    </div>
  )
}

export default DocumentAnalyzerStepper
