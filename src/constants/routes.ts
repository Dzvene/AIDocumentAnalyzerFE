export const ROUTES = {
  // Public routes
  HOME: '/',
  CATEGORIES: '/categories',
  ABOUT_US: '/about-us',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_CONDITIONS: '/terms-and-conditions',
  OFFERS: '/offers',
  CONTACT_US: '/contact-us',
  BLOG: '/blog',
  BLOG_POST: '/blog/:slug',
  VENDORS: '/vendors',
  VIEW_SHOP: '/shop/:slug',
  SEARCH: '/search',
  
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // User routes
  USER_DASHBOARD: '/user/dashboard',
  USER_PROFILE: '/user/profile',
  USER_ORDERS: '/user/orders',
  USER_ORDER_DETAILS: '/user/orders/:id',
  USER_ADDRESSES: '/user/addresses',
  USER_WISHLIST: '/user/wishlist',
  USER_REVIEWS: '/user/reviews',
  USER_CHANGE_PASSWORD: '/user/change-password',
  
  // Cart & Checkout
  CART: '/cart',
  CHECKOUT: '/checkout',
  PAYMENT: '/payment',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_SHOPS: '/admin/shops',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_SETTINGS: '/admin/settings',
  
  // Shop owner routes
  SHOP_DASHBOARD: '/shop/dashboard',
  SHOP_PROFILE: '/shop/profile',
  SHOP_PRODUCTS: '/shop/products',
  SHOP_ORDERS: '/shop/orders',
  SHOP_CATEGORIES: '/shop/categories',
  
  // Other
  NOT_FOUND: '/404',
} as const

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.CATEGORIES,
  ROUTES.ABOUT_US,
  ROUTES.PRIVACY_POLICY,
  ROUTES.TERMS_CONDITIONS,
  ROUTES.OFFERS,
  ROUTES.CONTACT_US,
  ROUTES.BLOG,
  ROUTES.BLOG_POST,
  ROUTES.VENDORS,
  ROUTES.VIEW_SHOP,
  ROUTES.SEARCH,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.NOT_FOUND,
]

export const PRIVATE_ROUTES = [
  ROUTES.USER_DASHBOARD,
  ROUTES.USER_PROFILE,
  ROUTES.USER_ORDERS,
  ROUTES.USER_ORDER_DETAILS,
  ROUTES.USER_ADDRESSES,
  ROUTES.USER_WISHLIST,
  ROUTES.USER_REVIEWS,
  ROUTES.USER_CHANGE_PASSWORD,
  ROUTES.CART,
  ROUTES.CHECKOUT,
  ROUTES.PAYMENT,
]

export const ADMIN_ROUTES = [
  ROUTES.ADMIN_DASHBOARD,
  ROUTES.ADMIN_USERS,
  ROUTES.ADMIN_SHOPS,
  ROUTES.ADMIN_PRODUCTS,
  ROUTES.ADMIN_ORDERS,
  ROUTES.ADMIN_SETTINGS,
]

export const SHOP_OWNER_ROUTES = [
  ROUTES.SHOP_DASHBOARD,
  ROUTES.SHOP_PROFILE,
  ROUTES.SHOP_PRODUCTS,
  ROUTES.SHOP_ORDERS,
  ROUTES.SHOP_CATEGORIES,
]