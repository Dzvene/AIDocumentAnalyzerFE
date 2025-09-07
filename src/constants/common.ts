export const APP_NAME = 'AI Document Analyzer'

export const DEFAULT_PAGE_SIZE = 20

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://api.clearcontract.io'

export const TOKEN_STORAGE_KEY = 'auth_token'
export const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token'
export const USER_STORAGE_KEY = 'user_data'

export const THEME_STORAGE_KEY = 'theme_preference'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
] as const

export const DEFAULT_LANGUAGE = 'en'

export const DATE_FORMAT = 'DD/MM/YYYY'
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm'

export const NOTIFICATION_DURATION = 5000 // 5 seconds