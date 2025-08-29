import React, { useEffect } from 'react'
import './ErrorNotification.scss'

interface ErrorNotificationProps {
  message: string
  type?: 'error' | 'warning' | 'success' | 'info'
  onClose: () => void
  duration?: number
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ 
  message, 
  type = 'error', 
  onClose,
  duration = 5000
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'error': return '✕'
      case 'warning': return '⚠'
      case 'success': return '✓'
      case 'info': return 'ℹ'
      default: return '✕'
    }
  }

  return (
    <div className={`error-notification error-notification--${type}`}>
      <span className="error-notification__icon">{getIcon()}</span>
      <span className="error-notification__message">{message}</span>
      <button className="error-notification__close" onClick={onClose}>×</button>
    </div>
  )
}

export default ErrorNotification