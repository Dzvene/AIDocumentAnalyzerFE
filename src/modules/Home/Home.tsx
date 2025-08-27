import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PricingTable from '../../components/PricingTable'
import './Home.scss'

export const Home: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="home">
      <section className="home__hero">
        <div className="container">
          <h1 className="home__title">{t('home.hero.title')}</h1>
          <p className="home__subtitle">
            {t('home.hero.subtitle')}
          </p>
          <div className="home__actions">
            <Link to="/analyze" className="btn btn--primary btn--large">
              {t('home.hero.startAnalysis')}
            </Link>
          </div>
        </div>
      </section>

      <section className="home__features">
        <div className="container">
          <h2 className="home__section-title">{t('home.features.title')}</h2>
          <div className="home__features-grid">
            <div className="feature-card">
              <div className="feature-card__icon">📄</div>
              <h3 className="feature-card__title">{t('home.features.documentAnalysis.title')}</h3>
              <p className="feature-card__description">
                {t('home.features.documentAnalysis.description')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">🤖</div>
              <h3 className="feature-card__title">{t('home.features.aiProcessing.title')}</h3>
              <p className="feature-card__description">
                {t('home.features.aiProcessing.description')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">📊</div>
              <h3 className="feature-card__title">{t('home.features.reports.title')}</h3>
              <p className="feature-card__description">
                {t('home.features.reports.description')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">🔒</div>
              <h3 className="feature-card__title">{t('home.features.security.title')}</h3>
              <p className="feature-card__description">
                {t('home.features.security.description')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">⚡</div>
              <h3 className="feature-card__title">{t('home.features.fastProcessing.title')}</h3>
              <p className="feature-card__description">
                {t('home.features.fastProcessing.description')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">📁</div>
              <h3 className="feature-card__title">{t('home.features.multiFormat.title')}</h3>
              <p className="feature-card__description">
                {t('home.features.multiFormat.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="home__how-it-works">
        <div className="container">
          <h2 className="home__section-title">{t('home.howItWorks.title')}</h2>
          <div className="home__steps">
            <div className="step">
              <div className="step__number">1</div>
              <h3 className="step__title">{t('home.howItWorks.step1.title')}</h3>
              <p className="step__description">
                {t('home.howItWorks.step1.description')}
              </p>
            </div>

            <div className="step">
              <div className="step__number">2</div>
              <h3 className="step__title">{t('home.howItWorks.step2.title')}</h3>
              <p className="step__description">
                {t('home.howItWorks.step2.description')}
              </p>
            </div>

            <div className="step">
              <div className="step__number">3</div>
              <h3 className="step__title">{t('home.howItWorks.step3.title')}</h3>
              <p className="step__description">
                {t('home.howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="home__pricing">
        <div className="container">
          <PricingTable />
        </div>
      </section>

      <section className="home__cta">
        <div className="container">
          <h2 className="home__cta-title">{t('cta.title')}</h2>
          <p className="home__cta-subtitle">
            {t('cta.subtitle')}
          </p>
          <Link to="/register" className="btn btn--primary btn--large">
            {t('cta.button')}
          </Link>
        </div>
      </section>
    </div>
  )
}