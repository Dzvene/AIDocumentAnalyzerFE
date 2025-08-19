import React, { useState, useEffect } from 'react'
import type { User, CreateUserRequest, UpdateUserRequest } from '@types/interfaces/user'
import './UserModal.scss'

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (userData: CreateUserRequest | UpdateUserRequest) => Promise<void>
  user?: User | null
  mode: 'create' | 'edit'
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  mode
}) => {
  const [formData, setFormData] = useState({
    email: '',
    userName: '',
    firstName: '',
    lastName: '',
    department: '',
    position: '',
    password: '',
    confirmPassword: '',
    roles: [] as string[],
    isActive: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableRoles = ['Admin', 'User', 'Manager', 'Moderator']

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && user) {
        setFormData({
          email: user.email,
          userName: user.userName,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          department: user.department || '',
          position: user.position || '',
          password: '',
          confirmPassword: '',
          roles: user.roles || [],
          isActive: user.isActive
        })
      } else {
        setFormData({
          email: '',
          userName: '',
          firstName: '',
          lastName: '',
          department: '',
          position: '',
          password: '',
          confirmPassword: '',
          roles: [],
          isActive: true
        })
      }
      setErrors({})
    }
  }, [isOpen, mode, user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.userName) {
      newErrors.userName = 'Username is required'
    } else if (formData.userName.length < 3) {
      newErrors.userName = 'Username must be at least 3 characters'
    }

    if (mode === 'create') {
      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    } else if (mode === 'edit' && formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }


    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        const createData: CreateUserRequest = {
          email: formData.email,
          userName: formData.userName,
          password: formData.password,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          department: formData.department || undefined,
          position: formData.position || undefined,
          isActive: formData.isActive,
          roles: formData.roles.length > 0 ? formData.roles : undefined
        }
        await onSave(createData)
      } else {
        const updateData: UpdateUserRequest = {
          id: user!.id,
          email: formData.email,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          department: formData.department || undefined,
          position: formData.position || undefined,
          isActive: formData.isActive
        }

        await onSave(updateData)
      }
      onClose()
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save user' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="user-modal">
      <div className="user-modal__backdrop" onClick={onClose} />
      <div className="user-modal__content">
        <div className="user-modal__header">
          <h2 className="user-modal__title">
            {mode === 'create' ? 'Create New User' : 'Edit User'}
          </h2>
          <button
            type="button"
            className="user-modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form className="user-modal__form" onSubmit={handleSubmit}>
          <div className="user-modal__form-grid">
            <div className="user-modal__field">
              <label className="user-modal__label" htmlFor="email">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`user-modal__input ${errors.email ? 'user-modal__input--error' : ''}`}
                placeholder="user@example.com"
              />
              {errors.email && (
                <span className="user-modal__error">{errors.email}</span>
              )}
            </div>

            <div className="user-modal__field">
              <label className="user-modal__label" htmlFor="userName">
                Username *
              </label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                className={`user-modal__input ${errors.userName ? 'user-modal__input--error' : ''}`}
                placeholder="johndoe"
                disabled={mode === 'edit'}
              />
              {errors.userName && (
                <span className="user-modal__error">{errors.userName}</span>
              )}
            </div>

            <div className="user-modal__field">
              <label className="user-modal__label" htmlFor="firstName">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="user-modal__input"
                placeholder="John"
              />
            </div>

            <div className="user-modal__field">
              <label className="user-modal__label" htmlFor="lastName">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="user-modal__input"
                placeholder="Doe"
              />
            </div>

            <div className="user-modal__field">
              <label className="user-modal__label" htmlFor="department">
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="user-modal__input"
                placeholder="Engineering"
              />
            </div>

            <div className="user-modal__field">
              <label className="user-modal__label" htmlFor="position">
                Position
              </label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="user-modal__input"
                placeholder="Software Developer"
              />
            </div>

            <div className="user-modal__field">
              <label className="user-modal__label" htmlFor="password">
                {mode === 'create' ? 'Password *' : 'New Password'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`user-modal__input ${errors.password ? 'user-modal__input--error' : ''}`}
                placeholder={mode === 'edit' ? 'Leave blank to keep current' : 'Enter password'}
              />
              {errors.password && (
                <span className="user-modal__error">{errors.password}</span>
              )}
            </div>

            <div className="user-modal__field">
              <label className="user-modal__label" htmlFor="confirmPassword">
                {mode === 'create' ? 'Confirm Password *' : 'Confirm New Password'}
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`user-modal__input ${errors.confirmPassword ? 'user-modal__input--error' : ''}`}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && (
                <span className="user-modal__error">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className="user-modal__field">
            <label className="user-modal__label">Roles</label>
            <div className="user-modal__roles">
              {availableRoles.map(role => (
                <label key={role} className="user-modal__role-item">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    className="user-modal__checkbox"
                  />
                  <span className="user-modal__role-label">{role}</span>
                </label>
              ))}
            </div>
            {errors.roles && (
              <span className="user-modal__error">{errors.roles}</span>
            )}
          </div>

          <div className="user-modal__field">
            <label className="user-modal__checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="user-modal__checkbox"
              />
              <span>User is active</span>
            </label>
          </div>

          {errors.submit && (
            <div className="user-modal__submit-error">{errors.submit}</div>
          )}

          <div className="user-modal__actions">
            <button
              type="button"
              className="user-modal__button user-modal__button--cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="user-modal__button user-modal__button--save"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create User' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}