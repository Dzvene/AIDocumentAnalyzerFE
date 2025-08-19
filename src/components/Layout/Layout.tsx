import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@store/index'
import { Header } from '../Header'
import { Sidebar } from '../Sidebar'
import { Footer } from '../Footer'
import './Layout.scss'

export const Layout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { isDarkMode } = useSelector((state: RootState) => state.theme)

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <div className="layout">
      <Header onMenuToggle={handleSidebarToggle} />

      <div className={`layout__container ${isSidebarCollapsed ? 'layout__container--collapsed' : ''}`}>
        <main className="layout__main">
          <Outlet />
        </main>

      </div>
      <Footer />
    </div>
  )
}
