import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
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
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
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
    } catch (err: any) {
      setError(err.message || t('faq.loadError'))
    } finally {
      setLoading(false)
    }
  }, [i18n.language, t])

  useEffect(() => {
    fetchFAQData()
  }, [fetchFAQData])

  // Filter categories and questions based on search
  const getFilteredCategories = useCallback(() => {
    if (!searchQuery) return categories
    
    const query = searchQuery.toLowerCase()
    return categories.map(category => ({
      ...category,
      questions: category.questions.filter(q => 
        q.question.toLowerCase().includes(query) ||
        q.answer.toLowerCase().includes(query)
      )
    })).filter(cat => cat.questions.length > 0)
  }, [categories, searchQuery])

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        // Close all other questions and open this one
        return new Set([questionId])
      }
      return newSet
    })
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

  const filteredCategories = getFilteredCategories()

  return (
    <div className="faq">
      <div className="faq__container">
        {/* Header Section */}
        <div className="faq__header">
          <h1 className="faq__title">{t('faq.title') || 'Frequently Asked Questions'}</h1>
          <p className="faq__subtitle">
            {t('faq.subtitle') || 'Find answers to common questions about our service'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="faq__search">
          <div className="faq__search-wrapper">
            <Search className="faq__search-icon" />
            <input
              type="text"
              placeholder={t('faq.searchPlaceholder') || 'Search for answers...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="faq__search-input"
            />
          </div>
        </div>

        {/* FAQ Content */}
        <div className="faq__content">
          {filteredCategories.length === 0 ? (
            <div className="faq__no-results">
              <p>{t('faq.noResults') || 'No questions found matching your search.'}</p>
              {searchQuery && (
                <button 
                  className="faq__clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  {t('faq.clearSearch') || 'Clear search'}
                </button>
              )}
            </div>
          ) : (
            <div className="faq__categories">
              {filteredCategories.map(category => (
                <div key={category.id} className="faq__category">
                  <h2 className="faq__category-title">{category.name}</h2>
                  {category.description && (
                    <p className="faq__category-description">{category.description}</p>
                  )}
                  <div className="faq__questions">
                    {category.questions.map((question, index) => (
                      <div 
                        key={question.id} 
                        className={`faq__question ${expandedQuestions.has(question.id) ? 'is-expanded' : ''}`}
                      >
                        <button
                          className="faq__question-header"
                          onClick={() => toggleQuestion(question.id)}
                        >
                          <span className="faq__question-number">{index + 1}</span>
                          <span className="faq__question-text">{question.question}</span>
                          <span className="faq__question-toggle">
                            {expandedQuestions.has(question.id) ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={20} />
                            )}
                          </span>
                        </button>
                        {expandedQuestions.has(question.id) && (
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="faq__contact">
          <h3>{t('faq.stillNeedHelp') || "Can't find what you're looking for?"}</h3>
          <p>{t('faq.contactSupportDesc') || 'Our support team is here to help you'}</p>
          <a href="/contact" className="faq__contact-button">
            {t('faq.contactUs') || 'Contact Support'}
          </a>
        </div>
      </div>
    </div>
  )
}

export default FAQ