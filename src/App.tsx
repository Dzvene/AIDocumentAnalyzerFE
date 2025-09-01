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
import DocumentAnalyzer from '@modules/DocumentAnalyzer'
import Login from '@modules/Login'
import { Register, ForgotPassword, GoogleCallback, EmailVerification } from '@modules/Auth'
import { FAQ } from '@modules/FAQ'
import Glossary from '@modules/Glossary'
import { Pricing } from '@modules/Pricing'
import { Profile } from '@components/Profile'
import { NotFound } from '@components/NotFound'

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch()

  useAuthInit()

  useEffect(() => {
    dispatch(initializeTheme())
  }, [dispatch])

  console.log('ping');

  return (
    <Router>
      <NotificationProvider />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />

          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/verify-email" element={<EmailVerification />} />

          <Route path={ROUTES.FAQ} element={<FAQ />} />
          <Route path={ROUTES.FAQ_QUESTION} element={<FAQ />} />

          <Route path={ROUTES.GLOSSARY} element={<Glossary />} />
          <Route path={ROUTES.GLOSSARY_TERM} element={<Glossary />} />

          <Route path="/pricing" element={<Pricing />} />

          <Route path="/analyze" element={<DocumentAnalyzer />} />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <Navigate to="/analyze" replace />
          } />
        </Route>

        <Route path="*" element={<NotFound />} />
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
