import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './NotFound.scss'

interface Star {
  id: number
  x: number
  y: number
  size: number
  animationDuration: number
  opacity: number
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
}

const NotFound: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [stars, setStars] = useState<Star[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particleIdRef = useRef(0)

  // Generate random stars
  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = []
      for (let i = 0; i < 100; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          animationDuration: Math.random() * 3 + 2,
          opacity: Math.random() * 0.8 + 0.2
        })
      }
      setStars(newStars)
    }
    generateStars()
  }, [])

  // Mouse move handler for parallax effect
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const x = (clientX / window.innerWidth - 0.5) * 20
    const y = (clientY / window.innerHeight - 0.5) * 20
    setMousePosition({ x, y })

    // Create particles on mouse move
    if (particles.length < 50) {
      const newParticle: Particle = {
        id: particleIdRef.current++,
        x: clientX,
        y: clientY,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        color: `hsl(${Math.random() * 60 + 200}, 70%, 50%)`,
        life: 100
      }
      setParticles(prev => [...prev, newParticle])
    }
  }

  // Animate particles
  useEffect(() => {
    const animate = () => {
      setParticles(prev => prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 1
        }))
        .filter(particle => particle.life > 0)
      )
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Draw constellation effect on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const drawConstellation = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw connecting lines between nearby stars
      stars.forEach((star1, i) => {
        stars.slice(i + 1).forEach(star2 => {
          const dist = Math.sqrt(
            Math.pow((star1.x - star2.x) * canvas.width / 100, 2) +
            Math.pow((star1.y - star2.y) * canvas.height / 100, 2)
          )
          
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(star1.x * canvas.width / 100, star1.y * canvas.height / 100)
            ctx.lineTo(star2.x * canvas.width / 100, star2.y * canvas.height / 100)
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - dist / 150)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
    }

    drawConstellation()
  }, [stars])

  const handleGoHome = () => {
    navigate('/')
  }

  const handleGoBack = () => {
    window.history.back()
  }

  return (
    <div className="not-found-container" onMouseMove={handleMouseMove}>
      {/* Animated stars background */}
      <div className="stars-container">
        {stars.map(star => (
          <div
            key={star.id}
            className="star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDuration: `${star.animationDuration}s`,
              transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
            }}
          />
        ))}
      </div>

      {/* Constellation canvas */}
      <canvas ref={canvasRef} className="constellation-canvas" />

      {/* Animated particles */}
      <div className="particles-container">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: particle.life / 100
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="not-found-content">
        <div className="astronaut-container">
          <div className="astronaut">
            <div className="astronaut-helmet">
              <div className="astronaut-glass"></div>
            </div>
            <div className="astronaut-body"></div>
            <div className="astronaut-arm-left"></div>
            <div className="astronaut-arm-right"></div>
            <div className="astronaut-leg-left"></div>
            <div className="astronaut-leg-right"></div>
          </div>
        </div>

        <div className="error-content">
          {/* Glitch effect 404 */}
          <h1 className="error-code" data-text="404">
            <span className="error-4">4</span>
            <span className="error-0">0</span>
            <span className="error-4">4</span>
          </h1>
          
          <h2 className="error-title">
            {t('notFound.title', 'Lost in Space')}
          </h2>
          
          <p className="error-description">
            {t('notFound.description', "Houston, we have a problem! The page you're looking for has drifted into the void.")}
          </p>

          {/* Interactive buttons */}
          <div className="error-actions">
            <button 
              className="action-button primary"
              onClick={handleGoHome}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <span className="button-text">
                {t('notFound.goHome', 'Return to Earth')}
              </span>
              <span className="button-icon">🚀</span>
            </button>
            
            <button 
              className="action-button secondary"
              onClick={handleGoBack}
            >
              <span className="button-text">
                {t('notFound.goBack', 'Go Back')}
              </span>
              <span className="button-icon">↩️</span>
            </button>
          </div>

          {/* Fun facts */}
          <div className="fun-fact">
            <p className="fun-fact-text">
              {t('notFound.funFact', '💡 Fun fact: Error 404 was named after room 404 at CERN, where the World Wide Web was developed.')}
            </p>
          </div>
        </div>

        {/* Floating planets */}
        <div className="planets-container">
          <div className="planet planet-1"></div>
          <div className="planet planet-2"></div>
          <div className="planet planet-3"></div>
          <div className="satellite"></div>
        </div>

        {/* UFO Easter egg */}
        <div className="ufo-container">
          <div className="ufo">
            <div className="ufo-top"></div>
            <div className="ufo-bottom">
              <div className="ufo-light"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Rocket launch on hover */}
      {isHovering && (
        <div className="rocket-launch">
          <div className="rocket">
            <div className="rocket-body"></div>
            <div className="rocket-fin rocket-fin-left"></div>
            <div className="rocket-fin rocket-fin-right"></div>
            <div className="rocket-window"></div>
            <div className="rocket-fire">
              <div className="flame flame-1"></div>
              <div className="flame flame-2"></div>
              <div className="flame flame-3"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotFound