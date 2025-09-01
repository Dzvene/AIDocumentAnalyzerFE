import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Home.scss'

export const Home: React.FC = () => {
  const navigate = useNavigate()

  const handleProcessDocuments = () => {
    navigate('/analyze')
  }

  return (
    <div className="home">
      {/* Header */}
      <header className="home__header">
        <div className="home__header-content">
          <div className="home__logo">Authorize</div>
          <button className="home__menu-btn">☰</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="home__hero">
        <div className="home__hero-label">
          <span className="home__hero-icon">📄</span>
          <span>AI Documents</span>
        </div>
        
        <h1 className="home__title">
          Process documents<br />
          smarter, not harder.<br />
          <span className="home__title-steps">1.. 2.. 3.. Ready!</span>
        </h1>

        <p className="home__subtitle">
          AI that reviews your contracts, finds risks,<br />
          and suggests instant fixes.
        </p>

        <div className="home__features-list">
          <div className="home__feature-item">
            <span className="home__feature-check">✓</span>
            <span>Save hours</span>
          </div>
          <div className="home__feature-item">
            <span className="home__feature-check">✓</span>
            <span>Identify risks</span>
          </div>
          <div className="home__feature-item">
            <span className="home__feature-check">✓</span>
            <span>AI guidance</span>
          </div>
          <div className="home__feature-item">
            <span className="home__feature-check">✓</span>
            <span>Built for people</span>
          </div>
        </div>

        <button className="home__cta-button" onClick={handleProcessDocuments}>
          Process documents free
        </button>
      </section>

      {/* AI Providers Section */}
      <section className="home__ai-providers">
        <span className="home__ai-logo">OpenAI</span>
        <span className="home__ai-logo home__ai-logo--anthropic">ANTHROPIC</span>
        <span className="home__ai-plus">+</span>
        <span className="home__ai-logo home__ai-logo--meta">◯Meta</span>
        <div className="home__ai-help">
          <span className="home__ai-help-icon">?</span>
          <span>Help for people</span>
        </div>
      </section>

      {/* Problem and Solution Section */}
      <section className="home__problem-solution">
        <div className="home__problem">
          <h2 className="home__section-title">The<br />problem</h2>
          <p className="home__section-text">
            Reviewing long contracts takes too much time
          </p>
          <p className="home__section-text">
            Hidden risks can easily slip through unnoticed
          </p>
          <p className="home__section-text">
            Without legal expertise, decisions feel uncertain
          </p>
        </div>

        <div className="home__solution">
          <h2 className="home__section-title home__section-title--solution">The<br />solution</h2>
          <p className="home__section-text home__section-text--white">
            AI quickly analyzes and highlights the key risks
          </p>
          <p className="home__section-text home__section-text--white">
            It spots them fast and warns you right away
          </p>
          <p className="home__section-text home__section-text--white">
            AI gives instant guidance to boost your confidence
          </p>
        </div>
      </section>

      {/* Review Contract Section */}
      <section className="home__review">
        <h2 className="home__review-title">
          Review Any Contract 10x<br />
          Faster with AI Before You<br />
          Sign it
        </h2>
        
        <div className="home__review-features">
          <div className="home__review-feature">
            <span className="home__review-icon">💡</span>
            <h3>Spot critical issues and gain valuable insights</h3>
            <p>Quickly uncover hidden risks in your documents while receiving clear recommendations and actionable recommendations</p>
          </div>
          
          <div className="home__review-feature">
            <span className="home__review-icon">🌍</span>
            <h3>Multi language Support</h3>
            <p>Work seamlessly in your language without translation delays or fees</p>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="home__security">
        <h2 className="home__security-title">Security and Privacy</h2>
        
        <div className="home__security-features">
          <div className="home__security-feature">
            <span className="home__security-icon">🔒</span>
            <p>Uncompromising contract <strong>Security</strong></p>
          </div>
          
          <div className="home__security-feature">
            <p>Built on gold-standard encryption, your documents remain fully protected, allowing you to collaborate and share with absolute confidence.</p>
          </div>
          
          <div className="home__security-feature">
            <span className="home__security-icon">📁</span>
            <p>Your files, your <strong>Control</strong></p>
          </div>
          
          <div className="home__security-feature">
            <p>Unlike traditional platforms, we never store your documents on servers. This ensures complete confidentiality and removes third-party access risks.</p>
          </div>
          
          <div className="home__security-feature">
            <span className="home__security-icon">👤</span>
            <p>Your <strong>Data</strong> is never used for AI training</p>
          </div>
          
          <div className="home__security-feature">
            <p>Our models are never trained on your data. Your documents stay confidential, ensuring they won't improve anyone else's competitive edge or business processes.</p>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="home__testimonial">
        <div className="home__testimonial-image">
          <img src="/images/testimonial.jpg" alt="Pavel Luchkevich" />
        </div>
        
        <div className="home__testimonial-content">
          <div className="home__testimonial-quote">
            <span className="home__quote-mark">"</span>
            <p>Having everyone on standard documents has transformed how we operate. It means clarity gives me peace of mind. I don't need to worry since it reliably risks or unclear terms</p>
            <span className="home__quote-mark home__quote-mark--end">"</span>
          </div>
          
          <div className="home__testimonial-author">
            <strong>Pavel Luchkevich, Housemaster</strong>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="home__final-cta">
        <h2 className="home__final-title">
          Effortless contracts<br />
          for everyone
        </h2>
        
        <p className="home__final-text">
          Check and review your documents<br />
          confidently, all on your own.
        </p>
        
        <button className="home__final-button" onClick={handleProcessDocuments}>
          Process documents free
        </button>
      </section>
    </div>
  )
}