export default function PhaseScreen({ 
  currentLevel, 
  levelProgress, 
  childName, 
  childAvatar,
  onSelectLevel, 
  onBack,
  config 
}) {
  const playSound = () => {
    if (config.sfx_enabled && navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const currentPhase = levelProgress[currentLevel]
  const isUnlocked = currentLevel === 0 || levelProgress[currentLevel - 1].stars > 0
  const completions = currentPhase.completions || 0
  const requiredCompletions = 3 // Need 3 completions to unlock next

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform"
          >
            ←
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold">Escolha a Fase</h2>
          </div>
          <div className="w-12"></div>
        </div>

        {/* Child Info */}
        <div className="bg-white rounded-2xl p-6 shadow-xl mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full border-4 border-green-400 overflow-hidden bg-gray-100">
              {childAvatar ? (
                <img src={childAvatar} alt={childName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  👤
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{childName || 'Jogador'}</h3>
              <p className="text-sm text-gray-500">Fase Atual: {currentLevel + 1}</p>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="bg-green-50 rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold">Progresso Total</span>
              <span className="text-lg font-bold text-green-600">
                {levelProgress.filter(l => l.stars > 0).length} / {levelProgress.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{
                  width: `${(levelProgress.filter(l => l.stars > 0).length / levelProgress.length) * 100}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Current Phase Card (ONLY ONE) */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">
              {isUnlocked ? '🧩' : '🔒'}
            </div>
            <h3 className="text-3xl font-bold mb-2">
              Fase {currentLevel + 1}
            </h3>
            <p className="text-xl text-gray-600">
              {currentPhase.pieces} Peças
            </p>
          </div>

          {/* Completion Progress */}
          {isUnlocked && completions > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold mb-2">Você já jogou:</p>
              <div className="flex gap-2 justify-center">
                {[...Array(requiredCompletions)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      i < completions ? 'bg-green-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {i < completions ? '✓' : (i + 1)}
                  </div>
                ))}
              </div>
              {completions < requiredCompletions && (
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Jogue {requiredCompletions - completions} vez(es) para desbloquear a próxima fase!
                </p>
              )}
            </div>
          )}

          {/* Stars */}
          <div className="flex justify-center gap-3 mb-6">
            {[1, 2, 3].map(star => (
              <span
                key={star}
                className={`text-4xl transition-all ${
                  currentPhase.stars >= star
                    ? 'text-yellow-400 scale-110'
                    : 'text-gray-300'
                }`}
              >
                ⭐
              </span>
            ))}
          </div>

          {/* Play Button */}
          {isUnlocked ? (
            <button
              onClick={() => {
                playSound()
                onSelectLevel(currentLevel)
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-2xl font-bold py-6 rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              ▶️ Jogar Agora
            </button>
          ) : (
            <div className="bg-gray-100 text-gray-500 text-center py-6 rounded-2xl">
              <p className="text-xl font-bold">🔒 Bloqueado</p>
              <p className="text-sm mt-2">Complete a fase anterior</p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {currentLevel > 0 && (
            <button
              onClick={() => {
                playSound()
                onSelectLevel(currentLevel - 1)
              }}
              className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-4 rounded-2xl shadow-lg transition-colors"
            >
              ← Fase Anterior
            </button>
          )}
          
          {currentLevel < levelProgress.length - 1 && 
           levelProgress[currentLevel].stars > 0 &&
           completions >= requiredCompletions && (
            <button
              onClick={() => {
                playSound()
                onSelectLevel(currentLevel + 1)
              }}
              className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-4 rounded-2xl shadow-lg transition-colors"
            >
              Próxima Fase →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
