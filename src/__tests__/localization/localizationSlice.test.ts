import localizationReducer, {
  setCurrentLanguage,
  setLoading,
  setSupportedLanguages,
  setTranslations,
  addTranslation,
  removeTranslation,
  initializeLocalization,
  resetLocalization,
  selectCurrentLanguage,
  selectSupportedLanguages,
  selectTranslations,
  selectIsLocalizationLoading,
  LocalizationState
} from '@store/slices/localizationSlice'

describe('localizationSlice', () => {
  const initialState: LocalizationState = {
    currentLanguage: 'en',
    isLoading: false,
    supportedLanguages: ['en', 'ru', 'uk'],
    translations: {}
  }

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('should return the initial state', () => {
    expect(localizationReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle setCurrentLanguage', () => {
    const previousState = { ...initialState }
    const action = setCurrentLanguage('ru')
    
    const newState = localizationReducer(previousState, action)
    
    expect(newState.currentLanguage).toBe('ru')
    expect(localStorage.getItem('i18nextLng')).toBe('ru')
  })

  it('should handle setLoading', () => {
    const previousState = { ...initialState }
    const action = setLoading(true)
    
    const newState = localizationReducer(previousState, action)
    
    expect(newState.isLoading).toBe(true)
  })

  it('should handle setSupportedLanguages', () => {
    const previousState = { ...initialState }
    const newLanguages = ['en', 'ru', 'uk', 'fr']
    const action = setSupportedLanguages(newLanguages)
    
    const newState = localizationReducer(previousState, action)
    
    expect(newState.supportedLanguages).toEqual(newLanguages)
  })

  it('should handle setTranslations', () => {
    const previousState = { ...initialState }
    const translations = {
      en: { greeting: 'Hello' },
      ru: { greeting: 'Привет' }
    }
    const action = setTranslations(translations)
    
    const newState = localizationReducer(previousState, action)
    
    expect(newState.translations).toEqual(translations)
  })

  it('should handle addTranslation', () => {
    const previousState = { ...initialState, translations: {} }
    const action = addTranslation({
      language: 'en',
      key: 'greeting',
      value: 'Hello'
    })
    
    const newState = localizationReducer(previousState, action)
    
    expect(newState.translations).toEqual({
      en: { greeting: 'Hello' }
    })
  })

  it('should handle addTranslation to existing language', () => {
    const previousState = {
      ...initialState,
      translations: {
        en: { greeting: 'Hello' }
      }
    }
    const action = addTranslation({
      language: 'en',
      key: 'goodbye',
      value: 'Goodbye'
    })
    
    const newState = localizationReducer(previousState, action)
    
    expect(newState.translations).toEqual({
      en: { 
        greeting: 'Hello',
        goodbye: 'Goodbye'
      }
    })
  })

  it('should handle removeTranslation', () => {
    const previousState = {
      ...initialState,
      translations: {
        en: { 
          greeting: 'Hello',
          goodbye: 'Goodbye'
        }
      }
    }
    const action = removeTranslation({
      language: 'en',
      key: 'goodbye'
    })
    
    const newState = localizationReducer(previousState, action)
    
    expect(newState.translations).toEqual({
      en: { greeting: 'Hello' }
    })
  })

  it('should handle removeTranslation from non-existent language gracefully', () => {
    const previousState = { ...initialState, translations: {} }
    const action = removeTranslation({
      language: 'nonexistent',
      key: 'greeting'
    })
    
    const newState = localizationReducer(previousState, action)
    
    expect(newState.translations).toEqual({})
  })

  it('should handle initializeLocalization', () => {
    const previousState = { ...initialState }
    const action = initializeLocalization({
      language: 'ru',
      supportedLanguages: ['en', 'ru', 'uk', 'fr']
    })
    
    const newState = localizationReducer(previousState, action)
    
    expect(newState.currentLanguage).toBe('ru')
    expect(newState.supportedLanguages).toEqual(['en', 'ru', 'uk', 'fr'])
    expect(localStorage.getItem('i18nextLng')).toBe('ru')
  })

  it('should handle resetLocalization', () => {
    const previousState = {
      currentLanguage: 'ru',
      isLoading: true,
      supportedLanguages: ['en', 'ru', 'uk'],
      translations: {
        ru: { greeting: 'Привет' }
      }
    }
    
    // Set something in localStorage first
    localStorage.setItem('i18nextLng', 'ru')
    
    const action = resetLocalization()
    const newState = localizationReducer(previousState, action)
    
    expect(newState.currentLanguage).toBe('en')
    expect(newState.isLoading).toBe(false)
    expect(newState.translations).toEqual({})
    expect(localStorage.getItem('i18nextLng')).toBeNull()
  })

  describe('selectors', () => {
    const mockState = {
      localization: {
        currentLanguage: 'ru',
        isLoading: true,
        supportedLanguages: ['en', 'ru', 'uk'],
        translations: {
          en: { greeting: 'Hello' },
          ru: { greeting: 'Привет' }
        }
      }
    }

    it('should select current language', () => {
      expect(selectCurrentLanguage(mockState)).toBe('ru')
    })

    it('should select supported languages', () => {
      expect(selectSupportedLanguages(mockState)).toEqual(['en', 'ru', 'uk'])
    })

    it('should select translations', () => {
      expect(selectTranslations(mockState)).toEqual({
        en: { greeting: 'Hello' },
        ru: { greeting: 'Привет' }
      })
    })

    it('should select loading state', () => {
      expect(selectIsLocalizationLoading(mockState)).toBe(true)
    })
  })

  describe('localStorage integration', () => {
    it('should read initial language from localStorage', () => {
      localStorage.setItem('i18nextLng', 'ru')
      
      // Re-import to trigger initial state creation
      jest.resetModules()
      const { default: freshReducer } = require('@store/slices/localizationSlice')
      
      const state = freshReducer(undefined, { type: 'unknown' })
      expect(state.currentLanguage).toBe('ru')
    })

    it('should use default language when localStorage is empty', () => {
      localStorage.removeItem('i18nextLng')
      
      // Re-import to trigger initial state creation
      jest.resetModules()
      const { default: freshReducer } = require('@store/slices/localizationSlice')
      
      const state = freshReducer(undefined, { type: 'unknown' })
      expect(state.currentLanguage).toBe('en')
    })

    it('should persist language changes to localStorage', () => {
      const action = setCurrentLanguage('uk')
      localizationReducer(initialState, action)
      
      expect(localStorage.getItem('i18nextLng')).toBe('uk')
    })

    it('should remove from localStorage on reset', () => {
      localStorage.setItem('i18nextLng', 'ru')
      
      const action = resetLocalization()
      localizationReducer(initialState, action)
      
      expect(localStorage.getItem('i18nextLng')).toBeNull()
    })
  })
})