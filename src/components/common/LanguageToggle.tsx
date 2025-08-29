import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './LanguageToggle.scss'

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
]

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
    setIsOpen(false)
  }

  return (
    <div className="language-toggle" ref={dropdownRef}>
      <button
        className="language-toggle__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="language-toggle__flag">{currentLanguage.flag}</span>
        <span className="language-toggle__code">{currentLanguage.code.toUpperCase()}</span>
        <svg
          className={`language-toggle__arrow ${isOpen ? 'language-toggle__arrow--open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className="language-toggle__dropdown">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`language-toggle__option ${
                language.code === currentLanguage.code ? 'language-toggle__option--active' : ''
              }`}
              onClick={() => handleLanguageChange(language.code)}
            >
              <span className="language-toggle__flag">{language.flag}</span>
              <span className="language-toggle__name">{language.nativeName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageToggle