import React, { useState, useEffect } from 'react'
import { platformApi, PlatformStatistics } from '@api/platformApi'
import './About.scss'

export const About: React.FC = () => {
  const [statistics, setStatistics] = useState<PlatformStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      const stats = await platformApi.getStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error('Failed to load statistics:', error)
      // Использовать дефолтные значения при ошибке
      setStatistics({
        totalVendors: 500,
        totalProducts: 10000,
        totalCustomers: 50000,
        averageRating: 4.8
      })
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${Math.floor(num / 1000)} ${num % 1000 === 0 ? '' : ''}000+`
    }
    return `${num}+`
  }
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <h1 className="about-title">О нас</h1>
          <p className="about-subtitle">
            Мы создаем удобную платформу для покупок в местных магазинах
          </p>
        </div>
      </div>

      <div className="container">
        <div className="about-content">
          <section className="about-section">
            <h2>Наша миссия</h2>
            <p>
              OnLimitShop - это инновационная платформа, которая объединяет местные магазины 
              и производителей с покупателями. Мы стремимся сделать покупки проще, быстрее 
              и удобнее, поддерживая при этом малый и средний бизнес в вашем регионе.
            </p>
          </section>

          <section className="about-section">
            <h2>Что мы предлагаем</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🛍️</div>
                <h3>Широкий выбор</h3>
                <p>Тысячи товаров от сотен местных магазинов в одном месте</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🚚</div>
                <h3>Быстрая доставка</h3>
                <p>Доставка в день заказа от местных магазинов</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <h3>Выгодные цены</h3>
                <p>Прямые поставки от производителей без наценок</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🤝</div>
                <h3>Поддержка бизнеса</h3>
                <p>Помогаем развиваться местным предпринимателям</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Наши ценности</h2>
            <ul className="values-list">
              <li>
                <strong>Качество:</strong> Мы тщательно отбираем партнеров и следим за качеством товаров
              </li>
              <li>
                <strong>Доверие:</strong> Прозрачные условия сотрудничества и честные отзывы покупателей
              </li>
              <li>
                <strong>Инновации:</strong> Постоянно улучшаем сервис и внедряем новые технологии
              </li>
              <li>
                <strong>Сообщество:</strong> Создаем экосистему взаимовыгодного сотрудничества
              </li>
            </ul>
          </section>

          <section className="about-section stats-section">
            <h2>Наши достижения</h2>
            <div className="stats-grid">
              {loading ? (
                <div className="stats-loading">
                  <div className="spinner"></div>
                  <p>Загрузка статистики...</p>
                </div>
              ) : (
                <>
                  <div className="stat-card">
                    <div className="stat-number" data-animate="true">
                      {statistics ? formatNumber(statistics.totalVendors) : '500+'}
                    </div>
                    <div className="stat-label">Магазинов</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number" data-animate="true">
                      {statistics ? formatNumber(statistics.totalProducts) : '10 000+'}
                    </div>
                    <div className="stat-label">Товаров</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number" data-animate="true">
                      {statistics ? formatNumber(statistics.totalCustomers) : '50 000+'}
                    </div>
                    <div className="stat-label">Покупателей</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number" data-animate="true">
                      {statistics ? statistics.averageRating.toFixed(1) : '4.8'}
                    </div>
                    <div className="stat-label">Средний рейтинг</div>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="about-section cta-section">
            <h2>Присоединяйтесь к нам</h2>
            <p>
              Станьте частью растущего сообщества покупателей и продавцов. 
              Начните покупать или продавать на OnLimitShop уже сегодня!
            </p>
            <div className="cta-buttons">
              <button className="btn btn-primary">Начать покупки</button>
              <button className="btn btn-secondary">Стать партнером</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}