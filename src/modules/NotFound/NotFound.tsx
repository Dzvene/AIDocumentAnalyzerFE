import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import './NotFound.scss'

export const NotFound: React.FC = () => {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    
    // Auto redirect countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate(ROUTES.HOME)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const popularLinks = [
    { title: 'Главная страница', path: ROUTES.HOME, icon: '🏠' },
    { title: 'Все магазины', path: ROUTES.VENDORS, icon: '🏪' },
    { title: 'Категории', path: ROUTES.CATEGORIES, icon: '📦' },
    { title: 'Акции', path: ROUTES.OFFERS, icon: '🎁' },
    { title: 'Блог', path: ROUTES.BLOG, icon: '📝' },
    { title: 'Контакты', path: ROUTES.CONTACT_US, icon: '📞' }
  ]

  const recentPages = [
    { title: 'Фрукты и овощи', path: '/category/fruits-vegetables' },
    { title: 'Молочные продукты', path: '/category/dairy' },
    { title: 'Хлеб и выпечка', path: '/category/bakery' },
    { title: 'Мясо и птица', path: '/category/meat' }
  ]

  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <div className="error-animation">
            <div className="error-number">
              <span className="digit">4</span>
              <span className="digit zero">
                <span className="zero-inner">0</span>
              </span>
              <span className="digit">4</span>
            </div>
            <div className="error-icon">
              <span className="icon-main">🛒</span>
              <span className="icon-question">❓</span>
            </div>
          </div>

          <div className="error-message">
            <h1>Упс! Страница не найдена</h1>
            <p className="subtitle">
              Похоже, страница, которую вы ищете, не существует или была перемещена.
              Не волнуйтесь, мы поможем вам найти то, что нужно!
            </p>
          </div>

          <div className="search-section">
            <h3>Попробуйте поискать</h3>
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Что вы ищете?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                🔍 Найти
              </button>
            </form>
          </div>

          <div className="redirect-info">
            <div className="countdown">
              <p>Автоматический переход на главную через</p>
              <div className="countdown-timer">
                <span className="seconds">{countdown}</span>
                <span className="label">секунд</span>
              </div>
            </div>
            
            <div className="manual-redirect">
              <p>или</p>
              <Link to={ROUTES.HOME} className="home-btn">
                🏠 Вернуться на главную
              </Link>
            </div>
          </div>

          <div className="helpful-links">
            <div className="links-section">
              <h3>Популярные страницы</h3>
              <div className="links-grid">
                {popularLinks.map(link => (
                  <Link 
                    key={link.path} 
                    to={link.path}
                    className="link-card"
                  >
                    <span className="link-icon">{link.icon}</span>
                    <span className="link-title">{link.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="links-section">
              <h3>Популярные категории</h3>
              <div className="category-links">
                {recentPages.map(page => (
                  <Link 
                    key={page.path}
                    to={page.path}
                    className="category-link"
                  >
                    {page.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="error-details">
            <details className="technical-info">
              <summary>Техническая информация</summary>
              <div className="details-content">
                <p><strong>Код ошибки:</strong> 404 Not Found</p>
                <p><strong>URL:</strong> {window.location.pathname}</p>
                <p><strong>Время:</strong> {new Date().toLocaleString('ru-RU')}</p>
                <p className="help-text">
                  Если вы считаете, что это ошибка, пожалуйста, 
                  <Link to={ROUTES.CONTACT_US}> свяжитесь с нами</Link>
                </p>
              </div>
            </details>
          </div>

          <div className="mascot-section">
            <div className="mascot">
              <span className="mascot-body">🛒</span>
              <div className="mascot-message">
                <p>Не переживайте!</p>
                <p>Даже лучшие покупатели иногда теряются</p>
              </div>
            </div>
          </div>

          <div className="tips-section">
            <h3>Полезные советы</h3>
            <div className="tips-grid">
              <div className="tip-card">
                <span className="tip-icon">💡</span>
                <div className="tip-content">
                  <h4>Проверьте адрес</h4>
                  <p>Убедитесь, что URL введен правильно</p>
                </div>
              </div>
              <div className="tip-card">
                <span className="tip-icon">🔄</span>
                <div className="tip-content">
                  <h4>Обновите страницу</h4>
                  <p>Иногда простое обновление помогает</p>
                </div>
              </div>
              <div className="tip-card">
                <span className="tip-icon">📱</span>
                <div className="tip-content">
                  <h4>Свяжитесь с поддержкой</h4>
                  <p>Мы всегда готовы помочь вам</p>
                </div>
              </div>
            </div>
          </div>

          <div className="promo-section">
            <div className="promo-card">
              <div className="promo-content">
                <h3>🎁 Специальное предложение!</h3>
                <p>
                  Используйте промокод <strong>FOUND404</strong> и получите 
                  скидку 5% на первый заказ
                </p>
                <Link to={ROUTES.VENDORS} className="promo-btn">
                  Перейти к покупкам
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}