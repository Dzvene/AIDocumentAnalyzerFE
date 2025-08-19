import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import './Blog.scss'

interface BlogPost {
  id: number
  title: string
  excerpt: string
  content: string
  author: string
  date: string
  readTime: string
  category: string
  image: string
  tags: string[]
}

export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // TODO: Replace with actual API call
    setTimeout(() => {
      const mockPosts: BlogPost[] = [
        {
          id: 1,
          title: 'Как выбрать свежие продукты в магазине',
          excerpt: 'Полезные советы и рекомендации по выбору свежих овощей, фруктов и других продуктов питания.',
          content: '',
          author: 'Анна Петрова',
          date: '2024-01-15',
          readTime: '5 мин',
          category: 'Советы',
          image: 'https://via.placeholder.com/400x250',
          tags: ['продукты', 'советы', 'покупки']
        },
        {
          id: 2,
          title: 'Топ-10 местных производителей нашего города',
          excerpt: 'Обзор лучших местных фермеров и производителей качественных продуктов в нашем регионе.',
          content: '',
          author: 'Иван Сидоров',
          date: '2024-01-12',
          readTime: '8 мин',
          category: 'Обзоры',
          image: 'https://via.placeholder.com/400x250',
          tags: ['производители', 'местные', 'обзор']
        },
        {
          id: 3,
          title: 'Сезонные акции и скидки: как не пропустить выгоду',
          excerpt: 'Узнайте, как отслеживать лучшие предложения и экономить на покупках.',
          content: '',
          author: 'Мария Козлова',
          date: '2024-01-10',
          readTime: '4 мин',
          category: 'Акции',
          image: 'https://via.placeholder.com/400x250',
          tags: ['акции', 'скидки', 'экономия']
        },
        {
          id: 4,
          title: 'История успеха: от маленькой лавки до сети магазинов',
          excerpt: 'Вдохновляющая история о том, как небольшой семейный бизнес превратился в успешную торговую сеть.',
          content: '',
          author: 'Дмитрий Волков',
          date: '2024-01-08',
          readTime: '10 мин',
          category: 'Истории',
          image: 'https://via.placeholder.com/400x250',
          tags: ['бизнес', 'история', 'успех']
        },
        {
          id: 5,
          title: 'Экологичные покупки: как сделать шопинг более ответственным',
          excerpt: 'Простые способы сделать ваши покупки более экологичными и осознанными.',
          content: '',
          author: 'Елена Зеленова',
          date: '2024-01-05',
          readTime: '6 мин',
          category: 'Экология',
          image: 'https://via.placeholder.com/400x250',
          tags: ['экология', 'осознанность', 'зеленый']
        },
        {
          id: 6,
          title: 'Новые технологии в торговле: что ждет нас в будущем',
          excerpt: 'Обзор инновационных решений и технологий, которые меняют привычный шопинг.',
          content: '',
          author: 'Александр Техно',
          date: '2024-01-03',
          readTime: '7 мин',
          category: 'Технологии',
          image: 'https://via.placeholder.com/400x250',
          tags: ['технологии', 'инновации', 'будущее']
        }
      ]
      setPosts(mockPosts)
      setLoading(false)
    }, 500)
  }, [])

  const categories = [
    { value: 'all', label: 'Все статьи' },
    { value: 'Советы', label: 'Советы' },
    { value: 'Обзоры', label: 'Обзоры' },
    { value: 'Акции', label: 'Акции' },
    { value: 'Истории', label: 'Истории' },
    { value: 'Экология', label: 'Экология' },
    { value: 'Технологии', label: 'Технологии' }
  ]

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const latestPost = filteredPosts[0]
  const otherPosts = filteredPosts.slice(1)

  return (
    <div className="blog-page">
      <div className="blog-hero">
        <div className="container">
          <h1 className="blog-hero__title">Блог OnLimitShop</h1>
          <p className="blog-hero__subtitle">
            Полезные статьи, новости и советы о покупках и местных магазинах
          </p>
        </div>
      </div>

      <div className="container">
        <div className="blog-filters">
          <div className="blog-filters__categories">
            {categories.map(category => (
              <button
                key={category.value}
                className={`category-btn ${selectedCategory === category.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
          <div className="blog-filters__search">
            <input
              type="text"
              placeholder="Поиск по блогу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {loading ? (
          <div className="blog-loading">
            <div className="spinner"></div>
            <p>Загрузка статей...</p>
          </div>
        ) : (
          <>
            {latestPost && (
              <div className="blog-featured">
                <div className="blog-featured__image">
                  <img src={latestPost.image} alt={latestPost.title} />
                  <span className="category-badge">{latestPost.category}</span>
                </div>
                <div className="blog-featured__content">
                  <div className="meta">
                    <span className="date">{formatDate(latestPost.date)}</span>
                    <span className="separator">•</span>
                    <span className="author">{latestPost.author}</span>
                    <span className="separator">•</span>
                    <span className="read-time">📖 {latestPost.readTime}</span>
                  </div>
                  <h2>
                    <Link to={`${ROUTES.BLOG}/${latestPost.id}`}>
                      {latestPost.title}
                    </Link>
                  </h2>
                  <p className="excerpt">{latestPost.excerpt}</p>
                  <div className="tags">
                    {latestPost.tags.map(tag => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                  <Link to={`${ROUTES.BLOG}/${latestPost.id}`} className="read-more">
                    Читать далее →
                  </Link>
                </div>
              </div>
            )}

            <div className="blog-grid">
              {otherPosts.map(post => (
                <article key={post.id} className="blog-card">
                  <div className="blog-card__image">
                    <img src={post.image} alt={post.title} />
                    <span className="category-badge">{post.category}</span>
                  </div>
                  <div className="blog-card__content">
                    <div className="meta">
                      <span className="date">{formatDate(post.date)}</span>
                      <span className="separator">•</span>
                      <span className="read-time">{post.readTime}</span>
                    </div>
                    <h3>
                      <Link to={`${ROUTES.BLOG}/${post.id}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="excerpt">{post.excerpt}</p>
                    <div className="footer">
                      <span className="author">✍️ {post.author}</span>
                      <Link to={`${ROUTES.BLOG}/${post.id}`} className="read-link">
                        Читать →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="blog-empty">
                <span className="icon">📝</span>
                <h3>Статьи не найдены</h3>
                <p>Попробуйте изменить категорию или поисковый запрос</p>
              </div>
            )}
          </>
        )}

        <div className="blog-sidebar">
          <div className="sidebar-widget">
            <h3>Популярные теги</h3>
            <div className="tag-cloud">
              <button className="tag-btn">продукты</button>
              <button className="tag-btn">советы</button>
              <button className="tag-btn">акции</button>
              <button className="tag-btn">местные</button>
              <button className="tag-btn">экология</button>
              <button className="tag-btn">технологии</button>
              <button className="tag-btn">доставка</button>
              <button className="tag-btn">качество</button>
            </div>
          </div>

          <div className="sidebar-widget">
            <h3>Подписка на новости</h3>
            <p>Получайте уведомления о новых статьях и акциях</p>
            <form className="subscribe-form">
              <input 
                type="email" 
                placeholder="Ваш email"
                required
              />
              <button type="submit">Подписаться</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}