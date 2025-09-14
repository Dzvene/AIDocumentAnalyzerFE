import React from 'react'
import classNames from 'classnames'
import './Button.scss'

export interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className,
  icon,
  iconPosition = 'right',
  ...props
}) => {
  const buttonClasses = classNames(
    'button',
    `button--${variant}`,
    `button--${size}`,
    {
      'button--disabled': disabled || loading,
      'button--loading': loading,
      'button--full-width': fullWidth,
    },
    className
  )

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick()
    }
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="button__spinner" />}
      <span className={loading ? 'button__content--hidden' : 'button__content'}>
        {icon && iconPosition === 'left' && <span className="button__icon button__icon--left">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="button__icon button__icon--right">{icon}</span>}
      </span>
    </button>
  )
}