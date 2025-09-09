import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  getLanguageDisplayName, 
  getLanguageFlag, 
  switchLanguage,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage 
} from '@utils/languageDetection'
import './LanguageSwitcher.scss'

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const currentLanguage = i18n.language as SupportedLanguage

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = (lang: SupportedLanguage) => {
    if (lang !== currentLanguage) {
      // Update i18n language
      i18n.changeLanguage(lang)
      
      // Switch subdomain if in production
      const isProduction = window.location.hostname.includes('clearcontract.io')
      switchLanguage(lang, isProduction)
    }
    setIsOpen(false)
  }

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button 
        className="language-switcher__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="language-switcher__flag">
          {getLanguageFlag(currentLanguage)}
        </span>
        <span className="language-switcher__name">
          {getLanguageDisplayName(currentLanguage)}
        </span>
        <svg 
          className={`language-switcher__arrow ${isOpen ? 'language-switcher__arrow--open' : ''}`}
          width="12" 
          height="12" 
          viewBox="0 0 12 12"
        >
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </button>

      {isOpen && (
        <div className="language-switcher__dropdown">
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang}
              className={`language-switcher__option ${lang === currentLanguage ? 'language-switcher__option--active' : ''}`}
              onClick={() => handleLanguageChange(lang)}
            >
              <span className="language-switcher__flag">
                {getLanguageFlag(lang)}
              </span>
              <span className="language-switcher__name">
                {getLanguageDisplayName(lang)}
              </span>
              {lang === currentLanguage && (
                <svg className="language-switcher__check" width="16" height="16" viewBox="0 0 16 16">
                  <path d="M13.5 3.5L6 11L2.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher