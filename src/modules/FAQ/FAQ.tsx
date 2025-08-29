import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from 'lucide-react'
import { LoadingSpinner } from '@components/LoadingSpinner'
import './FAQ.scss'

interface FAQCategory {
  id: string
  slug: string
  name: string
  description?: string
  icon?: string
  questions: FAQQuestion[]
}

interface RelatedQuestion {
  id: string
  question: string
}

interface FAQQuestion {
  id: string
  slug: string
  question: string
  answer: string
  category_id: string
  category_name: string
  is_featured?: boolean
  helpful_count?: number
  not_helpful_count?: number
  related_questions?: RelatedQuestion[]
}

interface FeedbackState {
  [questionId: string]: 'helpful' | 'not_helpful' | null
}

export const FAQ: React.FC = () => {
  const { t, i18n } = useTranslation()
  
  const [categories, setCategories] = useState<FAQCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({})
  const [submittingFeedback, setSubmittingFeedback] = useState<string | null>(null)

  // Fetch FAQ data
  const fetchFAQData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/faq/categories?language=${i18n.language}`)
      if (!response.ok) throw new Error('Failed to fetch FAQ data')
      
      const data = await response.json()
      setCategories(data)
      
      // Select first category by default
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].id)
      }
    } catch (err: any) {
      setError(err.message || t('faq.loadError'))
    } finally {
      setLoading(false)
    }
  }, [i18n.language, t, selectedCategory])

  useEffect(() => {
    fetchFAQData()
  }, [fetchFAQData])

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId)
  }

  const getCurrentCategoryQuestions = () => {
    const category = categories.find(cat => cat.id === selectedCategory)
    return category?.questions || []
  }

  // Navigate to related question
  const navigateToRelatedQuestion = (questionId: string) => {
    // Find the question in all categories
    for (const category of categories) {
      const question = category.questions.find(q => q.id === questionId)
      if (question) {
        setSelectedCategory(category.id)
        setExpandedQuestion(questionId)
        // Scroll to the question
        setTimeout(() => {
          const element = document.getElementById(`faq-question-${questionId}`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)
        break
      }
    }
  }

  // Load feedback state from localStorage
  useEffect(() => {
    const savedFeedback = localStorage.getItem('faq_feedback')
    if (savedFeedback) {
      try {
        setFeedbackState(JSON.parse(savedFeedback))
      } catch (e) {
        console.error('Failed to load feedback state:', e)
      }
    }
  }, [])

  // Submit feedback for a question
  const submitFeedback = async (questionId: string, isHelpful: boolean) => {
    // Check if already submitted
    if (feedbackState[questionId]) {
      return
    }

    setSubmittingFeedback(questionId)
    
    try {
      const response = await fetch(`/api/faq/questions/${questionId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: questionId,
          is_helpful: isHelpful,
          session_id: sessionStorage.getItem('session_id') || generateSessionId()
        })
      })

      if (response.ok) {
        // Update local state
        const newFeedbackState = {
          ...feedbackState,
          [questionId]: isHelpful ? 'helpful' : 'not_helpful'
        }
        setFeedbackState(newFeedbackState)
        
        // Save to localStorage
        localStorage.setItem('faq_feedback', JSON.stringify(newFeedbackState))
        
        // Update question counts locally
        setCategories(prevCategories => 
          prevCategories.map(cat => ({
            ...cat,
            questions: cat.questions.map(q => {
              if (q.id === questionId) {
                return {
                  ...q,
                  helpful_count: (q.helpful_count || 0) + (isHelpful ? 1 : 0),
                  not_helpful_count: (q.not_helpful_count || 0) + (!isHelpful ? 1 : 0)
                }
              }
              return q
            })
          }))
        )
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setSubmittingFeedback(null)
    }
  }

  // Generate session ID if not exists
  const generateSessionId = () => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('session_id', sessionId)
    return sessionId
  }

  if (loading) {
    return (
      <div className="faq-loading">
        <LoadingSpinner />
        <p>{t('faq.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="faq-error">
        <p>{error}</p>
        <button onClick={fetchFAQData}>{t('common.tryAgain')}</button>
      </div>
    )
  }

  const questions = getCurrentCategoryQuestions()

  return (
    <div className="faq">
      <div className="faq__container">
        {/* Header */}
        <div className="faq__header">
          <h1>{t('faq.title') || 'Frequently Asked Questions'}</h1>
        </div>

        {/* Main Content */}
        <div className="faq__content">
          {/* Left Sidebar - Categories */}
          <div className="faq__sidebar">
            <div className="faq__categories">
              {categories.map(category => {
                const questionsCount = category.questions?.length || 0
                return (
                  <button
                    key={category.id}
                    className={`faq__category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <span className="faq__category-name">{category.name}</span>
                    <span className="faq__category-count">{questionsCount}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Content - Questions */}
          <div className="faq__main">
            {questions.length === 0 ? (
              <div className="faq__empty">
                <p>{t('faq.noQuestions') || 'No questions in this category'}</p>
              </div>
            ) : (
              <div className="faq__questions">
                {questions.map(question => (
                  <div 
                    key={question.id} 
                    id={`faq-question-${question.id}`}
                    className={`faq__item ${expandedQuestion === question.id ? 'is-expanded' : ''} ${question.is_featured ? 'is-featured' : ''}`}
                  >
                    <button
                      className="faq__question"
                      onClick={() => toggleQuestion(question.id)}
                    >
                      <span className="faq__question-text">
                        {question.is_featured && <span className="faq__featured-badge">⭐</span>}
                        {question.question}
                      </span>
                      <span className="faq__question-icon">
                        {expandedQuestion === question.id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </span>
                    </button>
                    {expandedQuestion === question.id && (
                      <div className="faq__answer">
                        <div className="faq__answer-content">
                          {question.answer.split('\n').map((paragraph, idx) => (
                            paragraph.trim() && <p key={idx}>{paragraph}</p>
                          ))}
                        </div>
                        <div className="faq__feedback">
                          <span className="faq__feedback-label">
                            {t('faq.wasHelpful') || 'Was this answer helpful?'}
                          </span>
                          <div className="faq__feedback-buttons">
                            <button
                              className={`faq__feedback-btn faq__feedback-btn--helpful ${
                                feedbackState[question.id] === 'helpful' ? 'active' : ''
                              }`}
                              onClick={() => submitFeedback(question.id, true)}
                              disabled={!!feedbackState[question.id] || submittingFeedback === question.id}
                              title={t('faq.helpful') || 'Helpful'}
                            >
                              <ThumbsUp size={16} />
                              <span>{question.helpful_count || 0}</span>
                            </button>
                            <button
                              className={`faq__feedback-btn faq__feedback-btn--not-helpful ${
                                feedbackState[question.id] === 'not_helpful' ? 'active' : ''
                              }`}
                              onClick={() => submitFeedback(question.id, false)}
                              disabled={!!feedbackState[question.id] || submittingFeedback === question.id}
                              title={t('faq.notHelpful') || 'Not helpful'}
                            >
                              <ThumbsDown size={16} />
                              <span>{question.not_helpful_count || 0}</span>
                            </button>
                          </div>
                          {feedbackState[question.id] && (
                            <span className="faq__feedback-thanks">
                              {t('faq.thanksFeedback') || 'Thank you for your feedback!'}
                            </span>
                          )}
                        </div>
                        {question.related_questions && question.related_questions.length > 0 && (
                          <div className="faq__related">
                            <h4 className="faq__related-title">
                              {t('faq.relatedQuestions') || 'Related Questions'}
                            </h4>
                            <div className="faq__related-list">
                              {question.related_questions.map(related => (
                                <button
                                  key={related.id}
                                  className="faq__related-item"
                                  onClick={() => navigateToRelatedQuestion(related.id)}
                                >
                                  {related.question}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQ