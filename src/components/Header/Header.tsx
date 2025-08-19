import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { logoutAsync } from '@store/slices/authSlice'
import { selectTotalItemsCount } from '@store/slices/multiCartSlice'
import { toggleTheme } from '@store/slices/themeSlice'
import { setCurrentLanguage } from '@store/slices/localizationSlice'
import { ROUTES } from '@constants/routes'
import { useNotification } from '@hooks/useNotification'
// import { LanguageSelector } from '@components/LanguageSelector'
// import ThemeToggle from '@components/common/ThemeToggle'
// import LanguageToggle from '@components/common/LanguageToggle'
import './Header.scss'

interface HeaderProps {
  onMenuToggle?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const notification = useNotification()
  const { t, i18n } = useTranslation()
  
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const cartItemCount = useAppSelector(selectTotalItemsCount)
  const { isDarkMode } = useAppSelector((state) => state.theme)
  const { currentLanguage } = useAppSelector((state) => state.localization)

  // Debug log
  console.log('Header rendered with theme:', isDarkMode, 'language:', currentLanguage)

  const navItems = [
    { path: ROUTES.HOME, label: t('navigation.home') },
    // { path: ROUTES.CATEGORIES, label: t('navigation.categories') }, // Временно скрыто
    { path: ROUTES.VENDORS, label: t('navigation.shops') },
    { path: ROUTES.OFFERS, label: t('navigation.offers') },
    // { path: ROUTES.BLOG, label: t('navigation.blog') }, // Временно скрыто
    { path: ROUTES.ABOUT_US, label: t('navigation.about') },
    { path: ROUTES.CONTACT_US, label: t('navigation.contact') },
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync()).unwrap()
      notification.success(t('auth.logoutSuccess'))
      navigate(ROUTES.HOME)
    } catch (error) {
      notification.error(t('errors.generic'))
    }
  }

  const handleThemeToggle = () => {
    dispatch(toggleTheme())
  }

  const handleLanguageChange = async (lang: string) => {
    dispatch(setCurrentLanguage(lang))
    await i18n.changeLanguage(lang)
    setShowLangMenu(false)
  }

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' }
  ]

  const currentLang = languages.find(l => l.code === currentLanguage) || languages[0]

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__left">
          <Link to={ROUTES.HOME} className="header__logo">
            <span className="header__logo-text">OnLimitShop</span>
          </Link>
        </div>
        
        <nav className={`header__nav ${isMobileMenuOpen ? 'header__nav--mobile-open' : ''}`}>
          <ul className="header__nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="header__nav-item">
                <Link 
                  to={item.path} 
                  className={`header__nav-link ${location.pathname === item.path ? 'header__nav-link--active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__right">
          {/* TODO: Implement theme toggle
          <button 
            className="header__theme-btn"
            onClick={handleThemeToggle}
            aria-label="Toggle theme"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          */}
          
          {/* Language Toggle Button */}
          <div className="header__lang-wrapper">
            <button 
              className="header__lang-btn"
              onClick={() => setShowLangMenu(!showLangMenu)}
              aria-label="Toggle language"
            >
              {currentLang.flag} {currentLang.code.toUpperCase()}
            </button>
            
            {showLangMenu && (
              <div className="header__lang-dropdown">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    className={`header__lang-option ${lang.code === currentLanguage ? 'header__lang-option--active' : ''}`}
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    {lang.flag} {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <Link to={ROUTES.SEARCH} className="header__search-btn" aria-label={t('common.search')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11.7659" cy="11.7666" r="8.98856" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.0176 18.4852L21.5416 22.0001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          
          <Link to={ROUTES.CART} className="header__cart-btn" aria-label={t('navigation.cart')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {cartItemCount > 0 && <span className="header__cart-count">{cartItemCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="header__user-menu">
              <button 
                className="header__user-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="header__user-text">{user?.name || t('navigation.profile')}</span>
              </button>
              
              {showUserMenu && (
                <div className="header__dropdown">
                  <Link 
                    to={ROUTES.USER_DASHBOARD} 
                    className="header__dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    {t('navigation.dashboard')}
                  </Link>
                  <Link 
                    to={ROUTES.USER_ORDERS} 
                    className="header__dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    {t('navigation.orders')}
                  </Link>
                  <Link 
                    to={ROUTES.USER_PROFILE} 
                    className="header__dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    {t('profile.settings')}
                  </Link>
                  <button 
                    className="header__dropdown-item header__dropdown-item--logout"
                    onClick={handleLogout}
                  >
                    {t('common.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to={ROUTES.LOGIN} className="header__user-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="header__user-text">{t('common.login')}</span>
            </Link>
          )}

          <button 
            className="header__menu-toggle"
            onClick={toggleMobileMenu}
            aria-label={t('common.menu')}
          >
            <span className={`header__menu-icon ${isMobileMenuOpen ? 'header__menu-icon--open' : ''}`}></span>
            <span className={`header__menu-icon ${isMobileMenuOpen ? 'header__menu-icon--open' : ''}`}></span>
            <span className={`header__menu-icon ${isMobileMenuOpen ? 'header__menu-icon--open' : ''}`}></span>
          </button>
        </div>
      </div>
    </header>
  )
}