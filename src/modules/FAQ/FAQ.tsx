import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ThumbsUp, 
  ThumbsDown,
  ArrowLeft,
  HelpCircle,
  MessageCircle
} from 'lucide-react'
import { ROUTES } from '@constants/routes'
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
  category_name: string
  category_slug: string
  is_featured: boolean
  view_count: number
  helpful_count: number
  related_questions?: Array<{
    id: string
    slug: string
    question: string
  }>
}

interface FAQFeedback {
  question_id: string
  is_helpful: boolean
  comment?: string
  session_id?: string
}

export const FAQ: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { slug } = useParams<{ slug?: string }>()
  const navigate = useNavigate()
  
  const [categories, setCategories] = useState<FAQCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<FAQQuestion | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FAQQuestion[]>([])
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch FAQ categories and questions
  useEffect(() => {
    fetchFAQData()
  }, [i18n.language])

  // Handle direct question URL
  useEffect(() => {
    if (slug && categories.length > 0) {
      fetchQuestionBySlug(slug)
    }
  }, [slug, categories])

  const fetchFAQData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/faq/categories?language=${i18n.language}`)
      if (!response.ok) throw new Error('Failed to fetch FAQ')
      
      const data = await response.json()
      setCategories(data)
      setError(null)
    } catch (err) {
      setError(t('faq.error'))
      console.error('Error fetching FAQ:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestionBySlug = async (questionSlug: string) => {
    try {
      const response = await fetch(`/api/faq/questions/${questionSlug}?language=${i18n.language}`)
      if (!response.ok) return
      
      const question = await response.json()
      setSelectedQuestion(question)
      setSelectedCategory(question.category_slug)
    } catch (err) {
      console.error('Error fetching question:', err)
    }
  }

  const searchQuestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(
        `/api/faq/questions/search?q=${encodeURIComponent(query)}&language=${i18n.language}`
      )
      if (!response.ok) return
      
      const results = await response.json()
      setSearchResults(results)
    } catch (err) {
      console.error('Search error:', err)
    }
  }, [i18n.language])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchQuestions(searchQuery)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, searchQuestions])

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedQuestions(newExpanded)
  }

  const handleFeedback = async (questionId: string, isHelpful: boolean) => {
    if (feedbackGiven.has(questionId)) return

    try {
      const sessionId = localStorage.getItem('faq_session_id') || 
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      if (!localStorage.getItem('faq_session_id')) {
        localStorage.setItem('faq_session_id', sessionId)
      }

      const feedback: FAQFeedback = {
        question_id: questionId,
        is_helpful: isHelpful,
        session_id: sessionId
      }

      const response = await fetch(`/api/faq/questions/${questionId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      })

      if (response.ok) {
        setFeedbackGiven(new Set([...feedbackGiven, questionId]))
      }
    } catch (err) {
      console.error('Feedback error:', err)
    }
  }

  const selectQuestion = (question: FAQQuestion) => {
    setSelectedQuestion(question)
    navigate(`${ROUTES.FAQ}/${question.slug}`)
  }

  const clearSelection = () => {
    setSelectedQuestion(null)
    navigate(ROUTES.FAQ)
  }

  // Filter questions by category
  const filteredQuestions = selectedCategory
    ? categories
        .find(c => c.slug === selectedCategory)
        ?.questions || []
    : categories.flatMap(c => c.questions)

  // Display questions (search results or filtered)
  const displayQuestions = searchQuery ? searchResults : filteredQuestions

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
        <HelpCircle size={48} />
        <p>{error}</p>
        <button onClick={fetchFAQData}>{t('common.refresh')}</button>
      </div>
    )
  }

  return (
    <div className="faq">
      <div className="faq__header">
        <h1>{t('faq.title')}</h1>
        <p>{t('faq.subtitle')}</p>
      </div>

      {/* Search Bar */}
      <div className="faq__search">
        <Search className="faq__search-icon" />
        <input
          type="text"
          placeholder={t('faq.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="faq__search-input"
        />
      </div>

      <div className="faq__content">
        {/* Categories Sidebar */}
        <aside className="faq__sidebar">
          <h3>{t('faq.categories')}</h3>
          <ul className="faq__categories">
            <li
              className={`faq__category ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              {t('faq.allCategories')}
            </li>
            {categories.map(category => (
              <li
                key={category.id}
                className={`faq__category ${selectedCategory === category.slug ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.slug)}
              >
                {category.icon && <span className="faq__category-icon">{category.icon}</span>}
                {category.name}
                <span className="faq__category-count">({category.questions.length})</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Questions or Single Question View */}
        <main className="faq__main">
          {selectedQuestion ? (
            // Single Question View
            <div className="faq__single-question">
              <button className="faq__back-button" onClick={clearSelection}>
                <ArrowLeft size={20} />
                {t('faq.backToFaq')}
              </button>
              
              <article className="faq__question-detail">
                <h2>{selectedQuestion.question}</h2>
                <div className="faq__question-meta">
                  <span className="faq__category-badge">
                    {selectedQuestion.category_name}
                  </span>
                  <span className="faq__view-count">
                    {selectedQuestion.view_count} views
                  </span>
                </div>
                
                <div 
                  className="faq__answer"
                  dangerouslySetInnerHTML={{ __html: selectedQuestion.answer }}
                />

                {/* Feedback */}
                <div className="faq__feedback">
                  <p>{t('faq.wasHelpful')}</p>
                  <div className="faq__feedback-buttons">
                    <button
                      className={`faq__feedback-btn ${
                        feedbackGiven.has(selectedQuestion.id) ? 'disabled' : ''
                      }`}
                      onClick={() => handleFeedback(selectedQuestion.id, true)}
                      disabled={feedbackGiven.has(selectedQuestion.id)}
                    >
                      <ThumbsUp size={16} />
                      {t('faq.yes')} ({selectedQuestion.helpful_count})
                    </button>
                    <button
                      className={`faq__feedback-btn ${
                        feedbackGiven.has(selectedQuestion.id) ? 'disabled' : ''
                      }`}
                      onClick={() => handleFeedback(selectedQuestion.id, false)}
                      disabled={feedbackGiven.has(selectedQuestion.id)}
                    >
                      <ThumbsDown size={16} />
                      {t('faq.no')}
                    </button>
                  </div>
                  {feedbackGiven.has(selectedQuestion.id) && (
                    <p className="faq__feedback-thanks">{t('faq.thanksFeedback')}</p>
                  )}
                </div>

                {/* Related Questions */}
                {selectedQuestion.related_questions && selectedQuestion.related_questions.length > 0 && (
                  <div className="faq__related">
                    <h3>{t('faq.relatedQuestions')}</h3>
                    <ul>
                      {selectedQuestion.related_questions.map(related => (
                        <li key={related.id}>
                          <Link to={`${ROUTES.FAQ}/${related.slug}`}>
                            {related.question}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            </div>
          ) : (
            // Questions List View
            <div className="faq__questions">
              {displayQuestions.length === 0 ? (
                <div className="faq__no-results">
                  <HelpCircle size={48} />
                  <p>{t('faq.noResults')}</p>
                  <p>{t('faq.tryDifferentSearch')}</p>
                </div>
              ) : (
                <div className="faq__questions-list">
                  {displayQuestions.map(question => (
                    <div key={question.id} className="faq__question">
                      <div 
                        className="faq__question-header"
                        onClick={() => toggleQuestion(question.id)}
                      >
                        <h3>{question.question}</h3>
                        {expandedQuestions.has(question.id) ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                      
                      {expandedQuestions.has(question.id) && (
                        <div className="faq__question-content">
                          <div 
                            className="faq__question-answer"
                            dangerouslySetInnerHTML={{ 
                              __html: question.answer.substring(0, 200) + '...'
                            }}
                          />
                          <button
                            className="faq__read-more"
                            onClick={(e) => {
                              e.stopPropagation()
                              selectQuestion(question)
                            }}
                          >
                            {t('faq.viewMore')}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Contact Support CTA */}
      <div className="faq__contact-cta">
        <MessageCircle size={24} />
        <p>{t('faq.contactSupport')}</p>
        <Link to={ROUTES.CONTACT_US} className="faq__contact-button">
          {t('footer.contactUs')}
        </Link>
      </div>
    </div>
  )
}