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
      <div className="footer__content">
        <p className="footer__text">
          &copy; {currentYear} AI Document Analyzer. {t('footer.copyright') || 'All rights reserved.'}
        </p>
        <div className="footer__links">
          <Link to={ROUTES.PRIVACY_POLICY} className="footer__link">
            {t('footer.privacy') || 'Privacy Policy'}
          </Link>
          <span className="footer__separator">•</span>
          <Link to={ROUTES.TERMS_CONDITIONS} className="footer__link">
            {t('footer.terms') || 'Terms of Service'}
          </Link>
          <span className="footer__separator">•</span>
          <Link to={ROUTES.FAQ} className="footer__link">
            {t('footer.faq') || 'FAQ'}
          </Link>
          <span className="footer__separator">•</span>
          <Link to={ROUTES.GLOSSARY} className="footer__link">
            {t('footer.glossary') || 'Glossary'}
          </Link>
        </div>
      </div>
    </footer>
  )
}