import React, { useState, useEffect, useRef } from 'react'
import { useLocalization } from '@hooks/useLocalization'
import { useNotification } from '@hooks/useNotification'
import './LanguageSelector.scss'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', nativeName: 'Русский' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦', nativeName: 'Українська' }
]

export const LanguageSelector: React.FC = () => {
  const { currentLanguage: currentLangCode, changeLanguage, getLanguageName, t } = useLocalization()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notification = useNotification()

  const currentLanguage = languages.find(lang => lang.code === currentLangCode) || languages[0]

  const handleLanguageChange = async (langCode: string) => {
    try {
      const success = await changeLanguage(langCode)
      
      if (success) {
        const languageName = getLanguageName(langCode, true)
        notification.success(
          t('localization.languageChanged', { language: languageName })
        )
        setIsOpen(false)
      } else {
        notification.error(t('errors.generic'))
      }
    } catch (error) {
      notification.error(t('errors.generic'))
    }
  }

  // Close dropdown when clicking outside
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

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      return () => {
        document.removeEventListener('keydown', handleEscapeKey)
      }
    }
  }, [isOpen])

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button
        className="language-selector__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('localization.selectLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        type="button"
      >
        <span className="language-selector__flag" aria-hidden="true">
          {currentLanguage.flag}
        </span>
        <span className="language-selector__code">
          {currentLanguage.code.toUpperCase()}
        </span>
        <svg 
          className={`language-selector__arrow ${isOpen ? 'language-selector__arrow--open' : ''}`}
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none"
          aria-hidden="true"
        >
          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div 
          className="language-selector__dropdown"
          role="listbox"
          aria-label={t('localization.selectLanguage')}
        >
          {languages.map((language) => (
            <button
              key={language.code}
              className={`language-selector__option ${
                language.code === currentLangCode ? 'language-selector__option--active' : ''
              }`}
              onClick={() => handleLanguageChange(language.code)}
              role="option"
              aria-selected={language.code === currentLangCode}
              type="button"
            >
              <span className="language-selector__flag" aria-hidden="true">
                {language.flag}
              </span>
              <span className="language-selector__name">
                {language.nativeName}
              </span>
              {language.code === currentLangCode && (
                <svg 
                  className="language-selector__check"
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}