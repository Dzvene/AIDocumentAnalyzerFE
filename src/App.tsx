import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

// Initialize i18next
import '@localization/index'

import { store, persistor } from '@store/store'
import { useAppDispatch } from '@store/hooks'
import { initializeTheme } from '@store/slices/themeSlice'
import { ROUTES } from '@constants/routes'
import { useAuthInit } from '@hooks/useAuthInit'

import { LoadingSpinner, Layout, ProtectedRoute } from '@components'
import NotificationProvider from '@components/NotificationProvider'

// Public pages
import { Home } from '@modules/Home'
// import { Categories } from '@modules/Categories' // Временно отключено
import { About } from '@modules/About'
import { Offers } from '@modules/Offers'
import { Contact } from '@modules/Contact'

// Blog modules
import { Blog } from '@modules/Blog'
import { BlogPost } from '@modules/BlogPost'

// Shops modules
import { AllShops } from '@modules/AllShops'
import { Shop } from '@modules/Shop'
import { Search } from '@modules/Search'

// Cart & Checkout modules
import { Cart } from '@modules/Cart'
import { Checkout } from '@modules/Checkout'

// Auth modules
import { Login } from '@modules/Login'
import { Register, ForgotPassword } from '@modules/Auth'

// User modules
import { UserDashboard } from '@modules/UserDashboard'
import { UserProfile } from '@modules/UserProfile'
import { OrderHistory } from '@modules/OrderHistory'
import { OrderDetails } from '@modules/OrderDetails'
import { Wishlist } from '@modules/Wishlist'
import { UserAddresses } from '@modules/UserAddresses'
import { UserReviews } from '@modules/UserReviews'
import { ChangePassword } from '@modules/ChangePassword'
import { ResetPassword } from '@modules/ResetPassword'
import { Payment } from '@modules/Payment'

// Admin modules
import { AdminDashboard } from '@modules/AdminDashboard'

// Legal pages
import { PrivacyPolicy } from '@modules/PrivacyPolicy'
import { TermsAndConditions } from '@modules/TermsAndConditions'

// Other pages
import { NotFound } from '@modules/NotFound'

// TODO: Import other modules as they are created

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch()
  
  // Initialize authentication
  useAuthInit()

  useEffect(() => {
    // Initialize theme
    dispatch(initializeTheme())
  }, [dispatch])

  return (
    <Router>
      <NotificationProvider />
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route index element={<Home />} />
          {/* <Route path={ROUTES.CATEGORIES} element={<Categories />} /> Временно отключено */}
          <Route path={ROUTES.ABOUT_US} element={<About />} />
          <Route path={ROUTES.OFFERS} element={<Offers />} />
          <Route path={ROUTES.CONTACT_US} element={<Contact />} />
          <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicy />} />
          <Route path={ROUTES.TERMS_CONDITIONS} element={<TermsAndConditions />} />

          {/* Blog routes */}
          <Route path={ROUTES.BLOG} element={<Blog />} />
          <Route path={`${ROUTES.BLOG}/:id`} element={<BlogPost />} />
          
          {/* Vendors routes */}
          <Route path={ROUTES.VENDORS} element={<AllShops />} />
          <Route path="/shop/:id" element={<Shop />} />
          <Route path={ROUTES.SEARCH} element={<Search />} />
          
          {/* Cart & Checkout routes */}
          <Route path={ROUTES.CART} element={<Cart />} />
          <Route path={ROUTES.CHECKOUT} element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          
          {/* TODO: Add other routes as modules are created */}

          {/* Auth routes */}
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

          {/* Protected routes */}
          <Route path={ROUTES.USER_DASHBOARD} element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path={ROUTES.USER_PROFILE} element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path={ROUTES.USER_ORDERS} element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
          <Route path={ROUTES.USER_ADDRESSES} element={<ProtectedRoute><UserAddresses /></ProtectedRoute>} />
          <Route path={ROUTES.USER_WISHLIST} element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path={ROUTES.USER_REVIEWS} element={<ProtectedRoute><UserReviews /></ProtectedRoute>} />
          <Route path={ROUTES.USER_CHANGE_PASSWORD} element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/user/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />

          {/* Payment route */}
          <Route path={ROUTES.PAYMENT} element={<ProtectedRoute><Payment /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

          {/* Shop owner routes */}
          {/* <Route path={ROUTES.SHOP_DASHBOARD} element={<ShopRoute><ShopDashboard /></ShopRoute>} />
          <Route path={ROUTES.SHOP_PROFILE} element={<ShopRoute><ShopProfile /></ShopRoute>} />
          <Route path={ROUTES.SHOP_PRODUCTS} element={<ShopRoute><ShopProducts /></ShopRoute>} />
          <Route path={ROUTES.SHOP_ORDERS} element={<ShopRoute><ShopOrders /></ShopRoute>} />
          <Route path={ROUTES.SHOP_CATEGORIES} element={<ShopRoute><ShopCategories /></ShopRoute>} /> */}
        </Route>

        {/* 404 route */}
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
