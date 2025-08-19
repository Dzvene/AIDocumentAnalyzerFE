import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { BrowserRouter } from 'react-router-dom'
import { store } from '@store/store'
import i18n from '@localization/index'
import { Header } from '@components/Header'

// Mock useNotification hook
jest.mock('@hooks/useNotification', () => ({
  useNotification: () => ({
    success: jest.fn(),
    error: jest.fn()
  })
}))

// Mock useAuthInit hook
jest.mock('@hooks/useAuthInit', () => ({
  useAuthInit: () => {}
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </I18nextProvider>
  </Provider>
)

describe('Localization Integration', () => {
  beforeEach(() => {
    // Reset i18n language before each test
    i18n.changeLanguage('en')
    localStorage.clear()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('integrates with Header component properly', async () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Check that navigation items are rendered with English translations
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.getByText('Shops')).toBeInTheDocument()
    expect(screen.getByText('Offers')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText('About Us')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()

    // Find and click language selector
    const languageButton = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(languageButton)

    // Select Russian
    const russianOption = screen.getByRole('option', { name: /русский/i })
    fireEvent.click(russianOption)

    // Wait for language change to complete
    await waitFor(() => {
      expect(i18n.language).toBe('ru')
    })

    // Check that navigation items are now in Russian
    await waitFor(() => {
      expect(screen.getByText('Главная')).toBeInTheDocument()
      expect(screen.getByText('Категории')).toBeInTheDocument()
      expect(screen.getByText('Магазины')).toBeInTheDocument()
      expect(screen.getByText('Акции')).toBeInTheDocument()
      expect(screen.getByText('Блог')).toBeInTheDocument()
      expect(screen.getByText('О нас')).toBeInTheDocument()
      expect(screen.getByText('Контакты')).toBeInTheDocument()
    })
  })

  it('persists language selection across page reloads', async () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Initially should be English
    expect(screen.getByText('Home')).toBeInTheDocument()

    // Change to Ukrainian
    const languageButton = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(languageButton)

    const ukrainianOption = screen.getByRole('option', { name: /українська/i })
    fireEvent.click(ukrainianOption)

    await waitFor(() => {
      expect(i18n.language).toBe('uk')
    })

    // Check localStorage
    expect(localStorage.getItem('i18nextLng')).toBe('uk')

    // Simulate page reload by re-rendering with new i18n instance
    i18n.changeLanguage('uk')
    
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Should show Ukrainian translations
    await waitFor(() => {
      expect(screen.getByText('Головна')).toBeInTheDocument()
      expect(screen.getByText('Категорії')).toBeInTheDocument()
    })
  })

  it('updates document attributes correctly', async () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Initially should have English attributes
    expect(document.documentElement.getAttribute('lang')).toBe('en')
    expect(document.documentElement.getAttribute('dir')).toBe('ltr')

    // Change language
    const languageButton = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(languageButton)

    const russianOption = screen.getByRole('option', { name: /русский/i })
    fireEvent.click(russianOption)

    await waitFor(() => {
      expect(document.documentElement.getAttribute('lang')).toBe('ru')
      expect(document.documentElement.getAttribute('dir')).toBe('ltr')
    })
  })

  it('handles rapid language switching', async () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    const languageButton = screen.getByRole('button', { name: /select language/i })

    // Rapidly switch languages
    fireEvent.click(languageButton)
    const russianOption = screen.getByRole('option', { name: /русский/i })
    fireEvent.click(russianOption)

    await waitFor(() => {
      expect(i18n.language).toBe('ru')
    })

    fireEvent.click(languageButton)
    const ukrainianOption = screen.getByRole('option', { name: /українська/i })
    fireEvent.click(ukrainianOption)

    await waitFor(() => {
      expect(i18n.language).toBe('uk')
    })

    fireEvent.click(languageButton)
    const englishOption = screen.getByRole('option', { name: /english/i })
    fireEvent.click(englishOption)

    await waitFor(() => {
      expect(i18n.language).toBe('en')
    })

    // Final state should be stable
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(document.documentElement.getAttribute('lang')).toBe('en')
  })

  it('maintains state consistency across components', async () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Check initial state
    expect(screen.getByText('EN')).toBeInTheDocument() // Language selector shows EN
    expect(screen.getByText('Home')).toBeInTheDocument() // Navigation shows English

    // Change language
    const languageButton = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(languageButton)

    const russianOption = screen.getByRole('option', { name: /русский/i })
    fireEvent.click(russianOption)

    await waitFor(() => {
      // Both components should update consistently
      expect(screen.getByText('RU')).toBeInTheDocument() // Language selector updated
      expect(screen.getByText('Главная')).toBeInTheDocument() // Navigation updated
    })
  })

  it('handles missing translations gracefully', async () => {
    // Mock a translation key that doesn't exist
    const originalT = i18n.t
    i18n.t = jest.fn().mockImplementation((key: string) => {
      if (key === 'test.missing') {
        return key // i18next returns the key when translation is missing
      }
      return originalT(key)
    })

    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Component should still render normally even with missing translations
    expect(screen.getByText('Home')).toBeInTheDocument()

    // Restore original function
    i18n.t = originalT
  })

  it('works with different viewport sizes', async () => {
    // Test mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 480,
    })
    window.dispatchEvent(new Event('resize'))

    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    // Language selector should still work on mobile
    const languageButton = screen.getByRole('button', { name: /select language/i })
    expect(languageButton).toBeInTheDocument()

    fireEvent.click(languageButton)
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    // Restore viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
    window.dispatchEvent(new Event('resize'))
  })

  it('supports keyboard navigation', async () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    )

    const languageButton = screen.getByRole('button', { name: /select language/i })
    
    // Focus and activate with keyboard
    languageButton.focus()
    expect(languageButton).toHaveFocus()

    fireEvent.keyDown(languageButton, { key: 'Enter' })
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    // Navigate options with keyboard
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3)

    // Tab through options
    options.forEach(option => {
      option.focus()
      expect(option).toHaveFocus()
    })

    // Close with Escape
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})