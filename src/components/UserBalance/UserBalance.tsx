import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { fetchUserBalance, selectUserBalance, selectBillingLoading, selectBillingError } from '@store/slices/billingSlice'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './UserBalance.scss'

interface UserBalanceProps {
  onClick?: () => void
  showAddFunds?: boolean
  size?: 'small' | 'medium' | 'large'
}

export const UserBalance: React.FC<UserBalanceProps> = ({ 
  onClick, 
  showAddFunds = true,
  size = 'medium'
}) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const balance = useAppSelector(selectUserBalance)
  const loading = useAppSelector(selectBillingLoading)
  const error = useAppSelector(selectBillingError)
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated && !balance && !loading.balance && !error) {
      dispatch(fetchUserBalance())
    }
  }, [dispatch, isAuthenticated, balance, loading.balance, error])

  if (!isAuthenticated) {
    return null
  }

  const formatBalance = (amount: number | undefined | null, currency?: string) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '€0.00'
    }
    const currencyCode = currency || 'EUR'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getBalanceStatus = (amount: number | undefined | null) => {
    if (!amount || isNaN(amount)) return 'low'
    if (amount >= 50) return 'high'
    if (amount >= 10) return 'medium'
    if (amount >= 5) return 'low'
    return 'critical'
  }

  if (loading.balance && !balance) {
    return (
      <div className={`user-balance user-balance--${size} user-balance--loading`}>
        <div className="user-balance__spinner"></div>
        <span className="user-balance__text">{t('billing.loading_balance')}</span>
      </div>
    )
  }

  if (error && !loading.balance) {
    return (
      <div className={`user-balance user-balance--${size} user-balance--error`}>
        <span className="user-balance__icon">⚠️</span>
        <span className="user-balance__text">{t('billing.balance_unavailable')}</span>
      </div>
    )
  }

  if (!balance && !loading.balance) {
    return (
      <div className={`user-balance user-balance--${size} user-balance--error`}>
        <span className="user-balance__icon">⚠️</span>
        <span className="user-balance__text">{t('billing.balance_unavailable')}</span>
      </div>
    )
  }

  const balanceAmount = balance?.balance ?? 0
  const balanceStatus = getBalanceStatus(balanceAmount)

  return (
    <div 
      className={`user-balance user-balance--${size} user-balance--${balanceStatus}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="user-balance__main">
        <div className="user-balance__icon">
          💰
        </div>
        <div className="user-balance__content">
          <div className="user-balance__amount">
            {formatBalance(balanceAmount, balance?.currency)}
          </div>
          {size !== 'small' && (
            <div className="user-balance__label">
              {t('billing.account_balance')}
            </div>
          )}
        </div>
      </div>

      {showAddFunds && balanceStatus === 'critical' && size !== 'small' && (
        <Link to="/pricing" className="user-balance__add-funds">
          <span className="user-balance__add-icon">+</span>
          {size === 'large' ? t('billing.add_funds') : '+'}
        </Link>
      )}

      {balanceStatus === 'critical' && size !== 'small' && (
        <div className="user-balance__hint">
          <span className="user-balance__hint-text">
            {t('billing.low_balance')}
          </span>
        </div>
      )}
    </div>
  )
}

export default UserBalance