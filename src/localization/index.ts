import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Translation files
import en from '../locales/en/translation.json'
import ru from '../locales/ru/translation.json'
import uz from '../locales/uz/translation.json'
import kk from '../locales/kk/translation.json'

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  uz: { translation: uz },
  kk: { translation: kk }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  })

export default i18n