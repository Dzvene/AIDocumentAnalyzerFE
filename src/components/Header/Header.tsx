import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { logout } from '@store/slices/authSlice'
import { toggleTheme } from '@store/slices/themeSlice'
import './Header.scss'

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const { isDarkMode } = useAppSelector((state) => state.theme)

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleThemeToggle = () => {
    dispatch(toggleTheme())
  }

  const navLinks = [
    { path: '/', label: 'Главная', public: true },
    { path: '/dashboard', label: 'Панель управления', public: false },
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
          <button 
            className="header__theme-toggle"
            onClick={handleThemeToggle}
            aria-label="Toggle theme"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {isAuthenticated ? (
            <div className="header__user">
              <div className="header__user-info">
                <span className="header__user-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
                <span className="header__user-name">{user?.name || 'User'}</span>
              </div>
              <button 
                className="header__logout-btn"
                onClick={handleLogout}
              >
                Выйти
              </button>
            </div>
          ) : (
            <div className="header__auth-buttons">
              <Link 
                to="/login" 
                className="header__login-btn"
              >
                Войти
              </Link>
              <Link 
                to="/register" 
                className="header__register-btn"
              >
                Регистрация
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