import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { RootState } from '@store/index'
import { logout } from '@store/slices/authSlice'
import LanguageToggle from '@components/common/LanguageToggle'

const Header: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const { items: cartItems } = useSelector((state: RootState) => state.cart)
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist)

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistItemsCount = wishlistItems.length

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
      navigate('/')
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="flex items-center space-x-2"
              aria-label={t('navigation.home')}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                AI Document Analyzer
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder={t('search.placeholder')}
                className={`
                  w-full px-4 py-2 pl-10 pr-4 text-gray-900 dark:text-white 
                  bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                `}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/products"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              {t('navigation.products')}
            </Link>
            <Link
              to="/categories"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              {t('navigation.categories')}
            </Link>
            <Link
              to="/vendors"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              {t('navigation.vendors')}
            </Link>
            <Link
              to="/faq"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              {t('navigation.faq')}
            </Link>
            <Link
              to="/glossary"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              {t('navigation.glossary')}
            </Link>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <LanguageToggle />

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              aria-label={t('navigation.wishlist')}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {wishlistItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistItemsCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              aria-label={t('cart.title')}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
                />
              </svg>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t('navigation.profile')}
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t('order.title')}
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t('navigation.settings')}
                    </Link>
                    <hr className="border-gray-200 dark:border-gray-600 my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t('navigation.logout')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  {t('navigation.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
                >
                  {t('navigation.register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            {/* Mobile Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder={t('search.placeholder')}
                className={`
                  w-full px-4 py-2 text-gray-900 dark:text-white 
                  bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                `}
              />
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <Link
                to="/products"
                className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navigation.products')}
              </Link>
              <Link
                to="/categories"
                className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navigation.categories')}
              </Link>
              <Link
                to="/vendors"
                className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navigation.vendors')}
              </Link>
              <Link
                to="/faq"
                className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navigation.faq')}
              </Link>
              <Link
                to="/glossary"
                className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navigation.glossary')}
              </Link>
              
              {!isAuthenticated && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('navigation.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('navigation.register')}
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header