import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initializeLanguage, SUPPORTED_LANGUAGES } from '@utils/languageDetection'

// Translation files
import en from './translations/en.json'
import de from './translations/de.json'
import ru from './translations/ru.json'
import fr from './translations/fr.json'
import es from './translations/es.json'
import it from './translations/it.json'
import pl from './translations/pl.json'

const resources = {
  en: { translation: en },
  de: { translation: de },
  ru: { translation: ru },
  fr: { translation: fr },
  es: { translation: es },
  it: { translation: it },
  pl: { translation: pl }
}

// Get initial language from domain
const initialLanguage = initializeLanguage()

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage, // Set initial language from domain
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false
    },

    supportedLngs: SUPPORTED_LANGUAGES,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'preferredLanguage', // Use same key as our languageDetection utils
    }
  })

export default i18n