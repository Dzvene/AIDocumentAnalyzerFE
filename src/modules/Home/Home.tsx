import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './Home.scss'

export const Home: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="home">
      <section className="home__hero">
        <div className="container">
          <h1 className="home__title">AI Document Analyzer</h1>
          <p className="home__subtitle">
            Интеллектуальный анализ документов с использованием искусственного интеллекта
          </p>
          <div className="home__actions">
            <Link to="/upload" className="btn btn--primary btn--large">
              Загрузить документ
            </Link>
            <Link to="/dashboard" className="btn btn--secondary btn--large">
              Мои документы
            </Link>
          </div>
        </div>
      </section>

      <section className="home__features">
        <div className="container">
          <h2 className="home__section-title">Возможности системы</h2>
          <div className="home__features-grid">
            <div className="feature-card">
              <div className="feature-card__icon">📄</div>
              <h3 className="feature-card__title">Анализ документов</h3>
              <p className="feature-card__description">
                Автоматическое извлечение ключевой информации из PDF, Word, Excel и других форматов
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">🤖</div>
              <h3 className="feature-card__title">ИИ обработка</h3>
              <p className="feature-card__description">
                Использование передовых алгоритмов машинного обучения для анализа содержимого
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">📊</div>
              <h3 className="feature-card__title">Аналитика</h3>
              <p className="feature-card__description">
                Детальная статистика и визуализация результатов анализа
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">🔒</div>
              <h3 className="feature-card__title">Безопасность</h3>
              <p className="feature-card__description">
                Полная конфиденциальность и защита ваших документов
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">⚡</div>
              <h3 className="feature-card__title">Быстрая обработка</h3>
              <p className="feature-card__description">
                Мгновенный анализ документов любого размера
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">🌐</div>
              <h3 className="feature-card__title">API интеграция</h3>
              <p className="feature-card__description">
                Простая интеграция с вашими существующими системами
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="home__how-it-works">
        <div className="container">
          <h2 className="home__section-title">Как это работает</h2>
          <div className="home__steps">
            <div className="step">
              <div className="step__number">1</div>
              <h3 className="step__title">Загрузите документ</h3>
              <p className="step__description">
                Просто перетащите файл или выберите его с компьютера
              </p>
            </div>

            <div className="step">
              <div className="step__number">2</div>
              <h3 className="step__title">Выберите тип анализа</h3>
              <p className="step__description">
                Укажите, какую информацию нужно извлечь
              </p>
            </div>

            <div className="step">
              <div className="step__number">3</div>
              <h3 className="step__title">Получите результаты</h3>
              <p className="step__description">
                Скачайте отчет или используйте API для интеграции
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="home__cta">
        <div className="container">
          <h2 className="home__cta-title">Готовы начать?</h2>
          <p className="home__cta-subtitle">
            Попробуйте AI Document Analyzer бесплатно прямо сейчас
          </p>
          <Link to="/register" className="btn btn--primary btn--large">
            Начать бесплатно
          </Link>
        </div>
      </section>
    </div>
  )
}