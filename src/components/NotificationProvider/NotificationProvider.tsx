import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import classNames from 'classnames'
import { RootState } from '@store/store'
import { removeNotification } from '@store/slices/notificationSlice'
import './NotificationProvider.scss'

interface NotificationItemProps {
  notification: any
  onRemove: (id: string) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)

  const handleRemove = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onRemove(notification.id)
    }, 300) // Match animation duration
  }, [notification.id, onRemove])

  useEffect(() => {
    if (!notification.duration || isPaused) return

    const interval = 50 // Update every 50ms for smooth animation
    const decrement = (100 * interval) / notification.duration

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - decrement
        if (newProgress <= 0) {
          clearInterval(timer)
          handleRemove()
          return 0
        }
        return newProgress
      })
    }, interval)

    return () => clearInterval(timer)
  }, [notification.duration, isPaused, handleRemove])

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return (
          <svg className="notification__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'error':
        return (
          <svg className="notification__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="notification__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      case 'info':
      default:
        return (
          <svg className="notification__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  return (
    <div 
      className={classNames(
        'notification',
        `notification--${notification.type}`,
        { 'notification--exiting': isExiting }
      )}
      role="alert"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="notification__content">
        <div className="notification__icon-wrapper">
          {getIcon()}
        </div>
        <div className="notification__text">
          {notification.title && (
            <div className="notification__title">{notification.title}</div>
          )}
          {notification.message && (
            <div className="notification__message">{notification.message}</div>
          )}
        </div>
      </div>
      
      {notification.actions && notification.actions.length > 0 && (
        <div className="notification__actions">
          {notification.actions.map((action: any, index: number) => (
            <button
              key={index}
              className={classNames(
                'notification__action-btn',
                { 'notification__action-btn--primary': action.primary }
              )}
              onClick={() => {
                action.action()
                handleRemove()
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      
      <button
        className="notification__close"
        onClick={handleRemove}
        aria-label="Close notification"
      >
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {notification.duration && (
        <div className="notification__progress">
          <div 
            className="notification__progress-bar" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

const NotificationProvider: React.FC = () => {
  const notifications = useSelector((state: RootState) => state.notification.notifications)
  const dispatch = useDispatch()

  const handleRemove = useCallback((id: string) => {
    dispatch(removeNotification(id))
  }, [dispatch])

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="notification-provider" aria-live="polite" aria-atomic="false">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={handleRemove}
        />
      ))}
    </div>
  )
}

export default NotificationProvider