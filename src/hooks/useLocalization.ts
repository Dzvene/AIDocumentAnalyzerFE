import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const useLocalization = () => {
  const { i18n, t } = useTranslation()
  
  const currentLanguage = i18n.language
  const supportedLanguages = ['en', 'ru']

  const changeLanguage = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode)
      document.documentElement.setAttribute('lang', languageCode)
      document.documentElement.setAttribute('dir', languageCode === 'ar' || languageCode === 'he' ? 'rtl' : 'ltr')
      return true
    } catch (error) {
      console.error('Failed to change language:', error)
      return false
    }
  }

  const getLanguageName = (code: string, native = false) => {
    const languageNames: Record<string, { english: string; native: string }> = {
      en: { english: 'English', native: 'English' },
      ru: { english: 'Russian', native: 'Русский' },
    }
    
    const language = languageNames[code]
    if (!language) return code
    return native ? language.native : language.english
  }

  const isLanguageSupported = (code: string) => {
    return supportedLanguages.includes(code)
  }

  const getLanguageDirection = (code: string) => {
    return ['ar', 'he', 'fa', 'ur'].includes(code) ? 'rtl' : 'ltr'
  }

  useEffect(() => {
    document.documentElement.setAttribute('lang', currentLanguage)
    document.documentElement.setAttribute('dir', getLanguageDirection(currentLanguage))
  }, [currentLanguage])

  return {
    currentLanguage,
    supportedLanguages,
    changeLanguage,
    getLanguageName,
    isLanguageSupported,
    getLanguageDirection,
    t,
    i18n
  }
}