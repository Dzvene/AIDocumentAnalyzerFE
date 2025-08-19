import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store/index'
import { setCurrentLanguage } from '@store/slices/localizationSlice'
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
  { code: 'uz', name: 'Uzbek', nativeName: 'O\'zbekcha', flag: '🇺🇿' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша', flag: '🇰🇿' },
]

const LanguageToggle: React.FC = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const { currentLanguage } = useSelector((state: RootState) => state.localization)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = async (languageCode: string) => {
    dispatch(setCurrentLanguage(languageCode))
    await i18n.changeLanguage(languageCode)
    setIsOpen(false)
  }

  return (
    <div className="language-toggle" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="language-toggle__button"
        aria-label={t('language.toggle')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="language-toggle__flag">{currentLang.flag}</span>
        <span className="language-toggle__name">{currentLang.nativeName}</span>
        <span className="language-toggle__code">{currentLang.code.toUpperCase()}</span>
        <svg
          className={`language-toggle__arrow ${isOpen ? 'language-toggle__arrow--open' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="language-toggle__dropdown" role="listbox">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`language-toggle__option ${
                currentLanguage === language.code ? 'language-toggle__option--selected' : ''
              }`}
              role="option"
              aria-selected={currentLanguage === language.code}
            >
              <span className="language-toggle__option-flag">{language.flag}</span>
              <div className="language-toggle__option-text">
                <div className="language-toggle__option-name">{language.nativeName}</div>
                <div className="language-toggle__option-native">{language.name}</div>
              </div>
              {currentLanguage === language.code && (
                <svg
                  className="language-toggle__checkmark"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageToggle