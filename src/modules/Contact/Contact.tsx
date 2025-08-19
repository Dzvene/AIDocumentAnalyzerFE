import React, { useState } from 'react'
import './Contact.scss'

interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // TODO: Replace with actual API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <h1 className="contact-hero__title">Свяжитесь с нами</h1>
          <p className="contact-hero__subtitle">
            Мы всегда готовы помочь и ответить на ваши вопросы
          </p>
        </div>
      </div>

      <div className="container">
        <div className="contact-content">
          <div className="contact-info">
            <h2>Контактная информация</h2>
            
            <div className="contact-info__item">
              <div className="icon">📍</div>
              <div className="content">
                <h3>Адрес</h3>
                <p>г. Москва, ул. Примерная, д. 123, офис 456</p>
              </div>
            </div>

            <div className="contact-info__item">
              <div className="icon">📞</div>
              <div className="content">
                <h3>Телефон</h3>
                <p>+7 (495) 123-45-67</p>
                <p>+7 (800) 555-35-35</p>
              </div>
            </div>

            <div className="contact-info__item">
              <div className="icon">✉️</div>
              <div className="content">
                <h3>Email</h3>
                <p>info@onlimitshop.ru</p>
                <p>support@onlimitshop.ru</p>
              </div>
            </div>

            <div className="contact-info__item">
              <div className="icon">🕐</div>
              <div className="content">
                <h3>Время работы</h3>
                <p>Пн-Пт: 9:00 - 20:00</p>
                <p>Сб-Вс: 10:00 - 18:00</p>
              </div>
            </div>

            <div className="contact-info__social">
              <h3>Мы в социальных сетях</h3>
              <div className="social-links">
                <a href="#" aria-label="Telegram">
                  <span>📱</span>
                </a>
                <a href="#" aria-label="VK">
                  <span>💬</span>
                </a>
                <a href="#" aria-label="WhatsApp">
                  <span>💚</span>
                </a>
                <a href="#" aria-label="Instagram">
                  <span>📷</span>
                </a>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper">
            <h2>Отправить сообщение</h2>
            
            {submitStatus === 'success' && (
              <div className="alert alert-success">
                ✅ Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="alert alert-error">
                ❌ Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте позже.
              </div>
            )}

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Ваше имя *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Иван Иванов"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Телефон</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Тема обращения *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Выберите тему</option>
                  <option value="general">Общий вопрос</option>
                  <option value="order">Вопрос по заказу</option>
                  <option value="partner">Стать партнером</option>
                  <option value="complaint">Жалоба</option>
                  <option value="suggestion">Предложение</option>
                  <option value="technical">Техническая поддержка</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Сообщение *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Опишите ваш вопрос или предложение..."
                />
              </div>

              <button 
                type="submit" 
                className="contact-form__submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Отправка...' : 'Отправить сообщение'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <section className="contact-map">
        <div className="container">
          <h2>Как нас найти</h2>
          <div className="map-wrapper">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2245.0974637988745!2d37.61844731593048!3d55.75399998055647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46b54a50b315e573%3A0xa886bf5a3d9b2e68!2sThe%20Moscow%20Kremlin!5e0!3m2!1sen!2sru!4v1635424567890!5m2!1sen!2sru"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section className="contact-faq">
        <div className="container">
          <h2>Часто задаваемые вопросы</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Как оформить заказ?</h3>
              <p>Выберите товары, добавьте их в корзину и следуйте инструкциям при оформлении заказа.</p>
            </div>
            <div className="faq-item">
              <h3>Какие способы оплаты доступны?</h3>
              <p>Мы принимаем оплату картами, наличными при получении и через электронные кошельки.</p>
            </div>
            <div className="faq-item">
              <h3>Сколько стоит доставка?</h3>
              <p>Стоимость доставки зависит от суммы заказа и вашего местоположения. Подробнее при оформлении.</p>
            </div>
            <div className="faq-item">
              <h3>Можно ли вернуть товар?</h3>
              <p>Да, вы можете вернуть товар в течение 14 дней, если он не подошел по качеству.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}