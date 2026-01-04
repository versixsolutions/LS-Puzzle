export default function WelcomeScreen({ onNext, config }) {
  const playSound = () => {
    if (config.sfx_enabled && navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-md w-full text-center">
        {/* Simple Title */}
        <h1 className="text-4xl font-bold mb-8 text-green-700">
          Quebra-Cabeça
        </h1>

        {/* Large Mascot */}
        <div className="mb-12 bg-white rounded-3xl p-12 shadow-xl inline-block">
          <div className="text-9xl">🧩</div>
        </div>

        {/* Single Large Button */}
        <button
          onClick={() => {
            playSound()
            onNext()
          }}
          className="w-full max-w-sm bg-green-500 hover:bg-green-600 text-white text-2xl font-bold py-8 px-12 rounded-3xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
        >
          Começar
        </button>

        {/* Minimal footer */}
        <p className="mt-8 text-sm text-gray-400">Modo Focado</p>
      </div>
    </div>
  )
}
