import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { I18nextProvider } from 'react-i18next'
import i18n from '@localization/index'
import { LanguageSelector } from '@components/LanguageSelector'
import localizationSlice from '@store/slices/localizationSlice'
import notificationSlice from '@store/slices/notificationSlice'

// Mock useNotification hook
jest.mock('@hooks/useNotification', () => ({
  useNotification: () => ({
    success: jest.fn(),
    error: jest.fn()
  })
}))

// Create test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      localization: localizationSlice,
      notification: notificationSlice
    },
    preloadedState: {
      localization: {
        currentLanguage: 'en',
        isLoading: false,
        supportedLanguages: ['en', 'ru', 'uk'],
        translations: {}
      },
      notification: {
        notifications: []
      },
      ...initialState
    }
  })
}

const renderWithProviders = (
  ui: React.ReactElement,
  { store = createTestStore() } = {}
) => {
  return render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        {ui}
      </I18nextProvider>
    </Provider>
  )
}

describe('LanguageSelector', () => {
  beforeEach(() => {
    // Reset i18n language before each test
    i18n.changeLanguage('en')
  })

  afterEach(() => {
    // Clear any lingering timers or effects
    jest.clearAllTimers()
  })

  it('renders language selector button', () => {
    renderWithProviders(<LanguageSelector />)
    
    const button = screen.getByRole('button', { name: /select language/i })
    expect(button).toBeInTheDocument()
    
    // Should show current language flag and code
    expect(screen.getByText('🇺🇸')).toBeInTheDocument()
    expect(screen.getByText('EN')).toBeInTheDocument()
  })

  it('opens dropdown when button is clicked', () => {
    renderWithProviders(<LanguageSelector />)
    
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)
    
    // Should show dropdown with language options
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Русский')).toBeInTheDocument()
    expect(screen.getByText('Українська')).toBeInTheDocument()
  })

  it('highlights current language in dropdown', () => {
    renderWithProviders(<LanguageSelector />)
    
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)
    
    const activeOption = screen.getByRole('option', { selected: true })
    expect(activeOption).toHaveTextContent('English')
    expect(activeOption).toHaveClass('language-selector__option--active')
  })

  it('changes language when option is selected', async () => {
    renderWithProviders(<LanguageSelector />)
    
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)
    
    const russianOption = screen.getByRole('option', { name: /русский/i })
    fireEvent.click(russianOption)
    
    await waitFor(() => {
      expect(i18n.language).toBe('ru')
    })
  })

  it('closes dropdown after language selection', async () => {
    renderWithProviders(<LanguageSelector />)
    
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)
    
    const russianOption = screen.getByRole('option', { name: /русский/i })
    fireEvent.click(russianOption)
    
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  it('closes dropdown when clicking outside', () => {
    renderWithProviders(<LanguageSelector />)
    
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)
    
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    
    // Click outside the component
    fireEvent.mouseDown(document.body)
    
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes dropdown when escape key is pressed', () => {
    renderWithProviders(<LanguageSelector />)
    
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)
    
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('updates button display when language changes', async () => {
    renderWithProviders(<LanguageSelector />)
    
    // Initially shows EN
    expect(screen.getByText('EN')).toBeInTheDocument()
    expect(screen.getByText('🇺🇸')).toBeInTheDocument()
    
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)
    
    const russianOption = screen.getByRole('option', { name: /русский/i })
    fireEvent.click(russianOption)
    
    await waitFor(() => {
      expect(screen.getByText('RU')).toBeInTheDocument()
      expect(screen.getByText('🇷🇺')).toBeInTheDocument()
    })
  })

  it('updates document attributes when language changes', async () => {
    renderWithProviders(<LanguageSelector />)
    
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)
    
    const russianOption = screen.getByRole('option', { name: /русский/i })
    fireEvent.click(russianOption)
    
    await waitFor(() => {
      expect(document.documentElement.getAttribute('lang')).toBe('ru')
      expect(document.documentElement.getAttribute('dir')).toBe('ltr')
    })
  })

  it('has proper accessibility attributes', () => {
    renderWithProviders(<LanguageSelector />)
    
    const button = screen.getByRole('button', { name: /select language/i })
    
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveAttribute('aria-haspopup', 'listbox')
    
    fireEvent.click(button)
    
    expect(button).toHaveAttribute('aria-expanded', 'true')
    
    const dropdown = screen.getByRole('listbox')
    expect(dropdown).toHaveAttribute('aria-label', 'Select Language')
    
    const options = screen.getAllByRole('option')
    options.forEach((option, index) => {
      expect(option).toHaveAttribute('aria-selected')
    })
  })

  it('maintains keyboard navigation support', () => {
    renderWithProviders(<LanguageSelector />)
    
    const button = screen.getByRole('button', { name: /select language/i })
    
    // Button should be focusable
    button.focus()
    expect(button).toHaveFocus()
    
    fireEvent.click(button)
    
    const options = screen.getAllByRole('option')
    
    // All options should be keyboard accessible
    options.forEach(option => {
      option.focus()
      expect(option).toHaveFocus()
    })
  })

  it('handles language change errors gracefully', async () => {
    const mockNotification = {
      success: jest.fn(),
      error: jest.fn()
    }
    
    jest.mocked(require('@hooks/useNotification').useNotification).mockReturnValue(mockNotification)
    
    // Mock i18n to throw an error
    const originalChangeLanguage = i18n.changeLanguage
    i18n.changeLanguage = jest.fn().mockRejectedValue(new Error('Language change failed'))
    
    renderWithProviders(<LanguageSelector />)
    
    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)
    
    const russianOption = screen.getByRole('option', { name: /русский/i })
    fireEvent.click(russianOption)
    
    await waitFor(() => {
      expect(mockNotification.error).toHaveBeenCalledWith('Something went wrong. Please try again.')
    })
    
    // Restore original function
    i18n.changeLanguage = originalChangeLanguage
  })
})