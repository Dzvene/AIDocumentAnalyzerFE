import { useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { 
  addNotification,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
  removeNotification,
  clearAllNotifications,
  type Notification
} from '@store/slices/notificationSlice'

// Default durations for different notification types (in milliseconds)
const DEFAULT_DURATIONS = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000
}

export const useNotification = () => {
  const dispatch = useDispatch()

  const show = useCallback((notification: Omit<Notification, 'id'>) => {
    const notificationWithDefaults = {
      duration: DEFAULT_DURATIONS[notification.type || 'info'],
      ...notification
    }
    dispatch(addNotification(notificationWithDefaults))
  }, [dispatch])

  const success = useCallback((title: string, message?: string, duration?: number) => {
    dispatch(addNotification({
      type: 'success',
      title,
      message,
      duration: duration || DEFAULT_DURATIONS.success
    }))
  }, [dispatch])

  const error = useCallback((title: string, message?: string, duration?: number) => {
    dispatch(addNotification({
      type: 'error',
      title,
      message,
      duration: duration || DEFAULT_DURATIONS.error
    }))
  }, [dispatch])

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    dispatch(addNotification({
      type: 'warning',
      title,
      message,
      duration: duration || DEFAULT_DURATIONS.warning
    }))
  }, [dispatch])

  const info = useCallback((title: string, message?: string, duration?: number) => {
    dispatch(addNotification({
      type: 'info',
      title,
      message,
      duration: duration || DEFAULT_DURATIONS.info
    }))
  }, [dispatch])

  const remove = useCallback((id: string) => {
    dispatch(removeNotification(id))
  }, [dispatch])

  const clearAll = useCallback(() => {
    dispatch(clearAllNotifications())
  }, [dispatch])

  // Helper functions for common scenarios
  const apiError = useCallback((error: any) => {
    const message = error?.response?.data?.message || 
                   error?.response?.data?.error ||
                   error?.message || 
                   'Произошла непредвиденная ошибка'
    
    dispatch(addNotification({
      type: 'error',
      title: 'Ошибка',
      message,
      duration: DEFAULT_DURATIONS.error
    }))
  }, [dispatch])

  const networkError = useCallback(() => {
    dispatch(addNotification({
      type: 'error',
      title: 'Ошибка сети',
      message: 'Проверьте подключение к интернету и попробуйте снова',
      duration: DEFAULT_DURATIONS.error,
      actions: [{
        label: 'Повторить',
        action: () => window.location.reload()
      }]
    }))
  }, [dispatch])

  const loading = useCallback((message: string = 'Загрузка...') => {
    const id = Date.now().toString()
    dispatch(addNotification({
      type: 'info',
      title: message,
      duration: 0, // No auto-dismiss for loading notifications
      id
    }))
    return id // Return ID so it can be removed later
  }, [dispatch])

  const promise = useCallback(async <T,>(
    promise: Promise<T>,
    messages: {
      loading?: string
      success?: string
      error?: string
    }
  ): Promise<T> => {
    const loadingId = messages.loading ? loading(messages.loading) : null
    
    try {
      const result = await promise
      if (loadingId) remove(loadingId)
      if (messages.success) success(messages.success)
      return result
    } catch (error) {
      if (loadingId) remove(loadingId)
      if (messages.error) {
        dispatch(addNotification({
          type: 'error',
          title: messages.error,
          message: (error as any)?.message,
          duration: DEFAULT_DURATIONS.error
        }))
      } else {
        apiError(error)
      }
      throw error
    }
  }, [dispatch, loading, remove, success, apiError])

  const cartActionSuccess = useCallback((action: 'added' | 'updated' | 'removed') => {
    const messages = {
      added: 'Товар добавлен в корзину',
      updated: 'Количество товара обновлено',
      removed: 'Товар удален из корзины'
    }
    
    dispatch(addNotification({
      type: 'success',
      title: messages[action],
      duration: DEFAULT_DURATIONS.success,
      actions: action === 'added' ? [{
        label: 'Перейти в корзину',
        action: () => window.location.href = '/cart',
        primary: true
      }] : undefined
    }))
  }, [dispatch])

  const orderStatus = useCallback((status: 'created' | 'confirmed' | 'delivered' | 'cancelled') => {
    const configs = {
      created: { 
        type: 'success' as const, 
        title: 'Заказ создан', 
        message: 'Ваш заказ успешно оформлен'
      },
      confirmed: { 
        type: 'info' as const, 
        title: 'Заказ подтвержден', 
        message: 'Мы начали обработку вашего заказа'
      },
      delivered: { 
        type: 'success' as const, 
        title: 'Заказ доставлен', 
        message: 'Спасибо за покупку!'
      },
      cancelled: { 
        type: 'warning' as const, 
        title: 'Заказ отменен', 
        message: 'Ваш заказ был отменен'
      }
    }
    
    const config = configs[status]
    dispatch(addNotification({
      ...config,
      duration: DEFAULT_DURATIONS[config.type]
    }))
  }, [dispatch])

  const confirmAction = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    dispatch(addNotification({
      type: 'warning',
      title,
      message,
      duration: 0, // No auto-dismiss for confirmation dialogs
      actions: [
        {
          label: 'Отмена',
          action: onCancel || (() => {})
        },
        {
          label: 'Подтвердить',
          action: onConfirm,
          primary: true
        }
      ]
    }))
  }, [dispatch])

  return {
    // Basic methods
    show,
    success,
    error,
    warning,
    info,
    remove,
    clearAll,
    
    // Advanced methods
    loading,
    promise,
    confirmAction,
    
    // Preset notifications
    apiError,
    networkError,
    cartActionSuccess,
    orderStatus
  }
}