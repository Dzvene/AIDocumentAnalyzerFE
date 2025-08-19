import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface LocalizationState {
  currentLanguage: string
  isLoading: boolean
  supportedLanguages: string[]
  translations: Record<string, any>
}

const initialState: LocalizationState = {
  currentLanguage: localStorage.getItem('i18nextLng') || 'en',
  isLoading: false,
  supportedLanguages: ['en', 'ru', 'de', 'fr', 'es', 'it', 'pl'],
  translations: {}
}

const localizationSlice = createSlice({
  name: 'localization',
  initialState,
  reducers: {
    setCurrentLanguage: (state, action: PayloadAction<string>) => {
      state.currentLanguage = action.payload
      localStorage.setItem('i18nextLng', action.payload)
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    
    setSupportedLanguages: (state, action: PayloadAction<string[]>) => {
      state.supportedLanguages = action.payload
    },
    
    setTranslations: (state, action: PayloadAction<Record<string, any>>) => {
      state.translations = action.payload
    },
    
    addTranslation: (state, action: PayloadAction<{ language: string; key: string; value: string }>) => {
      const { language, key, value } = action.payload
      if (!state.translations[language]) {
        state.translations[language] = {}
      }
      state.translations[language][key] = value
    },
    
    removeTranslation: (state, action: PayloadAction<{ language: string; key: string }>) => {
      const { language, key } = action.payload
      if (state.translations[language]) {
        delete state.translations[language][key]
      }
    },
    
    initializeLocalization: (state, action: PayloadAction<{ language: string; supportedLanguages: string[] }>) => {
      const { language, supportedLanguages } = action.payload
      state.currentLanguage = language
      state.supportedLanguages = supportedLanguages
      localStorage.setItem('i18nextLng', language)
    },
    
    resetLocalization: (state) => {
      state.currentLanguage = 'en'
      state.isLoading = false
      state.translations = {}
      localStorage.removeItem('i18nextLng')
    }
  }
})

export const {
  setCurrentLanguage,
  setLoading,
  setSupportedLanguages,
  setTranslations,
  addTranslation,
  removeTranslation,
  initializeLocalization,
  resetLocalization
} = localizationSlice.actions

export default localizationSlice.reducer

// Selectors
export const selectCurrentLanguage = (state: { localization: LocalizationState }) => 
  state.localization.currentLanguage

export const selectSupportedLanguages = (state: { localization: LocalizationState }) => 
  state.localization.supportedLanguages

export const selectTranslations = (state: { localization: LocalizationState }) => 
  state.localization.translations

export const selectIsLocalizationLoading = (state: { localization: LocalizationState }) => 
  state.localization.isLoading