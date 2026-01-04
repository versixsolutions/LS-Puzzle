import { useState, useEffect } from 'react'
import { TRANSITION_DURATION_MS } from '../../../config/constants'

export default function TransitionScreen({ targetScreen, onComplete, config }) {
  const [countdown, setCountdown] = useState(3)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Sound on start
    if (config.sfx_enabled && navigator.vibrate) {
      navigator.vibrate(100)
    }

    // Countdown timer
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setTimeout(onComplete, 500)
          return 0
        }
        
        // Play sound on each count
        if (config.sfx_enabled && navigator.vibrate) {
          navigator.vibrate(50)
        }
        
        return prev - 1
      })
    }, 1000)

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + (100 / (TRANSITION_DURATION_MS / 100))
      })
    }, 100)

    return () => {
      clearInterval(interval)
      clearInterval(progressInterval)
    }
  }, [onComplete, config])

  const getTargetMessage = () => {
    switch (targetScreen) {
      case 'game':
        return 'Começar Jogo'
      case 'victory':
        return 'Ver Resultado'
      default:
        return 'Próxima Tela'
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-yellow-100 p-4">
      {/* Countdown Circle */}
      <div className="relative mb-12">
        <div className="w-64 h-64 rounded-full border-8 border-orange-400 flex items-center justify-center bg-white shadow-2xl">
          <span className="text-9xl font-bold text-orange-500">
            {countdown}
          </span>
        </div>
        
        {/* Animated ring */}
        <div 
          className="absolute inset-0 rounded-full border-8 border-transparent border-t-orange-600"
          style={{
            animation: config.reduced_motion ? 'none' : 'spin 1s linear infinite'
          }}
        ></div>
      </div>

      {/* Message */}
      <div className="text-center mb-8">
        <p className="text-xl text-gray-700 mb-2">
          Em <span className="font-bold text-orange-600">{countdown}</span> segundos
        </p>
        <p className="text-2xl font-bold text-orange-600">
          {getTargetMessage()}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md bg-white rounded-full h-4 shadow-lg overflow-hidden">
        <div
          className="bg-gradient-to-r from-orange-400 to-yellow-400 h-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Preview Icon */}
      <div className="mt-12 text-8xl opacity-50">
        {targetScreen === 'game' ? '🧩' : '⭐'}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
