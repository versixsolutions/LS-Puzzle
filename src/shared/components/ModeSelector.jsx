import { useState } from 'react'
import { MODES } from '../../config/constants'

const ModeSelector = ({ onModeSelect }) => {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black mb-2">
            Quebra-Cabeça
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Mágico
            </span>
          </h1>
          <p className="text-gray-600">Monte sua diversão!</p>
        </div>

        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-3xl p-8 shadow-xl">
            <div className="text-8xl">🧩</div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <h2 className="text-center text-xl font-bold text-gray-700 mb-4">
            Escolha o modo de jogo:
          </h2>

          <button
            onClick={() => onModeSelect(MODES.NEUROTYPICAL)}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white rounded-2xl p-6 shadow-lg transform transition-all hover:scale-105 active:scale-95"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-3xl mb-2">🎨</div>
                <h3 className="text-2xl font-bold">Modo Clássico</h3>
                <p className="text-blue-100 text-sm mt-1">
                  Colorido e divertido para todos!
                </p>
              </div>
              <div className="text-4xl">→</div>
            </div>
          </button>

          <button
            onClick={() => onModeSelect(MODES.TEA)}
            className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-2xl p-6 shadow-lg transform transition-all hover:scale-105 active:scale-95"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="text-2xl font-bold">Modo Focado</h3>
                <p className="text-green-100 text-sm mt-1">
                  Especial para crianças com TEA
                </p>
              </div>
              <div className="text-4xl">→</div>
            </div>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span className="text-2xl">ℹ️</span>
            <span className="font-semibold">Qual modo escolher?</span>
          </button>
        </div>

        {showInfo && (
          <div className="mt-6 bg-white rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-lg mb-3">Diferenças entre os modos:</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-blue-600 mb-1">🎨 Modo Clássico</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Interface colorida com animações</li>
                  <li>Todas as peças visíveis ao mesmo tempo</li>
                  <li>Ideal para crianças de 5+ anos</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-green-600 mb-1">🎯 Modo Focado</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Interface simplificada</li>
                  <li>Uma peça por vez</li>
                  <li>Desenvolvido para crianças com TEA</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
            >
              Fechar
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Versix Solutions © 2026
        </p>
      </div>
    </div>
  )
}

export default ModeSelector
