import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { I18nextProvider } from 'react-i18next'
import { useLocalization } from '@hooks/useLocalization'
import localizationSlice from '@store/slices/localizationSlice'
import i18n from '@localization/index'
import React from 'react'

// Create test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      localization: localizationSlice
    },
    preloadedState: {
      localization: {
        currentLanguage: 'en',
        isLoading: false,
        supportedLanguages: ['en', 'ru', 'uk'],
        translations: {}
      },
      ...initialState
    }
  })
}

const createWrapper = (store = createTestStore()) => {
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </Provider>
  )
}

describe('useLocalization', () => {
  beforeEach(() => {
    // Reset i18n language before each test
    i18n.changeLanguage('en')
    // Clear localStorage
    localStorage.clear()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('returns initial localization state', () => {
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper()
    })

    expect(result.current.currentLanguage).toBe('en')
    expect(result.current.supportedLanguages).toEqual(['en', 'ru', 'uk'])
    expect(typeof result.current.changeLanguage).toBe('function')
    expect(typeof result.current.getLanguageName).toBe('function')
    expect(typeof result.current.isLanguageSupported).toBe('function')
    expect(typeof result.current.getLanguageDirection).toBe('function')
  })

  it('changes language successfully', async () => {
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper()
    })

    await act(async () => {
      const success = await result.current.changeLanguage('ru')
      expect(success).toBe(true)
    })

    expect(result.current.currentLanguage).toBe('ru')
    expect(i18n.language).toBe('ru')
    expect(document.documentElement.getAttribute('lang')).toBe('ru')
    expect(document.documentElement.getAttribute('dir')).toBe('ltr')
  })

  it('handles language change errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock i18n to throw an error
    const originalChangeLanguage = i18n.changeLanguage
    i18n.changeLanguage = jest.fn().mockRejectedValue(new Error('Language change failed'))
    
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper()
    })

    await act(async () => {
      const success = await result.current.changeLanguage('ru')
      expect(success).toBe(false)
    })

    expect(consoleSpy).toHaveBeenCalledWith('Failed to change language:', expect.any(Error))
    
    // Restore original function
    i18n.changeLanguage = originalChangeLanguage
    consoleSpy.mockRestore()
  })

  it('gets language names correctly', () => {
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper()
    })

    expect(result.current.getLanguageName('en')).toBe('English')
    expect(result.current.getLanguageName('ru')).toBe('Russian')
    expect(result.current.getLanguageName('uk')).toBe('Ukrainian')
    
    expect(result.current.getLanguageName('en', true)).toBe('English')
    expect(result.current.getLanguageName('ru', true)).toBe('Русский')
    expect(result.current.getLanguageName('uk', true)).toBe('Українська')
    
    expect(result.current.getLanguageName('unknown')).toBe('unknown')
  })

  it('checks if language is supported', () => {
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper()
    })

    expect(result.current.isLanguageSupported('en')).toBe(true)
    expect(result.current.isLanguageSupported('ru')).toBe(true)
    expect(result.current.isLanguageSupported('uk')).toBe(true)
    expect(result.current.isLanguageSupported('fr')).toBe(false)
    expect(result.current.isLanguageSupported('unknown')).toBe(false)
  })

  it('gets language direction correctly', () => {
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper()
    })

    expect(result.current.getLanguageDirection('en')).toBe('ltr')
    expect(result.current.getLanguageDirection('ru')).toBe('ltr')
    expect(result.current.getLanguageDirection('uk')).toBe('ltr')
    expect(result.current.getLanguageDirection('ar')).toBe('rtl')
    expect(result.current.getLanguageDirection('he')).toBe('rtl')
    expect(result.current.getLanguageDirection('fa')).toBe('rtl')
  })

  it('initializes with detected language from i18n', () => {
    // Set up i18n with a different language
    i18n.changeLanguage('ru')
    
    const store = createTestStore({
      localization: {
        currentLanguage: 'en', // Different from i18n
        isLoading: false,
        supportedLanguages: ['en', 'ru', 'uk'],
        translations: {}
      }
    })

    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper(store)
    })

    // Should sync with i18n language
    expect(result.current.currentLanguage).toBe('ru')
  })

  it('syncs Redux state when i18n language changes externally', async () => {
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper()
    })

    expect(result.current.currentLanguage).toBe('en')

    // Change language directly through i18n
    await act(async () => {
      await i18n.changeLanguage('uk')
    })

    expect(result.current.currentLanguage).toBe('uk')
  })

  it('updates HTML attributes when changing language', async () => {
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper()
    })

    await act(async () => {
      await result.current.changeLanguage('ru')
    })

    expect(document.documentElement.getAttribute('lang')).toBe('ru')
    expect(document.documentElement.getAttribute('dir')).toBe('ltr')

    await act(async () => {
      await result.current.changeLanguage('ar')
    })

    expect(document.documentElement.getAttribute('lang')).toBe('ar')
    expect(document.documentElement.getAttribute('dir')).toBe('rtl')
  })

  it('provides access to translation function', () => {
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper()
    })

    expect(typeof result.current.t).toBe('function')
    expect(typeof result.current.i18n).toBe('object')
    
    // Test basic translation
    expect(result.current.t('common.loading')).toBe('Loading...')
  })

  it('handles missing translations gracefully', () => {
    const { result } = renderHook(() => useLocalization(), {
      wrapper: createWrapper()
    })

    // Should return the key when translation is missing
    expect(result.current.t('nonexistent.key')).toBe('nonexistent.key')
  })
})