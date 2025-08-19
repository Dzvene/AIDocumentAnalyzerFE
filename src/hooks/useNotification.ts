import { useDispatch } from 'react-redux'
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

export const useNotification = () => {
  const dispatch = useDispatch()

  const show = (notification: Omit<Notification, 'id'>) => {
    dispatch(addNotification(notification))
  }

  const success = (title: string, message?: string) => {
    dispatch(showSuccessNotification(title, message))
  }

  const error = (title: string, message?: string) => {
    dispatch(showErrorNotification(title, message))
  }

  const warning = (title: string, message?: string) => {
    dispatch(showWarningNotification(title, message))
  }

  const info = (title: string, message?: string) => {
    dispatch(showInfoNotification(title, message))
  }

  const remove = (id: string) => {
    dispatch(removeNotification(id))
  }

  const clearAll = () => {
    dispatch(clearAllNotifications())
  }

  // Helper functions for common scenarios
  const apiError = (error: any) => {
    const message = error?.response?.data?.message || error?.message || 'Произошла ошибка'
    dispatch(showErrorNotification('Ошибка', message))
  }

  const networkError = () => {
    dispatch(showErrorNotification(
      'Ошибка сети',
      'Проверьте подключение к интернету и попробуйте снова'
    ))
  }

  const cartActionSuccess = (action: 'added' | 'updated' | 'removed') => {
    const messages = {
      added: 'Товар добавлен в корзину',
      updated: 'Количество товара обновлено',
      removed: 'Товар удален из корзины'
    }
    dispatch(showSuccessNotification(messages[action]))
  }

  const orderStatus = (status: 'created' | 'confirmed' | 'delivered' | 'cancelled') => {
    const messages = {
      created: 'Заказ создан успешно',
      confirmed: 'Заказ подтвержден',
      delivered: 'Заказ доставлен',
      cancelled: 'Заказ отменен'
    }
    dispatch(showInfoNotification('Статус заказа', messages[status]))
  }

  return {
    show,
    success,
    error,
    warning,
    info,
    remove,
    clearAll,
    apiError,
    networkError,
    cartActionSuccess,
    orderStatus
  }
}