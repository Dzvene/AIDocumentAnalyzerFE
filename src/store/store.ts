import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import authReducer from './slices/authSlice'
import themeSlice from './slices/themeSlice'
import notificationSlice from './slices/notificationSlice'
import documentsSlice from './slices/documentsSlice'
import analysisSlice from './slices/analysisSlice'

const authPersistConfig = {
  key: 'auth',
  storage,
}

const themePersistConfig = {
  key: 'theme',
  storage,
}

const rootReducer = {
  auth: persistReducer(authPersistConfig, authReducer),
  theme: persistReducer(themePersistConfig, themeSlice),
  notification: notificationSlice,
  documents: documentsSlice,
  analysis: analysisSlice,
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