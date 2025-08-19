import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import authSlice from './slices/authSlice'
import themeSlice from './slices/themeSlice'
import notificationSlice from './slices/notificationSlice'
import localizationSlice from './slices/localizationSlice'
import shopsSlice from './slices/shopsSlice'
import ordersSlice from './slices/ordersSlice'
import usersSlice from './slices/usersSlice'
import adminSlice from './slices/adminSlice'
import wishlistSlice from './slices/wishlistSlice'
import addressesSlice from './slices/addressesSlice'
import reviewsSlice from './slices/reviewsSlice'
import searchSlice from './slices/searchSlice'
import categoriesSlice from './slices/categoriesSlice'
import blogSlice from './slices/blogSlice'
import offersSlice from './slices/offersSlice'
import paymentSlice from './slices/paymentSlice'
import locationSlice from './slices/locationSlice'
import multiCartSlice from './slices/multiCartSlice'
import deliverySlice from './slices/deliverySlice'
import shoppingListSlice from './slices/shoppingListSlice'
import advertisingSlice from './slices/advertisingSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'theme', 'localization', 'wishlist', 'search', 'addresses', 'location', 'multiCart', 'shoppingList', 'advertising'],
}

const rootReducer = {
  auth: persistReducer(persistConfig, authSlice),
  theme: themeSlice,
  notification: notificationSlice,
  localization: localizationSlice,
  shops: shopsSlice,
  orders: ordersSlice,
  users: usersSlice,
  admin: adminSlice,
  wishlist: persistReducer(persistConfig, wishlistSlice),
  addresses: persistReducer(persistConfig, addressesSlice),
  reviews: reviewsSlice,
  search: persistReducer(persistConfig, searchSlice),
  categories: categoriesSlice,
  blog: blogSlice,
  offers: offersSlice,
  payment: paymentSlice,
  location: persistReducer(persistConfig, locationSlice),
  multiCart: persistReducer(persistConfig, multiCartSlice),
  delivery: deliverySlice,
  shoppingList: persistReducer(persistConfig, shoppingListSlice),
  advertising: persistReducer(persistConfig, advertisingSlice),
}

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch