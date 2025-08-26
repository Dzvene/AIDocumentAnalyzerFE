import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@constants/routes'
import './Footer.scss'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const { t } = useTranslation()
  
  return (
    <footer className="footer">
      <div className="footer__pricing-info">
        <div className="pricing-badges">
          <span className="pricing-badge">📄 1-10 стр: €0.99</span>
          <span className="pricing-badge">📚 11-50 стр: €0.79</span>
          <span className="pricing-badge">📖 51-100 стр: €0.59</span>
          <span className="pricing-badge">🏢 100+ стр: €0.39</span>
        </div>
      </div>
      <div className="footer__content">
        <p className="footer__text">
          &copy; {currentYear} AI Document Analyzer. {t('footer.copyright') || 'All rights reserved.'}
        </p>
        <div className="footer__links">
          <Link to={ROUTES.PRIVACY_POLICY} className="footer__link">
            {t('footer.privacyPolicy')}
          </Link>
          <span className="footer__separator">•</span>
          <Link to={ROUTES.TERMS_AND_CONDITIONS} className="footer__link">
            {t('footer.termsOfService')}
          </Link>
          <span className="footer__separator">•</span>
          <Link to={ROUTES.ABOUT_US} className="footer__link">
            {t('navigation.about')}
          </Link>
          <span className="footer__separator">•</span>
          <Link to={ROUTES.CONTACT_US} className="footer__link">
            {t('navigation.contact')}
          </Link>
          <span className="footer__separator">•</span>
          <Link to="/support" className="footer__link">
            {t('footer.customerService')}
          </Link>
        </div>
      </div>
    </footer>
  )
}