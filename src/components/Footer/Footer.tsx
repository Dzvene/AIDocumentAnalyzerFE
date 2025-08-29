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
      <div className="footer__container">
        <div className="footer__top">
          <div className="footer__section">
            <h3 className="footer__title">AI Document Analyzer</h3>
            <p className="footer__description">
              {t('footer.description') || 'Professional document analysis powered by advanced AI. Extract insights, identify risks, and make informed decisions.'}
            </p>
            <div className="footer__social">
              <a href="#" className="footer__social-link" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </a>
              <a href="#" className="footer__social-link" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.46 6c-.85.38-1.75.64-2.7.76 1-.6 1.76-1.55 2.12-2.68-.93.55-1.96.95-3.06 1.17-.88-.94-2.13-1.53-3.51-1.53-2.66 0-4.81 2.16-4.81 4.81 0 .38.04.75.13 1.1-4-.2-7.58-2.11-9.96-5.02-.42.72-.66 1.56-.66 2.46 0 1.68.85 3.16 2.14 4.02-.79-.02-1.53-.24-2.18-.6v.06c0 2.35 1.67 4.31 3.88 4.76-.4.1-.83.16-1.27.16-.31 0-.62-.03-.92-.08.63 1.96 2.45 3.39 4.61 3.43-1.69 1.32-3.83 2.1-6.15 2.1-.4 0-.8-.02-1.19-.07 2.19 1.4 4.78 2.22 7.57 2.22 9.07 0 14.02-7.52 14.02-14.02 0-.21 0-.41-.01-.61.96-.69 1.79-1.56 2.45-2.55-.88.39-1.83.65-2.82.77z"/>
                </svg>
              </a>
              <a href="#" className="footer__social-link" aria-label="GitHub">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="footer__section">
            <h4 className="footer__section-title">{t('footer.product') || 'Product'}</h4>
            <ul className="footer__list">
              <li><Link to={ROUTES.HOME} className="footer__link">{t('footer.features') || 'Features'}</Link></li>
              <li><Link to={ROUTES.PRICING} className="footer__link">{t('footer.pricing') || 'Pricing'}</Link></li>
              <li><Link to={ROUTES.DOCUMENTS} className="footer__link">{t('footer.documents') || 'Documents'}</Link></li>
              <li><Link to={ROUTES.ANALYSIS} className="footer__link">{t('footer.analysis') || 'Analysis'}</Link></li>
            </ul>
          </div>
          
          <div className="footer__section">
            <h4 className="footer__section-title">{t('footer.resources') || 'Resources'}</h4>
            <ul className="footer__list">
              <li><Link to={ROUTES.FAQ} className="footer__link">{t('footer.faq') || 'FAQ'}</Link></li>
              <li><Link to={ROUTES.GLOSSARY} className="footer__link">{t('footer.glossary') || 'Glossary'}</Link></li>
              <li><a href="/docs" className="footer__link">{t('footer.documentation') || 'Documentation'}</a></li>
              <li><a href="/api" className="footer__link">{t('footer.api') || 'API Reference'}</a></li>
            </ul>
          </div>
          
          <div className="footer__section">
            <h4 className="footer__section-title">{t('footer.company') || 'Company'}</h4>
            <ul className="footer__list">
              <li><Link to={ROUTES.ABOUT} className="footer__link">{t('footer.about') || 'About Us'}</Link></li>
              <li><Link to={ROUTES.CONTACT} className="footer__link">{t('footer.contact') || 'Contact'}</Link></li>
              <li><Link to={ROUTES.PRIVACY_POLICY} className="footer__link">{t('footer.privacy') || 'Privacy Policy'}</Link></li>
              <li><Link to={ROUTES.TERMS_CONDITIONS} className="footer__link">{t('footer.terms') || 'Terms of Service'}</Link></li>
            </ul>
          </div>
          
          <div className="footer__section">
            <h4 className="footer__section-title">{t('footer.support') || 'Support'}</h4>
            <ul className="footer__list">
              <li><a href="mailto:support@aidocanalyzer.com" className="footer__link">{t('footer.email') || 'Email Support'}</a></li>
              <li><a href="tel:+1234567890" className="footer__link">{t('footer.phone') || '+1 (234) 567-890'}</a></li>
              <li><Link to={ROUTES.SUPPORT} className="footer__link">{t('footer.help_center') || 'Help Center'}</Link></li>
              <li><span className="footer__badge">{t('footer.available_247') || '24/7 Available'}</span></li>
            </ul>
          </div>
        </div>
        
        <div className="footer__bottom">
          <div className="footer__bottom-left">
            <p className="footer__copyright">
              &copy; {currentYear} AI Document Analyzer. {t('footer.copyright') || 'All rights reserved.'}
            </p>
            <p className="footer__powered">
              {t('footer.powered_by') || 'Powered by OpenAI & Claude AI'}
            </p>
          </div>
          <div className="footer__bottom-right">
            <select className="footer__language" aria-label="Language">
              <option value="en">English</option>
              <option value="ru">Русский</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  )
}