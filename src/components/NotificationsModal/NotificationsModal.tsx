import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNotification } from '@hooks/useNotification'
import { notificationsApi } from '@api/notificationsApi'
import './NotificationsModal.scss'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'promo'
  isRead: boolean
  createdAt: string
  link?: string
  icon?: string
}

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const notification = useNotification()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const response = await notificationsApi.getUserNotifications()
      setNotifications(response.data || [])
    } catch (error) {
      console.error('Failed to load notifications:', error)
      notification.error(t('notifications.loadError', 'Не удалось загрузить уведомления'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      notification.success(t('notifications.allMarkedAsRead', 'Все уведомления отмечены как прочитанные'))
    } catch (error) {
      notification.error(t('notifications.markAsReadError', 'Не удалось отметить уведомления'))
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationsApi.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      notification.success(t('notifications.deleted', 'Уведомление удалено'))
    } catch (error) {
      notification.error(t('notifications.deleteError', 'Не удалось удалить уведомление'))
    }
  }

  const handleClearAll = async () => {
    notification.confirmAction(
      t('notifications.clearAllTitle', 'Очистить все уведомления?'),
      t('notifications.clearAllMessage', 'Это действие нельзя отменить'),
      async () => {
        try {
          await notificationsApi.clearAll()
          setNotifications([])
          notification.success(t('notifications.cleared', 'Все уведомления удалены'))
        } catch (error) {
          notification.error(t('notifications.clearError', 'Не удалось удалить уведомления'))
        }
      }
    )
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'order': return '📦'
      case 'promo': return '🎉'
      default: return 'ℹ️'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      return t('notifications.minutesAgo', '{{count}} минут назад', { count: minutes || 1 })
    } else if (hours < 24) {
      return t('notifications.hoursAgo', '{{count}} часов назад', { count: hours })
    } else {
      const days = Math.floor(hours / 24)
      if (days === 1) {
        return t('notifications.yesterday', 'Вчера')
      } else if (days < 7) {
        return t('notifications.daysAgo', '{{count}} дней назад', { count: days })
      } else {
        return date.toLocaleDateString()
      }
    }
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications

  if (!isOpen) return null

  return (
    <>
      <div className="notifications-overlay" onClick={onClose} />
      <div className="notifications-modal">
        <div className="notifications-modal__header">
          <h2>{t('notifications.title', 'Уведомления')}</h2>
          <button 
            className="notifications-modal__close"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            ✕
          </button>
        </div>

        <div className="notifications-modal__controls">
          <div className="notifications-modal__tabs">
            <button 
              className={`tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              {t('notifications.all', 'Все')} ({notifications.length})
            </button>
            <button 
              className={`tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              {t('notifications.unread', 'Непрочитанные')} ({notifications.filter(n => !n.isRead).length})
            </button>
          </div>
          
          <div className="notifications-modal__actions">
            {notifications.some(n => !n.isRead) && (
              <button 
                className="text-btn"
                onClick={handleMarkAllAsRead}
              >
                {t('notifications.markAllAsRead', 'Прочитать все')}
              </button>
            )}
            {notifications.length > 0 && (
              <button 
                className="text-btn danger"
                onClick={handleClearAll}
              >
                {t('notifications.clearAll', 'Очистить все')}
              </button>
            )}
          </div>
        </div>

        <div className="notifications-modal__content">
          {loading ? (
            <div className="notifications-modal__loading">
              <div className="spinner"></div>
              <p>{t('common.loading', 'Загрузка...')}</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notifications-modal__empty">
              <div className="empty-icon">🔔</div>
              <h3>{t('notifications.empty', 'Нет уведомлений')}</h3>
              <p>{t('notifications.emptyMessage', 'У вас пока нет новых уведомлений')}</p>
            </div>
          ) : (
            <div className="notifications-modal__list">
              {filteredNotifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                  onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                >
                  <div className="notification-item__icon">
                    {notif.icon || getNotificationIcon(notif.type)}
                  </div>
                  <div className="notification-item__content">
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <span className="notification-item__time">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>
                  <button 
                    className="notification-item__delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(notif.id)
                    }}
                    aria-label={t('common.delete')}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}