import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import './UserReviews.scss'

interface Review {
  id: string
  productId: string
  productName: string
  productImage: string
  shopId: string
  shopName: string
  orderId: string
  rating: number
  title: string
  comment: string
  pros: string[]
  cons: string[]
  images: string[]
  isRecommended: boolean
  isAnonymous: boolean
  createdAt: string
  updatedAt?: string
  likes: number
  dislikes: number
  helpfulVotes: number
  status: 'published' | 'pending' | 'rejected'
  moderatorComment?: string
  isVerifiedPurchase: boolean
}

export const UserReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      productId: 'prod-1',
      productName: 'Органические яблоки Голден',
      productImage: '/images/products/apples.jpg',
      shopId: 'shop-1',
      shopName: 'Фермерская лавка',
      orderId: 'ORD-2025-001234',
      rating: 5,
      title: 'Отличные яблоки!',
      comment: 'Очень вкусные и сочные яблоки. Доставили быстро, упаковка хорошая. Буду заказывать еще.',
      pros: ['Вкусные', 'Свежие', 'Хорошая упаковка'],
      cons: ['Цена немного высокая'],
      images: ['/images/reviews/review1_1.jpg'],
      isRecommended: true,
      isAnonymous: false,
      createdAt: '2025-01-10T15:30:00',
      likes: 12,
      dislikes: 1,
      helpfulVotes: 8,
      status: 'published',
      isVerifiedPurchase: true
    },
    {
      id: '2',
      productId: 'prod-2',
      productName: 'Молоко фермерское 3.2%',
      productImage: '/images/products/milk.jpg',
      shopId: 'shop-1',
      shopName: 'Фермерская лавка',
      orderId: 'ORD-2025-001233',
      rating: 4,
      title: 'Хорошее молоко',
      comment: 'Качественное молоко, но немного дороговато. Вкус натуральный, без посторонних привкусов.',
      pros: ['Натуральный вкус', 'Хорошая жирность'],
      cons: ['Дорого', 'Короткий срок хранения'],
      images: [],
      isRecommended: true,
      isAnonymous: false,
      createdAt: '2025-01-08T10:20:00',
      updatedAt: '2025-01-08T10:25:00',
      likes: 5,
      dislikes: 0,
      helpfulVotes: 3,
      status: 'published',
      isVerifiedPurchase: true
    },
    {
      id: '3',
      productId: 'prod-3',
      productName: 'Хлеб ремесленный на закваске',
      productImage: '/images/products/bread.jpg',
      shopId: 'shop-2',
      shopName: 'Пекарня "Традиция"',
      orderId: 'ORD-2025-001232',
      rating: 3,
      title: 'Средне',
      comment: 'Хлеб неплохой, но ожидал большего от ремесленной выпечки.',
      pros: ['Натуральные ингредиенты'],
      cons: ['Суховат', 'Дорого'],
      images: [],
      isRecommended: false,
      isAnonymous: true,
      createdAt: '2025-01-05T14:15:00',
      likes: 2,
      dislikes: 3,
      helpfulVotes: 1,
      status: 'published',
      isVerifiedPurchase: true
    },
    {
      id: '4',
      productId: 'prod-4',
      productName: 'Мёд натуральный липовый',
      productImage: '/images/products/honey.jpg',
      shopId: 'shop-3',
      shopName: 'Медовая лавка',
      orderId: 'ORD-2025-001230',
      rating: 5,
      title: 'Превосходный мёд!',
      comment: 'Настоящий липовый мёд с потрясающим ароматом и вкусом. Качество на высшем уровне.',
      pros: ['Натуральный', 'Ароматный', 'Густой консистенции'],
      cons: [],
      images: ['/images/reviews/review4_1.jpg', '/images/reviews/review4_2.jpg'],
      isRecommended: true,
      isAnonymous: false,
      createdAt: '2025-01-03T09:45:00',
      likes: 20,
      dislikes: 0,
      helpfulVotes: 15,
      status: 'published',
      isVerifiedPurchase: true
    },
    {
      id: '5',
      productId: 'prod-5',
      productName: 'Сыр домашний творожный',
      productImage: '/images/products/cheese.jpg',
      shopId: 'shop-4',
      shopName: 'Сырная лавка',
      orderId: 'ORD-2025-001228',
      rating: 4,
      title: 'Ожидаю модерации',
      comment: 'Хороший домашний сыр с нежным вкусом...',
      pros: ['Нежный вкус', 'Свежий'],
      cons: ['Маленький кусочек'],
      images: [],
      isRecommended: true,
      isAnonymous: false,
      createdAt: '2025-01-01T16:20:00',
      likes: 0,
      dislikes: 0,
      helpfulVotes: 0,
      status: 'pending',
      isVerifiedPurchase: true
    }
  ])

  const [filterStatus, setFilterStatus] = useState<'all' | Review['status']>('all')
  const [filterRating, setFilterRating] = useState<'all' | number>('all')
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'helpful'>('date')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const getStatusBadge = (status: Review['status']) => {
    const statusConfig = {
      published: { label: 'Опубликован', className: 'status-published' },
      pending: { label: 'На модерации', className: 'status-pending' },
      rejected: { label: 'Отклонен', className: 'status-rejected' }
    }
    
    const config = statusConfig[status]
    return <span className={`status-badge ${config.className}`}>{config.label}</span>
  }

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const handleEditReview = (review: Review) => {
    setSelectedReview(review)
    setShowEditModal(true)
  }

  const handleDeleteReview = (review: Review) => {
    setSelectedReview(review)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (selectedReview) {
      setReviews(prev => prev.filter(r => r.id !== selectedReview.id))
      setShowDeleteModal(false)
      setSelectedReview(null)
    }
  }

  const handleImageClick = (image: string) => {
    setSelectedImage(image)
    setShowImageModal(true)
  }

  const filteredReviews = reviews
    .filter(review => {
      if (filterStatus !== 'all' && review.status !== filterStatus) return false
      if (filterRating !== 'all' && review.rating !== filterRating) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'rating':
          return b.rating - a.rating
        case 'helpful':
          return b.helpfulVotes - a.helpfulVotes
        default:
          return 0
      }
    })

  const stats = {
    totalReviews: reviews.length,
    publishedReviews: reviews.filter(r => r.status === 'published').length,
    averageRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
      : '0',
    totalLikes: reviews.reduce((sum, r) => sum + r.likes, 0),
    totalHelpfulVotes: reviews.reduce((sum, r) => sum + r.helpfulVotes, 0)
  }

  return (
    <div className="user-reviews-page">
      <div className="page-header">
        <div className="container">
          <h1>Мои отзывы</h1>
          <nav className="breadcrumb">
            <Link to={ROUTES.HOME}>Главная</Link>
            <span>/</span>
            <Link to={ROUTES.USER_DASHBOARD}>Личный кабинет</Link>
            <span>/</span>
            <span>Мои отзывы</span>
          </nav>
        </div>
      </div>

      <div className="container">
        <div className="reviews-content">
          <div className="reviews-stats">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalReviews}</span>
                <span className="stat-label">Всего отзывов</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <span className="stat-value">{stats.publishedReviews}</span>
                <span className="stat-label">Опубликовано</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <span className="stat-value">{stats.averageRating}</span>
                <span className="stat-label">Средний рейтинг</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👍</div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalLikes}</span>
                <span className="stat-label">Лайков</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💡</div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalHelpfulVotes}</span>
                <span className="stat-label">Полезно</span>
              </div>
            </div>
          </div>

          <div className="reviews-controls">
            <div className="filters">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="filter-select"
              >
                <option value="all">Все статусы</option>
                <option value="published">Опубликованные</option>
                <option value="pending">На модерации</option>
                <option value="rejected">Отклоненные</option>
              </select>

              <select 
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="filter-select"
              >
                <option value="all">Все оценки</option>
                <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                <option value={4}>⭐⭐⭐⭐☆ (4)</option>
                <option value={3}>⭐⭐⭐☆☆ (3)</option>
                <option value={2}>⭐⭐☆☆☆ (2)</option>
                <option value={1}>⭐☆☆☆☆ (1)</option>
              </select>

              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="sort-select"
              >
                <option value="date">По дате</option>
                <option value="rating">По рейтингу</option>
                <option value="helpful">По полезности</option>
              </select>
            </div>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="no-reviews">
              <div className="no-reviews-icon">📝</div>
              <h3>Отзывов не найдено</h3>
              <p>Попробуйте изменить фильтры или оставьте первый отзыв</p>
              <Link to={ROUTES.USER_ORDERS} className="browse-orders-btn">
                Мои заказы
              </Link>
            </div>
          ) : (
            <div className="reviews-list">
              {filteredReviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="product-info">
                      <img 
                        src={review.productImage} 
                        alt={review.productName}
                        className="product-image"
                      />
                      <div className="product-details">
                        <Link 
                          to={`/product/${review.productId}`}
                          className="product-name"
                        >
                          {review.productName}
                        </Link>
                        <Link 
                          to={`/shop/${review.shopId}`}
                          className="shop-name"
                        >
                          {review.shopName}
                        </Link>
                        <span className="order-link">
                          Заказ: <Link to={`/user/orders/${review.orderId}`}>{review.orderId}</Link>
                        </span>
                      </div>
                    </div>
                    
                    <div className="review-meta">
                      {getStatusBadge(review.status)}
                      <div className="review-actions">
                        {review.status === 'published' || review.status === 'pending' ? (
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditReview(review)}
                          >
                            ✏️
                          </button>
                        ) : null}
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteReview(review)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="review-body">
                    <div className="review-rating">
                      <span className="stars">{getRatingStars(review.rating)}</span>
                      <span className="rating-text">({review.rating}/5)</span>
                      {review.isVerifiedPurchase && (
                        <span className="verified-badge">✓ Проверенная покупка</span>
                      )}
                    </div>

                    <h3 className="review-title">{review.title}</h3>
                    <p className="review-comment">{review.comment}</p>

                    {review.pros.length > 0 && (
                      <div className="review-pros-cons">
                        <div className="pros">
                          <h4>👍 Достоинства:</h4>
                          <ul>
                            {review.pros.map((pro, index) => (
                              <li key={index}>{pro}</li>
                            ))}
                          </ul>
                        </div>
                        {review.cons.length > 0 && (
                          <div className="cons">
                            <h4>👎 Недостатки:</h4>
                            <ul>
                              {review.cons.map((con, index) => (
                                <li key={index}>{con}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {review.images.length > 0 && (
                      <div className="review-images">
                        <h4>📷 Фотографии:</h4>
                        <div className="images-grid">
                          {review.images.map((image, index) => (
                            <img 
                              key={index}
                              src={image}
                              alt={`Фото ${index + 1}`}
                              className="review-image"
                              onClick={() => handleImageClick(image)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="review-recommendation">
                      <span className={`recommendation ${review.isRecommended ? 'yes' : 'no'}`}>
                        {review.isRecommended ? '👍 Рекомендую' : '👎 Не рекомендую'}
                      </span>
                      {review.isAnonymous && (
                        <span className="anonymous-badge">🥸 Анонимно</span>
                      )}
                    </div>
                  </div>

                  <div className="review-footer">
                    <div className="review-stats">
                      <span className="likes">👍 {review.likes}</span>
                      <span className="dislikes">👎 {review.dislikes}</span>
                      <span className="helpful">💡 {review.helpfulVotes} полезно</span>
                    </div>
                    
                    <div className="review-dates">
                      <span className="created-date">
                        Создан: {formatDate(review.createdAt)}
                      </span>
                      {review.updatedAt && (
                        <span className="updated-date">
                          Изменен: {formatDate(review.updatedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {review.moderatorComment && (
                    <div className="moderator-comment">
                      <strong>Комментарий модератора:</strong> {review.moderatorComment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="reviews-tips">
            <div className="tips-section">
              <h3>💡 Как написать полезный отзыв</h3>
              <div className="tips-grid">
                <div className="tip">
                  <span className="tip-icon">🎯</span>
                  <div>
                    <h4>Будьте конкретными</h4>
                    <p>Опишите конкретные характеристики товара</p>
                  </div>
                </div>
                <div className="tip">
                  <span className="tip-icon">📷</span>
                  <div>
                    <h4>Добавьте фото</h4>
                    <p>Фотографии помогают другим покупателям</p>
                  </div>
                </div>
                <div className="tip">
                  <span className="tip-icon">⚖️</span>
                  <div>
                    <h4>Взвешенно оценивайте</h4>
                    <p>Укажите и плюсы, и минусы товара</p>
                  </div>
                </div>
                <div className="tip">
                  <span className="tip-icon">🤝</span>
                  <div>
                    <h4>Будьте честными</h4>
                    <p>Ваш опыт поможет другим сделать выбор</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedReview && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Удаление отзыва</h2>
              <button 
                className="close-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p className="warning-message">
                ⚠️ Вы действительно хотите удалить этот отзыв?
              </p>
              <div className="review-preview">
                <h4>{selectedReview.title}</h4>
                <p>Товар: {selectedReview.productName}</p>
                <p>Рейтинг: {getRatingStars(selectedReview.rating)}</p>
              </div>
              <p className="note">Это действие нельзя будет отменить.</p>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Отмена
              </button>
              <button 
                className="delete-btn"
                onClick={handleConfirmDelete}
              >
                Удалить отзыв
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="modal-content image-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Фото из отзыва</h2>
              <button 
                className="close-btn"
                onClick={() => setShowImageModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <img src={selectedImage} alt="Фото из отзыва" className="modal-image" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}