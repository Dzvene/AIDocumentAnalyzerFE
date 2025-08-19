import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import './BlogPost.scss'

interface BlogPostData {
  id: number
  title: string
  content: string
  author: string
  authorAvatar: string
  authorBio: string
  date: string
  readTime: string
  category: string
  image: string
  tags: string[]
  views: number
  likes: number
}

interface RelatedPost {
  id: number
  title: string
  image: string
  date: string
  readTime: string
}

export const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<BlogPostData | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    // TODO: Replace with actual API call
    setTimeout(() => {
      const mockPost: BlogPostData = {
        id: Number(id),
        title: 'Как выбрать свежие продукты в магазине',
        content: `
          <p>Выбор свежих продуктов - это искусство, которое требует внимания к деталям и знания некоторых хитростей. В этой статье мы поделимся с вами проверенными советами, которые помогут вам всегда выбирать самые качественные и свежие продукты.</p>
          
          <h2>Овощи и фрукты</h2>
          <p>При выборе овощей и фруктов обращайте внимание на их внешний вид, запах и текстуру. Свежие продукты должны быть упругими на ощупь, иметь яркий цвет и приятный аромат.</p>
          
          <h3>Помидоры</h3>
          <p>Хорошие помидоры должны быть равномерно окрашены, без пятен и вмятин. Они должны быть упругими, но не твердыми. Спелый помидор имеет характерный аромат у плодоножки.</p>
          
          <h3>Огурцы</h3>
          <p>Свежие огурцы должны быть твердыми по всей длине, без мягких участков. Кожица должна быть ярко-зеленой, без желтизны. Избегайте огурцов с морщинистой кожей.</p>
          
          <h2>Мясо и птица</h2>
          <p>При выборе мяса обращайте внимание на цвет, запах и текстуру. Свежее мясо должно иметь естественный цвет, без серых или зеленоватых оттенков.</p>
          
          <h3>Говядина</h3>
          <p>Качественная говядина имеет ярко-красный цвет с белыми прожилками жира. Мясо должно быть упругим и быстро восстанавливать форму после нажатия.</p>
          
          <h3>Курица</h3>
          <p>Свежая курица имеет розоватый цвет без серых пятен. Кожа должна быть сухой, но не липкой. Избегайте курицы с неприятным запахом.</p>
          
          <h2>Рыба и морепродукты</h2>
          <p>Свежая рыба - залог вкусного и полезного блюда. Вот на что стоит обратить внимание при выборе.</p>
          
          <h3>Признаки свежести рыбы</h3>
          <ul>
            <li>Ясные, выпуклые глаза</li>
            <li>Ярко-красные жабры</li>
            <li>Блестящая чешуя</li>
            <li>Упругое мясо</li>
            <li>Свежий морской запах</li>
          </ul>
          
          <h2>Молочные продукты</h2>
          <p>Всегда проверяйте срок годности и условия хранения молочных продуктов. Они должны храниться в холодильниках при правильной температуре.</p>
          
          <h2>Заключение</h2>
          <p>Помните, что качественные продукты - это основа здорового питания. Не стесняйтесь задавать вопросы продавцам и требовать сертификаты качества. Ваше здоровье стоит того, чтобы потратить немного больше времени на выбор действительно свежих продуктов.</p>
        `,
        author: 'Анна Петрова',
        authorAvatar: 'https://via.placeholder.com/60',
        authorBio: 'Эксперт по питанию с 10-летним опытом. Автор множества статей о здоровом образе жизни.',
        date: '2024-01-15',
        readTime: '5 мин',
        category: 'Советы',
        image: 'https://via.placeholder.com/800x400',
        tags: ['продукты', 'советы', 'покупки', 'свежесть', 'качество'],
        views: 1234,
        likes: 89
      }

      const mockRelated: RelatedPost[] = [
        {
          id: 2,
          title: 'Топ-10 местных производителей нашего города',
          image: 'https://via.placeholder.com/300x200',
          date: '2024-01-12',
          readTime: '8 мин'
        },
        {
          id: 3,
          title: 'Сезонные акции и скидки: как не пропустить выгоду',
          image: 'https://via.placeholder.com/300x200',
          date: '2024-01-10',
          readTime: '4 мин'
        },
        {
          id: 5,
          title: 'Экологичные покупки: как сделать шопинг более ответственным',
          image: 'https://via.placeholder.com/300x200',
          date: '2024-01-05',
          readTime: '6 мин'
        }
      ]

      setPost(mockPost)
      setRelatedPosts(mockRelated)
      setLoading(false)
    }, 500)
  }, [id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const handleLike = () => {
    setLiked(!liked)
    if (post) {
      setPost({
        ...post,
        likes: liked ? post.likes - 1 : post.likes + 1
      })
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.title,
        url: window.location.href
      })
    }
  }

  if (loading) {
    return (
      <div className="blog-post-loading">
        <div className="spinner"></div>
        <p>Загрузка статьи...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="blog-post-error">
        <h2>Статья не найдена</h2>
        <Link to={ROUTES.BLOG}>Вернуться к блогу</Link>
      </div>
    )
  }

  return (
    <div className="blog-post-page">
      <div className="blog-post-hero">
        <img src={post.image} alt={post.title} />
        <div className="overlay"></div>
        <div className="container">
          <div className="hero-content">
            <div className="breadcrumbs">
              <Link to={ROUTES.HOME}>Главная</Link>
              <span>/</span>
              <Link to={ROUTES.BLOG}>Блог</Link>
              <span>/</span>
              <span>{post.category}</span>
            </div>
            <h1>{post.title}</h1>
            <div className="meta">
              <span className="date">{formatDate(post.date)}</span>
              <span className="separator">•</span>
              <span className="read-time">📖 {post.readTime}</span>
              <span className="separator">•</span>
              <span className="views">👁 {post.views} просмотров</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="blog-post-content">
          <div className="content-wrapper">
            <div className="author-info">
              <img src={post.authorAvatar} alt={post.author} />
              <div className="author-details">
                <h3>{post.author}</h3>
                <p>{post.authorBio}</p>
              </div>
            </div>

            <div 
              className="article-content" 
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="article-tags">
              <h3>Теги:</h3>
              <div className="tags">
                {post.tags.map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
            </div>

            <div className="article-actions">
              <button 
                className={`action-btn like-btn ${liked ? 'liked' : ''}`}
                onClick={handleLike}
              >
                <span className="icon">{liked ? '❤️' : '🤍'}</span>
                <span className="text">Нравится ({post.likes})</span>
              </button>
              <button className="action-btn share-btn" onClick={handleShare}>
                <span className="icon">📤</span>
                <span className="text">Поделиться</span>
              </button>
            </div>
          </div>

          <aside className="sidebar">
            <div className="sidebar-widget">
              <h3>Похожие статьи</h3>
              <div className="related-posts">
                {relatedPosts.map(relatedPost => (
                  <Link 
                    key={relatedPost.id} 
                    to={`${ROUTES.BLOG}/${relatedPost.id}`}
                    className="related-post"
                  >
                    <img src={relatedPost.image} alt={relatedPost.title} />
                    <div className="related-post-content">
                      <h4>{relatedPost.title}</h4>
                      <div className="meta">
                        <span>{formatDate(relatedPost.date)}</span>
                        <span>•</span>
                        <span>{relatedPost.readTime}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="sidebar-widget">
              <h3>Подписка на блог</h3>
              <p>Получайте новые статьи на email</p>
              <form className="subscribe-form">
                <input 
                  type="email" 
                  placeholder="Ваш email"
                  required
                />
                <button type="submit">Подписаться</button>
              </form>
            </div>

            <div className="sidebar-widget">
              <h3>Следите за нами</h3>
              <div className="social-links">
                <a href="#" aria-label="Telegram">📱 Telegram</a>
                <a href="#" aria-label="VK">💬 VKontakte</a>
                <a href="#" aria-label="WhatsApp">💚 WhatsApp</a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}