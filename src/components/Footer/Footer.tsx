import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.scss'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="footer">
      <div className="footer__content">
        <p className="footer__text">
          &copy; {currentYear} Base Admin UI. All rights reserved.
        </p>
        <div className="footer__links">
          <Link to="/privacy-policy" className="footer__link">Privacy Policy</Link>
          <span className="footer__separator">•</span>
          <Link to="/terms-of-service" className="footer__link">Terms of Service</Link>
          <span className="footer__separator">•</span>
          <Link to="/support" className="footer__link">Support</Link>
        </div>
      </div>
    </footer>
  )
}