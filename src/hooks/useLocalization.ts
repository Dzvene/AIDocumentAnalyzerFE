import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { 
  setCurrentLanguage, 
  initializeLocalization,
  selectCurrentLanguage,
  selectSupportedLanguages
} from '@store/slices/localizationSlice'

export const useLocalization = () => {
  const { i18n, t } = useTranslation()
  const dispatch = useAppDispatch()
  
  const currentLanguage = useAppSelector(selectCurrentLanguage)
  const supportedLanguages = useAppSelector(selectSupportedLanguages)

  const changeLanguage = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode)
      dispatch(setCurrentLanguage(languageCode))
      
      // Update HTML attributes
      document.documentElement.setAttribute('lang', languageCode)
      document.documentElement.setAttribute('dir', languageCode === 'ar' ? 'rtl' : 'ltr')
      
      return true
    } catch (error) {
      console.error('Failed to change language:', error)
      return false
    }
  }

  const getLanguageName = (code: string, native = false) => {
    const languageNames: Record<string, { en: string; native: string }> = {
      en: { en: 'English', native: 'English' },
      ru: { en: 'Russian', native: 'Русский' },
      de: { en: 'German', native: 'Deutsch' },
      fr: { en: 'French', native: 'Français' },
      es: { en: 'Spanish', native: 'Español' },
      it: { en: 'Italian', native: 'Italiano' },
      pl: { en: 'Polish', native: 'Polski' },
    }
    
    return languageNames[code]?.[native ? 'native' : 'en'] || code
  }

  const isLanguageSupported = (code: string) => {
    return supportedLanguages.includes(code)
  }

  const getLanguageDirection = (code: string) => {
    const rtlLanguages = ['ar', 'he', 'fa']
    return rtlLanguages.includes(code) ? 'rtl' : 'ltr'
  }

  // Initialize localization on mount
  useEffect(() => {
    const detectedLanguage = i18n.language || 'en'
    if (detectedLanguage !== currentLanguage) {
      dispatch(initializeLocalization({
        language: detectedLanguage,
        supportedLanguages: ['en', 'ru', 'de', 'fr', 'es', 'it', 'pl']
      }))
    }
  }, [i18n.language, currentLanguage, dispatch])

  // Sync i18next language changes with Redux
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      if (lng !== currentLanguage) {
        dispatch(setCurrentLanguage(lng))
      }
    }

    i18n.on('languageChanged', handleLanguageChanged)
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [i18n, currentLanguage, dispatch])

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