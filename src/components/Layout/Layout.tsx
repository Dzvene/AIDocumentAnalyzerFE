import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@store/index'
import { Header } from '../Header'
import { Footer } from '../Footer'
import './Layout.scss'

export const Layout: React.FC = () => {
  const { isDarkMode } = useSelector((state: RootState) => state.theme)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <div className="layout">
      <Header />
      
      <main className="layout__main">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
