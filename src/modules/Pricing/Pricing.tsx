import React, { useState, useEffect } from 'react'
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
    return amount >= publicSettings.minimum_deposit && amount <= publicSettings.maximum_deposit
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
        const stripe = window.Stripe(publicSettings.stripe_public_key)
        
        const { error } = await stripe.confirmCardPayment(paymentIntent.client_secret, {
          payment_method: {
            card: {
              // This would normally be from Stripe Elements
              // For demo purposes, we'll redirect to hosted checkout
            }
          }
        })

        if (error) {
          toast.error(error.message || 'Payment failed')
        } else {
          toast.success('Payment successful!')
          // Refresh balance
          dispatch(fetchUserBalance())
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Payment failed')
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
        throw new Error('No approval URL received')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Payment failed')
      setProcessingPayment(false)
    }
  }

  const handlePayment = async () => {
    const amount = getSelectedAmount()
    
    if (!validateAmount(amount)) {
      toast.error(`Amount must be between €${publicSettings?.minimum_deposit} and €${publicSettings?.maximum_deposit}`)
      return
    }

    if (!isAuthenticated) {
      toast.error('Please log in to add funds')
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
          <span>Loading pricing information...</span>
        </div>
      </div>
    )
  }

  if (!publicSettings) {
    return (
      <div className="pricing">
        <div className="pricing__error">
          <span>⚠️ Unable to load pricing information</span>
        </div>
      </div>
    )
  }

  return (
    <div className="pricing">
      <div className="pricing__container">
        {/* Header */}
        <div className="pricing__header">
          <h1 className="pricing__title">💰 Add Funds to Your Account</h1>
          <p className="pricing__subtitle">
            Top up your balance to analyze more documents with our AI-powered analysis
          </p>
          
          {isAuthenticated && (
            <div className="pricing__current-balance">
              <UserBalance size="large" showAddFunds={false} />
            </div>
          )}
        </div>

        {/* Document Analysis Pricing */}
        <div className="pricing__tiers-section">
          <h2 className="pricing__section-title">📄 Document Analysis Pricing</h2>
          <div className="pricing__tiers">
            {Object.entries(publicSettings.pricing_tiers).map(([tierKey, tier]) => (
              <div key={tierKey} className="pricing__tier">
                <div className="pricing__tier-header">
                  <h3 className="pricing__tier-name">
                    {tier.max_pages === 'unlimited' 
                      ? `100+ pages` 
                      : `1-${tier.max_pages} pages`
                    }
                  </h3>
                  <div className="pricing__tier-price">
                    €{tier.rate.toFixed(2)}<span>/page</span>
                  </div>
                </div>
                <div className="pricing__tier-description">
                  {tier.description}
                </div>
                <div className="pricing__tier-example">
                  Example: {tier.max_pages === 'unlimited' ? '200' : Math.min(10, Number(tier.max_pages))} pages = €{(tier.rate * (tier.max_pages === 'unlimited' ? 200 : Math.min(10, Number(tier.max_pages)))).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Funds Section */}
        <div className="pricing__deposit-section">
          <h2 className="pricing__section-title">💳 Add Funds</h2>
          
          {/* Recommended Amounts */}
          <div className="pricing__recommended">
            <h3>Recommended amounts</h3>
            <div className="pricing__amount-buttons">
              {publicSettings.recommended_amounts.map((amount, index) => (
                <button
                  key={index}
                  className={`pricing__amount-btn ${selectedAmount === amount ? 'active' : ''}`}
                  onClick={() => handleAmountSelect(amount)}
                >
                  <span className="pricing__amount-value">€{amount.toFixed(2)}</span>
                  <span className="pricing__amount-label">
                    {index === 0 && 'Popular'}
                    {index === 1 && 'Best Value'}
                    {index === 2 && 'Premium'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="pricing__custom">
            <h3>Or enter custom amount</h3>
            <div className="pricing__custom-input">
              <span className="pricing__currency">€</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder={`${publicSettings.minimum_deposit} - ${publicSettings.maximum_deposit}`}
                min={publicSettings.minimum_deposit}
                max={publicSettings.maximum_deposit}
                step="0.01"
              />
            </div>
            <small className="pricing__limits">
              Minimum: €{publicSettings.minimum_deposit}, Maximum: €{publicSettings.maximum_deposit}
            </small>
          </div>

          {/* Payment Provider Selection */}
          {(publicSettings.stripe_enabled || publicSettings.paypal_enabled) && (
            <div className="pricing__payment-methods">
              <h3>Choose payment method</h3>
              <div className="pricing__method-buttons">
                {publicSettings.stripe_enabled && (
                  <button
                    className={`pricing__method-btn ${paymentProvider === 'stripe' ? 'active' : ''}`}
                    onClick={() => setPaymentProvider('stripe')}
                  >
                    <span className="pricing__method-icon">💳</span>
                    <span className="pricing__method-name">Credit Card</span>
                    <small>via Stripe</small>
                  </button>
                )}
                
                {publicSettings.paypal_enabled && (
                  <button
                    className={`pricing__method-btn ${paymentProvider === 'paypal' ? 'active' : ''}`}
                    onClick={() => setPaymentProvider('paypal')}
                  >
                    <span className="pricing__method-icon">🅿️</span>
                    <span className="pricing__method-name">PayPal</span>
                    <small>Secure payments</small>
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
                  Processing...
                </>
              ) : (
                <>
                  💰 Add €{getSelectedAmount().toFixed(2)} to Account
                </>
              )}
            </button>
            
            {!isAuthenticated && (
              <p className="pricing__login-notice">
                Please <a href="/login">log in</a> to add funds to your account
              </p>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="pricing__features">
          <h2 className="pricing__section-title">✨ What you get</h2>
          <div className="pricing__features-grid">
            <div className="pricing__feature">
              <span className="pricing__feature-icon">🤖</span>
              <h3>AI-Powered Analysis</h3>
              <p>Advanced artificial intelligence analyzes your documents for risks, important clauses, and recommendations</p>
            </div>
            <div className="pricing__feature">
              <span className="pricing__feature-icon">⚡</span>
              <h3>Instant Results</h3>
              <p>Get comprehensive analysis results within seconds of uploading your document</p>
            </div>
            <div className="pricing__feature">
              <span className="pricing__feature-icon">🔒</span>
              <h3>Secure & Private</h3>
              <p>Your documents are processed securely and never stored permanently on our servers</p>
            </div>
            <div className="pricing__feature">
              <span className="pricing__feature-icon">📊</span>
              <h3>Detailed Reports</h3>
              <p>Receive structured analysis reports with risk assessments and actionable recommendations</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="pricing__faq">
          <h2 className="pricing__section-title">❓ Frequently Asked Questions</h2>
          <div className="pricing__faq-items">
            <div className="pricing__faq-item">
              <h3>How does the pricing work?</h3>
              <p>We charge per page analyzed, with volume discounts for larger documents. Funds are deducted from your account balance when you analyze a document.</p>
            </div>
            <div className="pricing__faq-item">
              <h3>Is it safe to add funds?</h3>
              <p>Yes, all payments are processed securely through Stripe and PayPal. We never store your payment information.</p>
            </div>
            <div className="pricing__faq-item">
              <h3>Can I get a refund?</h3>
              <p>Unused funds in your account can be refunded. Contact our support team for refund requests.</p>
            </div>
            <div className="pricing__faq-item">
              <h3>Do funds expire?</h3>
              <p>No, funds in your account never expire and can be used anytime for document analysis.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}