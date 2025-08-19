import React, { useEffect, useState } from 'react'
import './Categories.scss'

interface Category {
  id: number
  name: string
  description: string
  icon: string
  productCount: number
}

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with API call
    const mockCategories: Category[] = [
      { id: 1, name: 'Продукты питания', description: 'Свежие продукты каждый день', icon: '🍎', productCount: 234 },
      { id: 2, name: 'Напитки', description: 'Соки, вода, газировка', icon: '🥤', productCount: 156 },
      { id: 3, name: 'Молочные продукты', description: 'Молоко, сыр, йогурт', icon: '🥛', productCount: 89 },
      { id: 4, name: 'Хлеб и выпечка', description: 'Свежий хлеб', icon: '🍞', productCount: 67 },
      { id: 5, name: 'Мясо и рыба', description: 'Свежее мясо и рыба', icon: '🥩', productCount: 112 },
      { id: 6, name: 'Овощи и фрукты', description: 'Сезонные овощи и фрукты', icon: '🥦', productCount: 198 },
      { id: 7, name: 'Снеки', description: 'Чипсы, орехи, сухофрукты', icon: '🥨', productCount: 143 },
      { id: 8, name: 'Замороженные продукты', description: 'Полуфабрикаты и мороженое', icon: '🧊', productCount: 87 },
    ]
    
    setTimeout(() => {
      setCategories(mockCategories)
      setLoading(false)
    }, 500)
  }, [])

  return (
    <div className="categories-page">
      <div className="container">
        <div className="categories-header">
          <h1 className="categories-title">Категории товаров</h1>
          <p className="categories-subtitle">Выберите интересующую вас категорию</p>
        </div>

        {loading ? (
          <div className="categories-loading">
            <div className="spinner"></div>
            <p>Загрузка категорий...</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category.id} className="category-card">
                <div className="category-icon">{category.icon}</div>
                <h3 className="category-name">{category.name}</h3>
                <p className="category-description">{category.description}</p>
                <div className="category-footer">
                  <span className="product-count">{category.productCount} товаров</span>
                  <button className="category-link">
                    Перейти
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}