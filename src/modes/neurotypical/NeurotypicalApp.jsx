/**
 * MODO CLÁSSICO (NEUROTÍPICO)
 * 
 * INSTRUÇÕES:
 * 1. Copiar código original de LS-Puzzle-main/src/App.jsx
 * 2. Adicionar prop { onBack } para retornar ao ModeSelector
 * 3. Separar em componentes modulares (WelcomeScreen, GameScreen, etc.)
 * 4. Usar utilitários de /shared/utils/ para processamento de imagens
 * 
 * ESTRUTURA:
 * - screens/WelcomeScreen.jsx
 * - screens/RegisterScreen.jsx  
 * - screens/UploadScreen.jsx
 * - screens/LevelsScreen.jsx
 * - screens/GameScreen.jsx
 * - screens/VictoryScreen.jsx
 */

import { useState } from 'react'

export default function NeurotypicalApp({ onBack }) {
  const [screen, setScreen] = useState('welcome')

  return (
    <div className="min-h-screen">
      {/* Botão voltar ao ModeSelector */}
      <button
        onClick={onBack}
        className="fixed top-4 left-4 z-50 bg-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
      >
        ← Trocar Modo
      </button>

      {/* TODO: Implementar screens */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Modo Clássico</h2>
          <p className="text-gray-600 mb-4">
            Copiar código original de LS-Puzzle-main/src/App.jsx aqui
          </p>
          <p className="text-sm text-gray-500">
            Ver README.md seção "FASE 2: Modo Neurotípico"
          </p>
        </div>
      </div>
    </div>
  )
}
