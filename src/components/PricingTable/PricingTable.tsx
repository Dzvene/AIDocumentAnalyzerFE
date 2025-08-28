import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import './PricingTable.scss'

interface PricingTier {
  id: number
  name: string
  name_key: string
  description: string
  description_key: string
  min_pages: number
  max_pages: number | null
  price_per_page: number
  discount_percentage: number
  icon: string
  is_highlighted: boolean
  example_pages: number
  example_price: number
  is_active: boolean
}

interface PricingFeature {
  id: number
  feature_key: string
  feature_name: string
  icon: string
  is_active: boolean
}


const PricingTable: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [features, setFeatures] = useState<PricingFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPricingData()
  }, [])

  const fetchPricingData = async () => {
    try {
      setLoading(true)
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5055'
      // Remove duplicate /api if it's already in the base URL
      const url = baseUrl.endsWith('/api') 
        ? `${baseUrl}/pricing/public` 
        : `${baseUrl}/api/pricing/public`
      const response = await axios.get(url)
      setTiers(response.data.tiers || [])
      setFeatures(response.data.features || [])
    } catch (err) {
      console.error('Failed to fetch pricing data:', err)
      setError('Failed to load pricing information')
      // Use default data as fallback
      setTiers([
        {
          id: 1,
          name: '',  // Will be replaced by getTierName()
          name_key: 'basic',
          description: '',  // Will be replaced by getTierDescription()
          description_key: 'pricing.tiers.basic.description',
          min_pages: 1,
          max_pages: 10,
          price_per_page: 0.99,
          discount_percentage: 0,
          icon: '📄',
          is_highlighted: false,
          example_pages: 10,
          example_price: 9.90,
          is_active: true
        },
        {
          id: 2,
          name: '',  // Will be replaced by getTierName()
          name_key: 'standard',
          description: '',  // Will be replaced by getTierDescription()
          description_key: 'pricing.tiers.standard.description',
          min_pages: 11,
          max_pages: 50,
          price_per_page: 0.79,
          discount_percentage: 20,
          icon: '📚',
          is_highlighted: true,
          example_pages: 30,
          example_price: 23.70,
          is_active: true
        },
        {
          id: 3,
          name: '',  // Will be replaced by getTierName()
          name_key: 'professional',
          description: '',  // Will be replaced by getTierDescription()
          description_key: 'pricing.tiers.professional.description',
          min_pages: 51,
          max_pages: 100,
          price_per_page: 0.59,
          discount_percentage: 40,
          icon: '📖',
          is_highlighted: false,
          example_pages: 75,
          example_price: 44.25,
          is_active: true
        },
        {
          id: 4,
          name: '',  // Will be replaced by getTierName()
          name_key: 'corporate',
          description: '',  // Will be replaced by getTierDescription()
          description_key: 'pricing.tiers.corporate.description',
          min_pages: 101,
          max_pages: null,
          price_per_page: 0.39,
          discount_percentage: 60,
          icon: '🏢',
          is_highlighted: false,
          example_pages: 150,
          example_price: 58.50,
          is_active: true
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getTierName = (tier: PricingTier) => {
    // Используем ключи локализации, которые уже определены
    const tierNames: { [key: string]: string } = {
      basic: t('home.pricing.tiers.basic.name'),
      standard: t('home.pricing.tiers.standard.name'),
      professional: t('home.pricing.tiers.professional.name'),
      corporate: t('home.pricing.tiers.corporate.name')
    }
    return tierNames[tier.name_key] || tier.name
  }

  const getTierDescription = (tier: PricingTier) => {
    // Используем ключи локализации, которые уже определены
    const tierDescriptions: { [key: string]: string } = {
      basic: t('home.pricing.tiers.basic.description'),
      standard: t('home.pricing.tiers.standard.description'),
      professional: t('home.pricing.tiers.professional.description'),
      corporate: t('home.pricing.tiers.corporate.description')
    }
    return tierDescriptions[tier.name_key] || tier.description
  }

  const getTierExample = (tier: PricingTier) => {
    // Используем ключи локализации, которые уже определены
    const tierExamples: { [key: string]: string } = {
      basic: t('home.pricing.tiers.basic.example'),
      standard: t('home.pricing.tiers.standard.example'),
      professional: t('home.pricing.tiers.professional.example'),
      corporate: t('home.pricing.tiers.corporate.example')
    }
    return tierExamples[tier.name_key] || `${tier.example_pages} ${t('home.pricing.pages')} = €${tier.example_price}`
  }

  const getPagesRange = (tier: PricingTier) => {
    if (tier.max_pages) {
      return `${tier.min_pages}-${tier.max_pages}`
    }
    return `${tier.min_pages}+`
  }

  if (loading) {
    return <div className="pricing-table-loading">Загрузка...</div>
  }
  return (
    <div className="pricing-table">
      <div className="pricing-header">
        <h2>💰 {t('home.pricing.title')}</h2>
        <p>{t('home.pricing.subtitle')}</p>
      </div>
      
      <div className="pricing-grid">
        {tiers.filter(tier => tier.is_active).map((tier) => (
          <div 
            key={tier.id} 
            className={`pricing-card ${tier.is_highlighted ? 'highlighted' : ''}`}
          >
            {tier.is_highlighted && <div className="popular-badge">{t('home.pricing.popularBadge')}</div>}
            
            <div className="tier-icon">{tier.icon}</div>
            <h3 className="tier-name">{getTierName(tier)}</h3>
            
            <div className="pages-range">
              {getPagesRange(tier)} {t('home.pricing.pages')}
            </div>
            
            <div className="price">
              <span className="currency">{t('home.pricing.currency')}</span>
              <span className="amount">{tier.price_per_page}</span>
              <span className="per">{t('home.pricing.perPage')}</span>
            </div>
            
            {tier.discount_percentage > 0 && (
              <div className="discount-badge">
                {t('home.pricing.discountBadge')} {tier.discount_percentage}%
              </div>
            )}
            
            <p className="tier-description">{getTierDescription(tier)}</p>
            
            <div className="example-calculation">
              <p className="example-title">{t('home.pricing.example')}</p>
              <p className="example-text">{getTierExample(tier)}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="pricing-features">
        <h3>🎯 {t('home.pricing.features.title')}</h3>
        <div className="features-grid">
          {features.length > 0 ? (
            features.filter(f => f.is_active).map(feature => (
              <div key={feature.id} className="feature">
                <span className="feature-icon">{feature.icon}</span>
                <span>{t(feature.feature_key)}</span>
              </div>
            ))
          ) : (
            // Fallback features
            <>
              <div className="feature">
                <span className="feature-icon">✅</span>
                <span>{t('home.pricing.features.riskDetection')}</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✅</span>
                <span>{t('home.pricing.features.termsAnalysis')}</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✅</span>
                <span>{t('home.pricing.features.recommendations')}</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✅</span>
                <span>{t('home.pricing.features.pdfExport')}</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✅</span>
                <span>{t('home.pricing.features.aiAnalysis')}</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✅</span>
                <span>{t('home.pricing.features.dataPrivacy')}</span>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="pricing-note">
        <p>💡 <strong>{t('home.pricing.tip')}</strong> {t('home.pricing.tipText')}</p>
      </div>
    </div>
  )
}

export default PricingTable