import { useEffect } from 'react'

export default function VictoryScreen({ level, image, onNext, onRetry, onMenu, config }) {
  useEffect(() => {
    // Gentle celebration feedback
    if (config.haptic_enabled && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 100])
    }
  }, [config])

  const playSound = () => {
    if (config.sfx_enabled && navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-yellow-50 to-green-50 animate-fade-in">
      <div className="max-w-md w-full">
        {/* Gentle Celebration */}
        <div className="text-center mb-8 animate-bounce-gentle">
          <div className="text-8xl mb-4">✓</div>
          <h1 className="text-4xl font-bold text-green-600 mb-2">
            Parabéns!
          </h1>
          <p className="text-xl text-gray-700">
            Você conseguiu!
          </p>
        </div>

        {/* Completed Image */}
        <div className="bg-white rounded-3xl p-4 shadow-2xl mb-8 transform hover:scale-105 transition-transform">
          {image && (
            <img
              src={image.src}
              alt="Puzzle completo"
              className="w-full rounded-2xl"
            />
          )}
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">✓</span>
            </div>
          </div>
        </div>

        {/* Stars (gentle animation) */}
        <div className="flex justify-center gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="text-6xl animate-star"
              style={{
                animationDelay: `${(i - 1) * 0.2}s`,
                opacity: config.reduced_motion ? 1 : 0
              }}
            >
              ⭐
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              playSound()
              onNext()
            }}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-6 rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
          >
            Próxima Fase ▶️
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => {
                playSound()
                onRetry()
              }}
              className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-4 rounded-2xl shadow-lg transition-colors"
            >
              🔄 Jogar Novamente
            </button>

            <button
              onClick={() => {
                playSound()
                onMenu()
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl shadow-lg transition-colors"
            >
              🏠 Menu
            </button>
          </div>
        </div>

        {/* Encouraging message */}
        <div className="mt-8 text-center">
          <p className="text-lg font-semibold text-gray-700">
            Muito bem! Continue assim! 🎉
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes star {
          0% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
          100% { opacity: 1; transform: scale(1) rotate(360deg); }
        }

        .animate-fade-in {
          animation: ${config.reduced_motion ? 'none' : 'fade-in 0.5s ease-in'};
        }

        .animate-bounce-gentle {
          animation: ${config.reduced_motion ? 'none' : 'bounce-gentle 2s ease-in-out infinite'};
        }

        .animate-star {
          animation: ${config.reduced_motion ? 'none' : 'star 0.6s ease-out forwards'};
        }
      `}</style>
    </div>
  )
}
