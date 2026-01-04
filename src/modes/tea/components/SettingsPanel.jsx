export default function SettingsPanel({ config, onConfigChange, onClose }) {
  const handleToggle = (key) => {
    onConfigChange({
      ...config,
      [key]: !config[key]
    })
  }

  const handleVolumeChange = (value) => {
    onConfigChange({
      ...config,
      volume: parseFloat(value)
    })
  }

  const handleHintsDelayChange = (value) => {
    onConfigChange({
      ...config,
      auto_hints_delay: parseInt(value)
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Configurações Sensoriais</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-2xl transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Personalize a experiência sensorial
          </p>
        </div>

        {/* Settings */}
        <div className="p-6 space-y-6">
          {/* 1. Music */}
          <div className="bg-blue-50 rounded-2xl p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex-1">
                <div className="font-bold text-lg mb-1">🎵 Música de Fundo</div>
                <p className="text-sm text-gray-600">
                  Música suave durante o jogo
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  checked={config.music_enabled}
                  onChange={() => handleToggle('music_enabled')}
                  className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-green-500 relative transition-colors cursor-pointer"
                />
              </div>
            </label>
            <div className="mt-2 text-xs text-gray-500">
              Padrão: {config.music_enabled ? 'Ligado' : 'Desligado'}
            </div>
          </div>

          {/* 2. SFX */}
          <div className="bg-green-50 rounded-2xl p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex-1">
                <div className="font-bold text-lg mb-1">🔊 Efeitos Sonoros</div>
                <p className="text-sm text-gray-600">
                  Sons ao tocar e completar
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  checked={config.sfx_enabled}
                  onChange={() => handleToggle('sfx_enabled')}
                  className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-green-500 relative transition-colors cursor-pointer"
                />
              </div>
            </label>
          </div>

          {/* 3. Volume */}
          <div className="bg-purple-50 rounded-2xl p-4">
            <div className="font-bold text-lg mb-3">🎚️ Volume Geral</div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.volume}
              onChange={(e) => handleVolumeChange(e.target.value)}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Silencioso</span>
              <span className="text-lg font-bold text-purple-600">
                {Math.round(config.volume * 100)}%
              </span>
              <span className="text-sm text-gray-600">Alto</span>
            </div>
          </div>

          {/* 4. Haptic */}
          <div className="bg-orange-50 rounded-2xl p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex-1">
                <div className="font-bold text-lg mb-1">📳 Vibração Tátil</div>
                <p className="text-sm text-gray-600">
                  Feedback por vibração
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  checked={config.haptic_enabled}
                  onChange={() => handleToggle('haptic_enabled')}
                  className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-green-500 relative transition-colors cursor-pointer"
                />
              </div>
            </label>
          </div>

          {/* 5. High Contrast */}
          <div className="bg-yellow-50 rounded-2xl p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex-1">
                <div className="font-bold text-lg mb-1">🌗 Alto Contraste</div>
                <p className="text-sm text-gray-600">
                  Cores mais fortes e definidas
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  checked={config.high_contrast}
                  onChange={() => handleToggle('high_contrast')}
                  className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-green-500 relative transition-colors cursor-pointer"
                />
              </div>
            </label>
          </div>

          {/* 6. Reduced Motion */}
          <div className="bg-pink-50 rounded-2xl p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex-1">
                <div className="font-bold text-lg mb-1">🎬 Animações Reduzidas</div>
                <p className="text-sm text-gray-600">
                  Menos movimento na tela
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  checked={config.reduced_motion}
                  onChange={() => handleToggle('reduced_motion')}
                  className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-green-500 relative transition-colors cursor-pointer"
                />
              </div>
            </label>
          </div>

          {/* 7. Auto Hints */}
          <div className="bg-teal-50 rounded-2xl p-4">
            <label className="flex items-center justify-between cursor-pointer mb-3">
              <div className="flex-1">
                <div className="font-bold text-lg mb-1">💡 Dicas Automáticas</div>
                <p className="text-sm text-gray-600">
                  Mostra a imagem guia após inatividade
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  checked={config.auto_hints}
                  onChange={() => handleToggle('auto_hints')}
                  className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-green-500 relative transition-colors cursor-pointer"
                />
              </div>
            </label>

            {config.auto_hints && (
              <div className="mt-3 pt-3 border-t border-teal-200">
                <label className="block text-sm font-semibold mb-2">
                  Tempo de espera:
                </label>
                <select
                  value={config.auto_hints_delay}
                  onChange={(e) => handleHintsDelayChange(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-teal-200 bg-white font-semibold"
                >
                  <option value="5000">5 segundos</option>
                  <option value="10000">10 segundos</option>
                  <option value="15000">15 segundos (padrão)</option>
                  <option value="20000">20 segundos</option>
                  <option value="30000">30 segundos</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-3xl border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-colors"
          >
            Salvar e Fechar
          </button>
          <p className="text-xs text-gray-500 text-center mt-3">
            As configurações são salvas automaticamente
          </p>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: #10b981;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #10b981;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        input[type="checkbox"]::before {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          top: 2px;
          left: 2px;
          transition: transform 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        input[type="checkbox"]:checked::before {
          transform: translateX(24px);
        }
      `}</style>
    </div>
  )
}
