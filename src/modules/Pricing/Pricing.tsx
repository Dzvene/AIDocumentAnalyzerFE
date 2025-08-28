import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { fetchPublicSettings, fetchUserBalance, selectPublicSettings, selectUserBalance, selectBillingLoading } from '@store/slices/billingSlice'
import { billingApi } from '@api/billing.api'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import { UserBalance } from '@components/UserBalance'
import './Pricing.scss'

declare global {
  interface Window {
    Stripe: any
    paypal: any
  }
}

export const Pricing: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const publicSettings = useAppSelector(selectPublicSettings)
  const userBalance = useAppSelector(selectUserBalance)
  const loading = useAppSelector(selectBillingLoading)
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  const [customAmount, setCustomAmount] = useState('')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'paypal'>('stripe')

  useEffect(() => {
    if (!publicSettings && !loading.settings) {
      dispatch(fetchPublicSettings())
    }
  }, [dispatch, publicSettings, loading.settings])

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount(null)
  }

  const getSelectedAmount = (): number => {
    if (selectedAmount) return selectedAmount
    if (customAmount) return parseFloat(customAmount)
    return 0
  }

  const validateAmount = (amount: number): boolean => {
    if (!publicSettings) return false
    const minDeposit = publicSettings.minimum_deposit || 5
    const maxDeposit = publicSettings.maximum_deposit || 10000
    return amount >= minDeposit && amount <= maxDeposit
  }

  const handleStripePayment = async (amount: number) => {
    try {
      setProcessingPayment(true)
      
      const paymentIntent = await billingApi.createStripeDeposit(
        amount,
        window.location.origin + '/payment/success',
        window.location.origin + '/payment/cancel'
      )

      // Load Stripe.js dynamically if not already loaded
      if (!window.Stripe && publicSettings?.stripe_public_key) {
        await loadStripeScript()
      }

      if (window.Stripe && publicSettings?.stripe_public_key) {
        const stripe = window.Stripe(publicSettings.stripe_public_key || '')
        
        const { error } = await stripe.confirmCardPayment(paymentIntent.client_secret, {
          payment_method: {
            card: {
              // This would normally be from Stripe Elements
              // For demo purposes, we'll redirect to hosted checkout
            }
          }
        })

        if (error) {
          toast.error(error.message || t('pricing.toast.paymentFailed'))
        } else {
          toast.success(t('pricing.toast.paymentSuccess'))
          // Refresh balance
          dispatch(fetchUserBalance())
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t('pricing.toast.paymentFailed'))
    } finally {
      setProcessingPayment(false)
    }
  }

  const handlePayPalPayment = async (amount: number) => {
    try {
      setProcessingPayment(true)
      
      const paypalOrder = await billingApi.createPayPalDeposit(
        amount,
        window.location.origin + '/payment/success',
        window.location.origin + '/payment/cancel'
      )

      // Redirect to PayPal approval URL
      if (paypalOrder.approval_url) {
        window.location.href = paypalOrder.approval_url
      } else {
        throw new Error(t('pricing.toast.noApprovalUrl'))
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t('pricing.toast.paymentFailed'))
      setProcessingPayment(false)
    }
  }

  const handlePayment = async () => {
    const amount = getSelectedAmount()
    
    if (!validateAmount(amount)) {
      toast.error(
        t('pricing.validation.amountRange', {
          min: publicSettings?.minimum_deposit || 5,
          max: publicSettings?.maximum_deposit || 10000
        })
      )
      return
    }

    if (!isAuthenticated) {
      toast.error(t('pricing.validation.loginRequired'))
      return
    }

    if (paymentProvider === 'stripe') {
      await handleStripePayment(amount)
    } else if (paymentProvider === 'paypal') {
      await handlePayPalPayment(amount)
    }
  }

  const loadStripeScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.Stripe) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://js.stripe.com/v3/'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Stripe'))
      document.head.appendChild(script)
    })
  }

  if (loading.settings && !publicSettings) {
    return (
      <div className="pricing">
        <div className="pricing__loading">
          <div className="pricing__spinner"></div>
          <span>{t('pricing.loading')}</span>
        </div>
      </div>
    )
  }

  if (!publicSettings) {
    return (
      <div className="pricing">
        <div className="pricing__error">
          <span>⚠️ {t('pricing.error')}</span>
        </div>
      </div>
    )
  }

  const amountLabels = [
    t('pricing.addFunds.popular'),
    t('pricing.addFunds.bestValue'),
    t('pricing.addFunds.premium')
  ]

  return (
    <div className="pricing">
      <div className="pricing__container">
        {/* Header */}
        <div className="pricing__header">
          <h1 className="pricing__title">💰 {t('pricing.title')}</h1>
          <p className="pricing__subtitle">{t('pricing.subtitle')}</p>
          
          {isAuthenticated && (
            <div className="pricing__current-balance">
              <UserBalance size="large" showAddFunds={false} />
            </div>
          )}
        </div>

        {/* Document Analysis Pricing */}
        <div className="pricing__tiers-section">
          <h2 className="pricing__section-title">📄 {t('pricing.documentPricing.title')}</h2>
          <div className="pricing__tiers">
            {publicSettings.pricing_tiers && Object.entries(publicSettings.pricing_tiers).map(([tierKey, tier]) => (
              <div key={tierKey} className="pricing__tier">
                <div className="pricing__tier-header">
                  <h3 className="pricing__tier-name">
                    {tier.max_pages === 'unlimited' 
                      ? t('pricing.documentPricing.unlimited')
                      : `1-${tier.max_pages} ${t('pricing.documentPricing.pages')}`
                    }
                  </h3>
                  <div className="pricing__tier-price">
                    €{tier.rate.toFixed(2)}
                    <span>{t('pricing.documentPricing.perPage')}</span>
                  </div>
                </div>
                <div className="pricing__tier-description">
                  {tier.description}
                </div>
                <div className="pricing__tier-example">
                  {t('pricing.documentPricing.example')}: {tier.max_pages === 'unlimited' ? '200' : Math.min(10, Number(tier.max_pages))} {t('pricing.documentPricing.pages')} = €{(tier.rate * (tier.max_pages === 'unlimited' ? 200 : Math.min(10, Number(tier.max_pages)))).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Funds Section */}
        <div className="pricing__deposit-section">
          <h2 className="pricing__section-title">💳 {t('pricing.addFunds.title')}</h2>
          
          {/* Recommended Amounts */}
          <div className="pricing__recommended">
            <h3>{t('pricing.addFunds.recommendedAmounts')}</h3>
            <div className="pricing__amount-buttons">
              {(publicSettings.recommended_amounts || [5, 10, 20, 50, 100]).map((amount, index) => (
                <button
                  key={index}
                  className={`pricing__amount-btn ${selectedAmount === amount ? 'active' : ''}`}
                  onClick={() => handleAmountSelect(amount)}
                >
                  <span className="pricing__amount-value">€{amount.toFixed(2)}</span>
                  <span className="pricing__amount-label">
                    {amountLabels[index] || ''}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="pricing__custom">
            <h3>{t('pricing.addFunds.customAmount')}</h3>
            <div className="pricing__custom-input">
              <span className="pricing__currency">{t('pricing.addFunds.currency')}</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder={`${publicSettings.minimum_deposit || 5} - ${publicSettings.maximum_deposit || 10000}`}
                min={publicSettings.minimum_deposit || 5}
                max={publicSettings.maximum_deposit || 10000}
                step="0.01"
              />
            </div>
            <small className="pricing__limits">
              {t('pricing.addFunds.minimum')}: €{publicSettings.minimum_deposit || 5}, {t('pricing.addFunds.maximum')}: €{publicSettings.maximum_deposit || 10000}
            </small>
          </div>

          {/* Payment Provider Selection */}
          {(publicSettings?.stripe_enabled || publicSettings?.paypal_enabled) && (
            <div className="pricing__payment-methods">
              <h3>{t('pricing.paymentMethods.title')}</h3>
              <div className="pricing__method-buttons">
                {publicSettings?.stripe_enabled && (
                  <button
                    className={`pricing__method-btn ${paymentProvider === 'stripe' ? 'active' : ''}`}
                    onClick={() => setPaymentProvider('stripe')}
                  >
                    <span className="pricing__method-icon">💳</span>
                    <span className="pricing__method-name">{t('pricing.paymentMethods.creditCard')}</span>
                    <small>{t('pricing.paymentMethods.viaStripe')}</small>
                  </button>
                )}
                
                {publicSettings?.paypal_enabled && (
                  <button
                    className={`pricing__method-btn ${paymentProvider === 'paypal' ? 'active' : ''}`}
                    onClick={() => setPaymentProvider('paypal')}
                  >
                    <span className="pricing__method-icon">🅿️</span>
                    <span className="pricing__method-name">{t('pricing.paymentMethods.paypal')}</span>
                    <small>{t('pricing.paymentMethods.securePayments')}</small>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Payment Button */}
          <div className="pricing__payment-action">
            <button
              className="pricing__pay-btn"
              onClick={handlePayment}
              disabled={!getSelectedAmount() || processingPayment || !isAuthenticated}
            >
              {processingPayment ? (
                <>
                  <div className="pricing__spinner-small"></div>
                  {t('pricing.paymentButton.processing')}
                </>
              ) : (
                <>
                  💰 {t('pricing.paymentButton.addFunds', { amount: `€${getSelectedAmount().toFixed(2)}` })}
                </>
              )}
            </button>
            
            {!isAuthenticated && (
              <p className="pricing__login-notice">
                {t('pricing.validation.loginRequired')} <Link to="/login">{t('auth.login')}</Link>
              </p>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="pricing__features">
          <h2 className="pricing__section-title">✨ {t('pricing.features.title')}</h2>
          <div className="pricing__features-grid">
            <div className="pricing__feature">
              <span className="pricing__feature-icon">🤖</span>
              <h3>{t('pricing.features.aiAnalysis.title')}</h3>
              <p>{t('pricing.features.aiAnalysis.description')}</p>
            </div>
            <div className="pricing__feature">
              <span className="pricing__feature-icon">⚡</span>
              <h3>{t('pricing.features.instantResults.title')}</h3>
              <p>{t('pricing.features.instantResults.description')}</p>
            </div>
            <div className="pricing__feature">
              <span className="pricing__feature-icon">🔒</span>
              <h3>{t('pricing.features.secure.title')}</h3>
              <p>{t('pricing.features.secure.description')}</p>
            </div>
            <div className="pricing__feature">
              <span className="pricing__feature-icon">📊</span>
              <h3>{t('pricing.features.detailedReports.title')}</h3>
              <p>{t('pricing.features.detailedReports.description')}</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="pricing__faq">
          <h2 className="pricing__section-title">❓ {t('pricing.faq.title')}</h2>
          <div className="pricing__faq-items">
            <div className="pricing__faq-item">
              <h3>{t('pricing.faq.howPricingWorks.question')}</h3>
              <p>{t('pricing.faq.howPricingWorks.answer')}</p>
            </div>
            <div className="pricing__faq-item">
              <h3>{t('pricing.faq.isSafe.question')}</h3>
              <p>{t('pricing.faq.isSafe.answer')}</p>
            </div>
            <div className="pricing__faq-item">
              <h3>{t('pricing.faq.refund.question')}</h3>
              <p>{t('pricing.faq.refund.answer')}</p>
            </div>
            <div className="pricing__faq-item">
              <h3>{t('pricing.faq.expiration.question')}</h3>
              <p>{t('pricing.faq.expiration.answer')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}