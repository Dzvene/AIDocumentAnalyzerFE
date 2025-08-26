import React from 'react'
import './PricingTable.scss'

interface PricingTier {
  pages: string
  pricePerPage: number
  discount: number
  icon: string
  tier: string
  description: string
  highlighted?: boolean
}

const PRICING_TIERS: PricingTier[] = [
  {
    pages: '1-10',
    pricePerPage: 0.99,
    discount: 0,
    icon: '📄',
    tier: 'Базовый',
    description: 'Идеально для небольших документов'
  },
  {
    pages: '11-50',
    pricePerPage: 0.79,
    discount: 20,
    icon: '📚',
    tier: 'Стандарт',
    description: 'Для средних документов и договоров',
    highlighted: true
  },
  {
    pages: '51-100',
    pricePerPage: 0.59,
    discount: 40,
    icon: '📖',
    tier: 'Профи',
    description: 'Для объемных контрактов'
  },
  {
    pages: '100+',
    pricePerPage: 0.39,
    discount: 60,
    icon: '🏢',
    tier: 'Корпоративный',
    description: 'Максимальная выгода для больших документов'
  }
]

const PricingTable: React.FC = () => {
  return (
    <div className="pricing-table">
      <div className="pricing-header">
        <h2>💰 Прозрачное ценообразование</h2>
        <p>Чем больше страниц в документе, тем выгоднее цена за страницу</p>
      </div>
      
      <div className="pricing-grid">
        {PRICING_TIERS.map((tier, index) => (
          <div 
            key={index} 
            className={`pricing-card ${tier.highlighted ? 'highlighted' : ''}`}
          >
            {tier.highlighted && <div className="popular-badge">Популярный</div>}
            
            <div className="tier-icon">{tier.icon}</div>
            <h3 className="tier-name">{tier.tier}</h3>
            
            <div className="pages-range">
              {tier.pages} страниц
            </div>
            
            <div className="price">
              <span className="currency">€</span>
              <span className="amount">{tier.pricePerPage}</span>
              <span className="per">/стр</span>
            </div>
            
            {tier.discount > 0 && (
              <div className="discount-badge">
                Скидка {tier.discount}%
              </div>
            )}
            
            <p className="tier-description">{tier.description}</p>
            
            <div className="example-calculation">
              <p className="example-title">Пример:</p>
              <p className="example-text">
                {tier.pages === '1-10' && '10 страниц = €9.90'}
                {tier.pages === '11-50' && '30 страниц = €23.70'}
                {tier.pages === '51-100' && '75 страниц = €44.25'}
                {tier.pages === '100+' && '150 страниц = €58.50'}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="pricing-features">
        <h3>🎯 Что входит в анализ:</h3>
        <div className="features-grid">
          <div className="feature">
            <span className="feature-icon">✅</span>
            <span>Выявление всех рисков и подводных камней</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✅</span>
            <span>Анализ важных условий и обязательств</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✅</span>
            <span>Персональные рекомендации</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✅</span>
            <span>Экспорт отчета в PDF</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✅</span>
            <span>AI-анализ от OpenAI/Claude</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✅</span>
            <span>Конфиденциальность данных</span>
          </div>
        </div>
      </div>
      
      <div className="pricing-note">
        <p>💡 <strong>Совет:</strong> Загружайте несколько документов одновременно для максимальной экономии!</p>
      </div>
    </div>
  )
}

export default PricingTable