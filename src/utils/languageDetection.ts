/**
 * Language detection and management utilities
 */

export const SUPPORTED_LANGUAGES = ['en', 'de', 'ru', 'fr', 'es', 'it', 'pl'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/**
 * Get language from the current domain
 * Examples:
 * - en.clearcontract.io → 'en'
 * - de.clearcontract.io → 'de'
 * - clearcontract.io → 'en' (default)
 * - localhost → check localStorage or use default
 */
export const getLanguageFromDomain = (): SupportedLanguage => {
  const hostname = window.location.hostname;
  
  // For localhost or IP addresses, check localStorage
  if (hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    const storedLang = localStorage.getItem('preferredLanguage');
    if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang as SupportedLanguage)) {
      return storedLang as SupportedLanguage;
    }
    return DEFAULT_LANGUAGE;
  }
  
  // Extract subdomain (works for both .local and production domains)
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    const subdomain = parts[0];
    if (SUPPORTED_LANGUAGES.includes(subdomain as SupportedLanguage)) {
      return subdomain as SupportedLanguage;
    }
  }
  
  // Default to English
  return DEFAULT_LANGUAGE;
};

/**
 * Save language preference to localStorage
 */
export const saveLanguagePreference = (language: SupportedLanguage) => {
  localStorage.setItem('preferredLanguage', language);
};

/**
 * Get saved language preference from localStorage
 */
export const getSavedLanguagePreference = (): SupportedLanguage | null => {
  const saved = localStorage.getItem('preferredLanguage');
  if (saved && SUPPORTED_LANGUAGES.includes(saved as SupportedLanguage)) {
    return saved as SupportedLanguage;
  }
  return null;
};

/**
 * Switch to a different language subdomain
 * @param newLang - The target language
 * @param redirect - Whether to redirect to the new subdomain (default: true)
 */
export const switchLanguage = (newLang: SupportedLanguage, redirect: boolean = true) => {
  // Save preference
  saveLanguagePreference(newLang);
  
  // Don't redirect in development or if redirect is disabled
  if (!redirect || window.location.hostname === 'localhost' || 
      window.location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return;
  }
  
  const currentHost = window.location.hostname;
  
  // Remove any existing language subdomain
  let baseDomain = currentHost;
  for (const lang of SUPPORTED_LANGUAGES) {
    const pattern = new RegExp(`^${lang}\\.`);
    baseDomain = baseDomain.replace(pattern, '');
  }
  
  // Build new hostname
  const newHost = newLang === DEFAULT_LANGUAGE ? baseDomain : `${newLang}.${baseDomain}`;
  
  // Construct new URL preserving path and query
  const newUrl = `${window.location.protocol}//${newHost}${window.location.pathname}${window.location.search}${window.location.hash}`;
  
  // Redirect
  window.location.href = newUrl;
};

/**
 * Get language display name
 */
export const getLanguageDisplayName = (lang: SupportedLanguage): string => {
  const names: Record<SupportedLanguage, string> = {
    en: 'English',
    de: 'Deutsch',
    ru: 'Русский',
    fr: 'Français',
    es: 'Español',
    it: 'Italiano',
    pl: 'Polski'
  };
  return names[lang] || lang.toUpperCase();
};

/**
 * Get language flag emoji
 */
export const getLanguageFlag = (lang: SupportedLanguage): string => {
  const flags: Record<SupportedLanguage, string> = {
    en: '🇬🇧',
    de: '🇩🇪',
    ru: '🇷🇺',
    fr: '🇫🇷',
    es: '🇪🇸',
    it: '🇮🇹',
    pl: '🇵🇱'
  };
  return flags[lang] || '🌐';
};

/**
 * Initialize language on app start
 * Returns the detected/selected language
 */
export const initializeLanguage = (): SupportedLanguage => {
  // First check if there's a saved preference
  const savedLang = getSavedLanguagePreference();
  
  // Then check domain
  const domainLang = getLanguageFromDomain();
  
  // If domain language differs from saved, prefer domain
  // (user explicitly navigated to a language subdomain)
  if (domainLang !== DEFAULT_LANGUAGE) {
    saveLanguagePreference(domainLang);
    return domainLang;
  }
  
  // Use saved preference if available
  if (savedLang) {
    return savedLang;
  }
  
  // Default to domain language or default
  saveLanguagePreference(domainLang);
  return domainLang;
};