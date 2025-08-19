import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@components/Button'
import { authApi } from '@api/authApi'
import { useNotification } from '@hooks/useNotification'
import { ROUTES } from '@constants/routes'
import './EmailVerification.scss'

export const EmailVerification: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const notification = useNotification()
  const [searchParams] = useSearchParams()
  
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setVerifying(false)
      setError('NO_TOKEN')
    }
  }, [token])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const verifyEmail = async (verificationToken: string) => {
    try {
      setVerifying(true)
      setError(null)
      
      await authApi.verifyEmail(verificationToken)
      
      setVerified(true)
      notification.success(t('auth.emailVerified'))
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate(ROUTES.LOGIN)
      }, 3000)
    } catch (error: any) {
      setError(error.response?.data?.message || 'VERIFICATION_FAILED')
      notification.error(t('auth.emailVerificationFailed'))
    } finally {
      setVerifying(false)
    }
  }

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return
    
    try {
      setResending(true)
      await authApi.resendVerificationEmail()
      
      notification.success(t('auth.verificationEmailSent'))
      setResendCooldown(60) // 60 second cooldown
    } catch (error) {
      notification.error(t('auth.resendFailed'))
    } finally {
      setResending(false)
    }
  }

  const getStatusIcon = () => {
    if (verifying) return '⏳'
    if (verified) return '✅'
    if (error) return '❌'
    return '📧'
  }

  const getStatusMessage = () => {
    if (verifying) return t('auth.verifyingEmail')
    if (verified) return t('auth.emailVerifiedSuccess')
    if (error === 'NO_TOKEN') return t('auth.noVerificationToken')
    if (error === 'INVALID_TOKEN') return t('auth.invalidToken')
    if (error === 'TOKEN_EXPIRED') return t('auth.tokenExpired')
    if (error) return t('auth.verificationError')
    return ''
  }

  return (
    <div className="email-verification">
      <div className="email-verification__container">
        <div className="email-verification__icon">
          {getStatusIcon()}
        </div>
        
        <h1 className="email-verification__title">
          {t('auth.emailVerificationTitle')}
        </h1>
        
        <p className="email-verification__message">
          {getStatusMessage()}
        </p>

        {email && !verified && (
          <p className="email-verification__email">
            {t('auth.verificationEmailSentTo', { email })}
          </p>
        )}

        {error && (
          <div className="email-verification__error">
            <p>{t('auth.verificationErrorMessage')}</p>
            
            <div className="email-verification__actions">
              {error === 'TOKEN_EXPIRED' && (
                <Button
                  onClick={handleResendVerification}
                  loading={resending}
                  disabled={resendCooldown > 0}
                >
                  {resendCooldown > 0
                    ? t('auth.resendIn', { seconds: resendCooldown })
                    : t('auth.resendVerification')
                  }
                </Button>
              )}
              
              <Button
                variant="secondary"
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                {t('auth.backToLogin')}
              </Button>
            </div>
          </div>
        )}

        {verified && (
          <div className="email-verification__success">
            <p>{t('auth.redirectingToLogin')}</p>
            <Button
              onClick={() => navigate(ROUTES.LOGIN)}
              variant="primary"
            >
              {t('auth.goToLogin')}
            </Button>
          </div>
        )}

        {!verified && !error && !verifying && (
          <div className="email-verification__instructions">
            <h2>{t('auth.didntReceiveEmail')}</h2>
            <ul>
              <li>{t('auth.checkSpam')}</li>
              <li>{t('auth.checkEmailAddress')}</li>
              <li>{t('auth.waitFewMinutes')}</li>
            </ul>
            
            <Button
              onClick={handleResendVerification}
              loading={resending}
              disabled={resendCooldown > 0}
              variant="secondary"
            >
              {resendCooldown > 0
                ? t('auth.resendIn', { seconds: resendCooldown })
                : t('auth.resendVerification')
              }
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}