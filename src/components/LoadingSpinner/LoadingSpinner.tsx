import React from 'react'
import './LoadingSpinner.scss'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullScreen = false,
}) => {
  const containerClass = fullScreen
    ? 'loading-spinner-container loading-spinner-container--fullscreen'
    : 'loading-spinner-container'

  return (
    <div className={containerClass}>
      <div className={`loading-spinner loading-spinner--${size}`}>
        <div className="loading-spinner__inner"></div>
      </div>
    </div>
  )
}