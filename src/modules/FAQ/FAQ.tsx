import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp } from 'lucide-react'
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

interface FAQQuestion {
  id: string
  slug: string
  question: string
  answer: string
  category_id: string
  category_name: string
  is_featured?: boolean
}

export const FAQ: React.FC = () => {
  const { t, i18n } = useTranslation()
  
  const [categories, setCategories] = useState<FAQCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`faq__category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
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
                    className={`faq__item ${expandedQuestion === question.id ? 'is-expanded' : ''}`}
                  >
                    <button
                      className="faq__question"
                      onClick={() => toggleQuestion(question.id)}
                    >
                      <span className="faq__question-text">{question.question}</span>
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