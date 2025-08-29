import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { logout } from '@store/slices/authSlice'
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from '@components/LanguageSelector'
import { UserBalance } from '@components/UserBalance'
import './Header.scss'

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const navLinks = [
    { path: '/', label: t('navigation.home'), public: true },
    { path: '/analyze', label: 'Analyze Document', public: true },
    { path: '/profile', label: t('navigation.profile') || 'Profile', public: false },
  ]

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          <span className="header__logo-icon">🤖</span>
          <span className="header__logo-text">AI Document Analyzer</span>
        </Link>

        <nav className={`header__nav ${isMobileMenuOpen ? 'header__nav--open' : ''}`}>
          <ul className="header__nav-list">
            {navLinks.map(link => {
              if (!link.public && !isAuthenticated) return null
              
              return (
                <li key={link.path} className="header__nav-item">
                  <Link 
                    to={link.path} 
                    className={`header__nav-link ${isActive(link.path) ? 'header__nav-link--active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="header__actions">
          <LanguageSelector />
          
          {isAuthenticated && (
            <UserBalance 
              size="small" 
              onClick={() => navigate('/pricing')}
              showAddFunds={true}
            />
          )}

          {isAuthenticated ? (
            <div className="header__user">
              <Link 
                to="/profile" 
                className="header__user-info"
                title="Go to Profile"
              >
                <span className="header__user-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
                <span className="header__user-name">{user?.name || 'User'}</span>
              </Link>
              <button 
                className="header__logout-btn"
                onClick={handleLogout}
              >
                {t('common.logout')}
              </button>
            </div>
          ) : (
            <div className="header__auth-buttons">
              <Link 
                to="/login" 
                className="header__login-btn"
              >
                {t('common.login')}
              </Link>
              <Link 
                to="/register" 
                className="header__register-btn"
              >
                {t('common.register')}
              </Link>
            </div>
          )}

          <button 
            className="header__mobile-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span className={`header__burger ${isMobileMenuOpen ? 'header__burger--open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}