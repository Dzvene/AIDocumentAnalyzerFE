import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import '@localization/index'

import { store, persistor } from '@store/store'
import { useAppDispatch } from '@store/hooks'
import { initializeTheme } from '@store/slices/themeSlice'
import { ROUTES } from '@constants/routes'
import { useAuthInit } from '@hooks/useAuthInit'

import { LoadingSpinner, Layout, ProtectedRoute } from '@components'
import NotificationProvider from '@components/NotificationProvider'

import { Home } from '@modules/Home'
import { Dashboard } from '@modules/Dashboard'
import Login from '@modules/Login'
import { Register, ForgotPassword } from '@modules/Auth'

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch()
  
  useAuthInit()

  useEffect(() => {
    dispatch(initializeTheme())
  }, [dispatch])

  return (
    <Router>
      <NotificationProvider />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/upload" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh',
            textAlign: 'center'
          }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
            <h2 style={{ fontSize: '1.5rem', color: '#666', marginBottom: '2rem' }}>
              Страница не найдена
            </h2>
            <a href="/" style={{ 
              color: '#667eea', 
              textDecoration: 'none',
              fontSize: '1.1rem',
              padding: '10px 20px',
              border: '2px solid #667eea',
              borderRadius: '8px',
              transition: 'all 0.3s'
            }}>
              Вернуться на главную
            </a>
          </div>
        } />
      </Routes>
    </Router>
  )
}

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner fullScreen />} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  )
}

export default App