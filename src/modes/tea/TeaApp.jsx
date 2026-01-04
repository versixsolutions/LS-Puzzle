/**
 * MODO FOCADO (TEA)
 * 
 * Implementa mecânica sequencial com configurações sensoriais
 * Ver README.md seção "FASE 3: Modo TEA - MVP" para código completo
 */

import { useState } from 'react'

export default function TeaApp({ onBack }) {
  const [screen, setScreen] = useState('welcome')

  return (
    <div className="min-h-screen">
      <button
        onClick={onBack}
        className="fixed top-4 left-4 z-50 bg-white px-4 py-2 rounded-lg shadow-lg"
      >
        ← Trocar Modo
      </button>

      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold mb-4 text-green-600">Modo Focado (TEA)</h2>
          <p className="text-gray-700 mb-6">
            Este modo está em desenvolvimento.
          </p>
          <div className="text-left space-y-2 text-sm text-gray-600">
            <p>✓ Mecânica sequencial (uma peça por vez)</p>
            <p>✓ Configurações sensoriais granulares</p>
            <p>✓ Transições com countdown de 3s</p>
            <p>✓ Dashboard parental com analytics</p>
          </div>
          <p className="mt-6 text-xs text-gray-500">
            Ver README.md → "FASE 3: Modo TEA - MVP"
          </p>
        </div>
      </div>
    </div>
  )
}
