import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ROUTES } from '@constants/routes'
import { RootState, AppDispatch } from '@store/store'
// TODO: Update to use multiCartSlice
// import { 
//   selectCart,
//   selectCartItems,
//   selectCartLoading,
//   selectCartTotal,
//   updateCartItem,
//   removeCartItem,
//   clearCart as clearCartAction,
//   applyCoupon,
//   removeCoupon
// } from '@store/slices/cartSlice'
import { selectAllCarts, selectTotalAmount } from '@store/slices/multiCartSlice'
import { useNotification } from '@hooks/useNotification'
import './Cart.scss'

export const Cart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const notification = useNotification()
  
  const carts = useSelector(selectAllCarts)
  const cartItems: any[] = [] // TODO: Update to use multiCartSlice
  const loading = false // TODO: Update to use multiCartSlice
  const total = useSelector(selectTotalAmount)
  
  const [promoCode, setPromoCode] = useState('')
  const [promoError, setPromoError] = useState('')

  // Load cart data on component mount if needed
  useEffect(() => {
    // Cart data will be loaded automatically from Redux store
  }, [])

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }
    
    try {
      // TODO: await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap()
      notification.cartActionSuccess('updated')
    } catch (error) {
      notification.apiError(error)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      // TODO: await dispatch(removeCartItem(itemId)).unwrap()
      notification.cartActionSuccess('removed')
    } catch (error) {
      notification.apiError(error)
    }
  }

  const clearCart = async () => {
    try {
      // TODO: await dispatch(clearCartAction()).unwrap()
      notification.success('Корзина очищена')
    } catch (error) {
      notification.apiError(error)
    }
  }

  const applyPromoCode = async () => {
    setPromoError('')
    
    try {
      // TODO: await dispatch(applyCoupon(promoCode.trim())).unwrap()
      setPromoCode('')
      notification.success('Промокод применен')
    } catch (error: any) {
      const errorMessage = error?.message || 'Промокод не найден или недействителен'
      setPromoError(errorMessage)
      notification.error('Ошибка промокода', errorMessage)
    }
  }

  const removePromoCode = async () => {
    try {
      // TODO: await dispatch(removeCoupon()).unwrap()
      notification.success('Промокод удален')
    } catch (error) {
      notification.apiError(error)
    }
  }


  const groupItemsByShop = () => {
    return cartItems.reduce((groups, item) => {
      const shopId = item.product.shopId
      const shopName = item.product.shopName
      
      if (!groups[shopId]) {
        groups[shopId] = {
          shopName: shopName,
          items: []
        }
      }
      groups[shopId].items.push(item)
      return groups
    }, {} as Record<number, { shopName: string, items: any[] }>)
  }

  const calculateItemDiscount = (price: number, oldPrice?: number) => {
    if (!oldPrice) return 0
    return Math.round(((oldPrice - price) / oldPrice) * 100)
  }

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="spinner"></div>
        <p>Загрузка корзины...</p>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <div className="container">
          <div className="empty-content">
            <span className="icon">🛒</span>
            <h2>Ваша корзина пуста</h2>
            <p>Добавьте товары из магазинов, чтобы оформить заказ</p>
            <div className="empty-actions">
              <Link to={ROUTES.VENDORS} className="btn primary">
                Перейти к магазинам
              </Link>
              <Link to={ROUTES.HOME} className="btn secondary">
                На главную
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const shopGroups = groupItemsByShop()
  const subtotal = cart?.subtotal || 0
  const savings = 0 // cart?.savings || 0 - will be calculated from backend
  const discount = cart?.discount || 0
  const deliveryFee = cart?.deliveryFee || 0
  const totalAmount = cart?.total || 0

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Корзина</h1>
          <div className="cart-summary">
            <span className="items-count">{cartItems.length} товаров</span>
            <button onClick={clearCart} className="clear-cart">
              Очистить корзину
            </button>
          </div>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {Object.entries(shopGroups).map(([shopId, group]) => (
              <div key={shopId} className="shop-group">
                <div className="shop-header">
                  <h3>
                    <Link to={`/shop/${shopId}`} className="shop-link">
                      🏪 {group.shopName}
                    </Link>
                  </h3>
                </div>

                <div className="items-list">
                  {group.items.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="item-image">
                        <img src={item.product.mainImage} alt={item.product.name} />
                        {item.product.oldPrice && (
                          <span className="discount">-{calculateItemDiscount(item.product.price, item.product.oldPrice)}%</span>
                        )}
                        {!item.product.isAvailable && (
                          <div className="out-of-stock">
                            <span>Нет в наличии</span>
                          </div>
                        )}
                      </div>

                      <div className="item-details">
                        <h4>{item.product.name}</h4>
                        <p className="description">{item.product.description}</p>
                        <div className="price-info">
                          <span className="current-price">{item.product.price}₽/{item.product.unit}</span>
                          {item.product.oldPrice && (
                            <span className="old-price">{item.product.oldPrice}₽/{item.product.unit}</span>
                          )}
                        </div>
                        {!item.product.isAvailable && (
                          <div className="stock-warning">
                            ⚠️ Товар закончился
                          </div>
                        )}
                      </div>

                      <div className="item-controls">
                        <div className="quantity-control">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="qty-btn"
                            disabled={!item.product.isAvailable}
                          >
                            -
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="qty-btn"
                            disabled={!item.product.isAvailable}
                          >
                            +
                          </button>
                        </div>
                        <div className="item-total">
                          {item.product.price * item.quantity}₽
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="remove-btn"
                          title="Удалить товар"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-sidebar">
            <div className="order-summary">
              <h3>Итого</h3>
              
              <div className="summary-line">
                <span>Товары ({cartItems.length})</span>
                <span>{subtotal}₽</span>
              </div>

              {savings > 0 && (
                <div className="summary-line savings">
                  <span>Скидка</span>
                  <span>-{savings}₽</span>
                </div>
              )}

              {false && (
                <div className="summary-line discount">
                  <span>Промокод</span>
                  <span>-{discount}₽</span>
                </div>
              )}

              <div className="summary-line">
                <span>Доставка</span>
                <span>{deliveryFee === 0 ? 'Бесплатно' : `${deliveryFee}₽`}</span>
              </div>

              <div className="summary-total">
                <span>К оплате</span>
                <span>{totalAmount}₽</span>
              </div>

              <div className="promo-section">
                <h4>Промокод</h4>
                {cart?.coupon ? (
                  <div className="applied-promo">
                    <div className="promo-info">
                      <span className="promo-code">PROMO</span>
                      <span className="promo-desc">Промокод применен</span>
                    </div>
                    <button onClick={removePromoCode} className="remove-promo">
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="promo-input">
                    <input
                      type="text"
                      placeholder="Введите промокод"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <button onClick={applyPromoCode} disabled={!promoCode.trim()}>
                      Применить
                    </button>
                  </div>
                )}
                {promoError && (
                  <div className="promo-error">{promoError}</div>
                )}
              </div>

              <Link to={ROUTES.CHECKOUT} className="checkout-btn">
                Оформить заказ
              </Link>

              <div className="payment-methods">
                <p>Способы оплаты:</p>
                <div className="methods">
                  <span>💳 Карта</span>
                  <span>💵 Наличные</span>
                  <span>📱 СБП</span>
                </div>
              </div>
            </div>

            <div className="continue-shopping">
              <Link to={ROUTES.VENDORS} className="continue-btn">
                ← Продолжить покупки
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}