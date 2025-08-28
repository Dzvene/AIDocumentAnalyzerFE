import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Search, 
  ChevronDown, 
  ChevronUp,
  ChevronRight,
  ThumbsUp, 
  ThumbsDown,
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  FileText,
  Shield,
  DollarSign,
  Settings,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink
} from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { LoadingSpinner } from '@components/LoadingSpinner'
import { toast } from 'react-hot-toast'
import './FAQ.scss'

interface FAQCategory {
  id: string
  slug: string
  name: string
  description?: string
  icon?: string
  questions: FAQQuestion[]
  questions_count?: number
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
  not_helpful_count?: number
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

// Icon mapping for categories
const categoryIcons: { [key: string]: React.ReactNode } = {
  'general': <HelpCircle size={20} />,
  'getting-started': <FileText size={20} />,
  'security': <Shield size={20} />,
  'billing': <DollarSign size={20} />,
  'technical': <Settings size={20} />,
  'troubleshooting': <AlertCircle size={20} />
}

export const FAQ: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { slug } = useParams<{ slug?: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [categories, setCategories] = useState<FAQCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'))
  const [selectedQuestion, setSelectedQuestion] = useState<FAQQuestion | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Fetch FAQ data
  const fetchFAQData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/faq/categories?language=${i18n.language}`)
      if (!response.ok) throw new Error('Failed to fetch FAQ data')
      
      const data = await response.json()
      setCategories(data)
      
      // If slug is provided, find and select the question
      if (slug) {
        const question = data
          .flatMap((cat: FAQCategory) => cat.questions)
          .find((q: FAQQuestion) => q.slug === slug)
        
        if (question) {
          setSelectedQuestion(question)
          setSelectedCategory(question.category_slug)
        }
      }
    } catch (err: any) {
      setError(err.message || t('faq.loadError'))
    } finally {
      setLoading(false)
    }
  }, [i18n.language, slug, t])

  useEffect(() => {
    fetchFAQData()
  }, [fetchFAQData])

  // Update URL params when category or search changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedCategory) params.set('category', selectedCategory)
    if (searchQuery) params.set('search', searchQuery)
    setSearchParams(params)
  }, [selectedCategory, searchQuery, setSearchParams])

  // Filter questions based on search and category
  const filteredQuestions = useMemo(() => {
    let questions: FAQQuestion[] = []
    
    if (selectedCategory) {
      const category = categories.find(cat => cat.slug === selectedCategory)
      questions = category?.questions || []
    } else {
      questions = categories.flatMap(cat => cat.questions)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      questions = questions.filter(q => 
        q.question.toLowerCase().includes(query) ||
        q.answer.toLowerCase().includes(query)
      )
    }
    
    return questions
  }, [categories, selectedCategory, searchQuery])

  // Featured questions
  const featuredQuestions = useMemo(() => {
    return categories
      .flatMap(cat => cat.questions)
      .filter(q => q.is_featured)
      .slice(0, 5)
  }, [categories])

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const selectQuestion = (question: FAQQuestion) => {
    setSelectedQuestion(question)
    navigate(`${ROUTES.FAQ}/${question.slug}`)
    
    // Track view
    fetch(`/api/faq/questions/${question.id}/view`, { method: 'POST' })
      .catch(console.error)
  }

  const clearSelection = () => {
    setSelectedQuestion(null)
    navigate(ROUTES.FAQ)
  }

  const handleFeedback = async (questionId: string, isHelpful: boolean) => {
    if (feedbackGiven.has(questionId)) return
    
    try {
      const response = await fetch('/api/faq/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: questionId,
          is_helpful: isHelpful,
          session_id: sessionStorage.getItem('session_id') || undefined
        })
      })
      
      if (response.ok) {
        setFeedbackGiven(prev => new Set(prev).add(questionId))
        toast.success(t('faq.thanksFeedback'))
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err)
    }
  }

  const copyLink = (question: FAQQuestion) => {
    const url = `${window.location.origin}${ROUTES.FAQ}/${question.slug}`
    navigator.clipboard.writeText(url)
    setCopiedId(question.id)
    toast.success(t('faq.linkCopied'))
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCategorySelect = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug)
    setSelectedQuestion(null)
    setExpandedQuestions(new Set())
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
        <AlertCircle size={48} />
        <p>{error}</p>
        <button onClick={fetchFAQData}>{t('common.tryAgain')}</button>
      </div>
    )
  }

  return (
    <div className="faq">
      {/* Header */}
      <div className="faq__header">
        <div className="faq__header-content">
          <h1>{t('faq.title')}</h1>
          <p>{t('faq.subtitle')}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="faq__search-section">
        <div className="faq__search">
          <Search className="faq__search-icon" />
          <input
            type="text"
            placeholder={t('faq.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="faq__search-input"
          />
          {searchQuery && (
            <button 
              className="faq__search-clear"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="faq__search-results">
            {t('faq.searchResults', { count: filteredQuestions.length })}
          </p>
        )}
      </div>

      {/* Main Content */}
      <div className="faq__content">
        {/* Sidebar */}
        <aside className="faq__sidebar">
          <nav className="faq__nav">
            <h3>{t('faq.categories')}</h3>
            <ul className="faq__categories">
              <li>
                <button
                  className={`faq__category ${!selectedCategory ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(null)}
                >
                  <span className="faq__category-icon">
                    <HelpCircle size={18} />
                  </span>
                  <span className="faq__category-name">
                    {t('faq.allCategories')}
                  </span>
                  <span className="faq__category-count">
                    {categories.reduce((sum, cat) => sum + cat.questions.length, 0)}
                  </span>
                </button>
              </li>
              {categories.map(category => (
                <li key={category.id}>
                  <button
                    className={`faq__category ${selectedCategory === category.slug ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(category.slug)}
                  >
                    <span className="faq__category-icon">
                      {categoryIcons[category.slug] || <HelpCircle size={18} />}
                    </span>
                    <span className="faq__category-name">
                      {category.name}
                    </span>
                    <span className="faq__category-count">
                      {category.questions.length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Quick Links */}
          <div className="faq__quick-links">
            <h4>{t('faq.quickLinks')}</h4>
            <a href={ROUTES.CONTACT_US} className="faq__quick-link">
              <MessageCircle size={16} />
              {t('faq.contactSupport')}
            </a>
            <a href="/docs" className="faq__quick-link">
              <FileText size={16} />
              {t('faq.documentation')}
            </a>
          </div>
        </aside>

        {/* Main Area */}
        <main className="faq__main">
          {selectedQuestion ? (
            // Single Question View
            <article className="faq__article">
              <button className="faq__back-button" onClick={clearSelection}>
                <ArrowLeft size={18} />
                {t('faq.backToFaq')}
              </button>
              
              <div className="faq__article-header">
                <h1>{selectedQuestion.question}</h1>
                <div className="faq__article-meta">
                  <span className="faq__category-badge">
                    {selectedQuestion.category_name}
                  </span>
                  <span className="faq__view-count">
                    {t('faq.views', { count: selectedQuestion.view_count })}
                  </span>
                </div>
              </div>
              
              <div className="faq__article-content">
                {selectedQuestion.answer.split('\n').map((paragraph, index) => (
                  paragraph.trim() && <p key={index}>{paragraph}</p>
                ))}
              </div>

              {/* Article Actions */}
              <div className="faq__article-actions">
                <button
                  className="faq__action-btn"
                  onClick={() => copyLink(selectedQuestion)}
                >
                  {copiedId === selectedQuestion.id ? (
                    <CheckCircle size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                  {t('faq.copyLink')}
                </button>
              </div>

              {/* Feedback Section */}
              <div className="faq__feedback">
                <h3>{t('faq.wasHelpful')}</h3>
                <div className="faq__feedback-buttons">
                  <button
                    className={`faq__feedback-btn ${
                      feedbackGiven.has(selectedQuestion.id) ? 'disabled' : ''
                    }`}
                    onClick={() => handleFeedback(selectedQuestion.id, true)}
                    disabled={feedbackGiven.has(selectedQuestion.id)}
                  >
                    <ThumbsUp size={18} />
                    {t('faq.yes')}
                    <span className="faq__feedback-count">
                      {selectedQuestion.helpful_count}
                    </span>
                  </button>
                  <button
                    className={`faq__feedback-btn ${
                      feedbackGiven.has(selectedQuestion.id) ? 'disabled' : ''
                    }`}
                    onClick={() => handleFeedback(selectedQuestion.id, false)}
                    disabled={feedbackGiven.has(selectedQuestion.id)}
                  >
                    <ThumbsDown size={18} />
                    {t('faq.no')}
                    {selectedQuestion.not_helpful_count && (
                      <span className="faq__feedback-count">
                        {selectedQuestion.not_helpful_count}
                      </span>
                    )}
                  </button>
                </div>
                {feedbackGiven.has(selectedQuestion.id) && (
                  <p className="faq__feedback-thanks">
                    {t('faq.thanksFeedback')}
                  </p>
                )}
              </div>

              {/* Related Questions */}
              {selectedQuestion.related_questions && selectedQuestion.related_questions.length > 0 && (
                <div className="faq__related">
                  <h3>{t('faq.relatedQuestions')}</h3>
                  <div className="faq__related-list">
                    {selectedQuestion.related_questions.map(related => (
                      <button
                        key={related.id}
                        className="faq__related-item"
                        onClick={() => {
                          const question = filteredQuestions.find(q => q.id === related.id)
                          if (question) selectQuestion(question)
                        }}
                      >
                        <ChevronRight size={16} />
                        {related.question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ) : (
            // Questions List View
            <>
              {/* Featured Questions */}
              {!searchQuery && !selectedCategory && featuredQuestions.length > 0 && (
                <div className="faq__featured">
                  <h2>{t('faq.popularQuestions')}</h2>
                  <div className="faq__featured-list">
                    {featuredQuestions.map(question => (
                      <button
                        key={question.id}
                        className="faq__featured-item"
                        onClick={() => selectQuestion(question)}
                      >
                        <span className="faq__featured-icon">⭐</span>
                        <span className="faq__featured-text">
                          {question.question}
                        </span>
                        <ChevronRight size={18} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Header */}
              {selectedCategory && (
                <div className="faq__category-header">
                  <h2>
                    {categories.find(cat => cat.slug === selectedCategory)?.name}
                  </h2>
                  {categories.find(cat => cat.slug === selectedCategory)?.description && (
                    <p>{categories.find(cat => cat.slug === selectedCategory)?.description}</p>
                  )}
                </div>
              )}

              {/* Questions List */}
              <div className="faq__questions">
                {filteredQuestions.length === 0 ? (
                  <div className="faq__no-results">
                    <HelpCircle size={64} />
                    <h3>{t('faq.noResults')}</h3>
                    <p>{t('faq.tryDifferentSearch')}</p>
                    {searchQuery && (
                      <button 
                        className="faq__clear-search"
                        onClick={() => setSearchQuery('')}
                      >
                        {t('faq.clearSearch')}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="faq__questions-list">
                    {filteredQuestions.map(question => (
                      <div key={question.id} className="faq__question">
                        <button
                          className="faq__question-header"
                          onClick={() => toggleQuestion(question.id)}
                        >
                          <h3>{question.question}</h3>
                          <span className="faq__question-toggle">
                            {expandedQuestions.has(question.id) ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={20} />
                            )}
                          </span>
                        </button>
                        
                        {expandedQuestions.has(question.id) && (
                          <div className="faq__question-content">
                            <div className="faq__question-answer">
                              {question.answer.length > 200 
                                ? question.answer.substring(0, 200) + '...'
                                : question.answer}
                            </div>
                            <div className="faq__question-actions">
                              <button
                                className="faq__read-more"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  selectQuestion(question)
                                }}
                              >
                                {t('faq.readMore')}
                                <ExternalLink size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Contact CTA */}
      <div className="faq__contact-cta">
        <div className="faq__contact-content">
          <MessageCircle size={32} />
          <div>
            <h3>{t('faq.stillNeedHelp')}</h3>
            <p>{t('faq.contactSupportDesc')}</p>
          </div>
          <a href={ROUTES.CONTACT_US} className="faq__contact-button">
            {t('faq.contactUs')}
          </a>
        </div>
      </div>
    </div>
  )
}

export default FAQ