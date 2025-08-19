import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@components/Button'
import './TwoFactorAuth.scss'

interface TwoFactorAuthProps {
  onVerify: (code: string) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  error?: string | null
  method?: 'sms' | 'email' | 'app'
  contact?: string // masked phone or email
}

export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  onVerify,
  onCancel,
  isLoading = false,
  error,
  method = 'sms',
  contact
}) => {
  const { t } = useTranslation()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    // Resend timer
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits entered
    if (value && index === 5) {
      const fullCode = newCode.join('')
      if (fullCode.length === 6) {
        handleSubmit(fullCode)
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    
    if (pastedData) {
      const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6)
      setCode(newCode)
      
      // Focus last filled input or last input if all filled
      const lastFilledIndex = Math.min(pastedData.length - 1, 5)
      inputRefs.current[lastFilledIndex]?.focus()
      
      // Auto-submit if complete
      if (pastedData.length === 6) {
        handleSubmit(pastedData)
      }
    }
  }

  const handleSubmit = async (codeString?: string) => {
    const verificationCode = codeString || code.join('')
    if (verificationCode.length === 6) {
      await onVerify(verificationCode)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    
    setCanResend(false)
    setResendTimer(30)
    
    // Call resend API
    try {
      // await authApi.resend2FACode()
      console.log('Resending 2FA code...')
    } catch (error) {
      console.error('Failed to resend code:', error)
    }
  }

  const getMethodIcon = () => {
    switch (method) {
      case 'sms':
        return '📱'
      case 'email':
        return '📧'
      case 'app':
        return '🔐'
      default:
        return '🔒'
    }
  }

  const getMethodText = () => {
    switch (method) {
      case 'sms':
        return t('auth.twoFactor.smsText', { contact })
      case 'email':
        return t('auth.twoFactor.emailText', { contact })
      case 'app':
        return t('auth.twoFactor.appText')
      default:
        return t('auth.twoFactor.defaultText')
    }
  }

  return (
    <div className="two-factor">
      <div className="two-factor__icon">{getMethodIcon()}</div>
      
      <h2 className="two-factor__title">{t('auth.twoFactor.title')}</h2>
      <p className="two-factor__description">{getMethodText()}</p>

      {error && (
        <div className="two-factor__error">
          {t(`errors.${error}`, error)}
        </div>
      )}

      <div className="two-factor__code">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className={`two-factor__input ${error ? 'two-factor__input--error' : ''}`}
            disabled={isLoading}
            autoComplete="off"
          />
        ))}
      </div>

      <div className="two-factor__actions">
        <Button
          type="button"
          loading={isLoading}
          onClick={() => handleSubmit()}
          fullWidth
          disabled={code.join('').length !== 6}
        >
          {t('auth.twoFactor.verify')}
        </Button>

        <button
          type="button"
          className="two-factor__resend"
          onClick={handleResend}
          disabled={!canResend || isLoading}
        >
          {canResend 
            ? t('auth.twoFactor.resend')
            : t('auth.twoFactor.resendIn', { seconds: resendTimer })
          }
        </button>

        <button
          type="button"
          className="two-factor__cancel"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t('common.cancel')}
        </button>
      </div>

      <div className="two-factor__help">
        <p>{t('auth.twoFactor.trouble')}</p>
        <a href="/help/2fa" className="two-factor__help-link">
          {t('auth.twoFactor.getHelp')}
        </a>
      </div>
    </div>
  )
}