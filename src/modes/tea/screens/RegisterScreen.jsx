import { useRef } from 'react'
import { ALPHABET } from '../../../config/constants'

export default function RegisterScreen({ name, avatar, onNameChange, onAvatarChange, onNext, onBack, config }) {
  const fileInputRef = useRef(null)

  const playSound = () => {
    if (config.sfx_enabled && navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onAvatarChange(event.target.result)
        playSound()
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform"
          >
            ←
          </button>
          <h2 className="text-2xl font-bold flex-1 text-center">Qual seu nome?</h2>
          <div className="w-12"></div>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer mb-4 w-40 h-40 rounded-full border-6 border-yellow-400 bg-white flex items-center justify-center overflow-hidden shadow-xl hover:scale-105 transition-transform"
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl">👤</span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-yellow-400 hover:bg-yellow-500 px-6 py-3 rounded-full font-bold shadow-lg transition-colors"
          >
            📷 Escolher Foto
          </button>
        </div>

        {/* Name Display */}
        <div className="bg-white border-4 border-gray-200 rounded-2xl px-6 py-4 mb-6 text-center">
          <span className="text-3xl font-bold">{name || '_____'}</span>
        </div>

        {/* Simplified Keyboard (larger buttons) */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {ALPHABET.map(letter => (
            <button
              key={letter}
              onClick={() => {
                if (name.length < 10) {
                  onNameChange(name + letter)
                  playSound()
                }
              }}
              className="aspect-square bg-white hover:bg-blue-100 rounded-xl text-xl font-bold shadow-lg transition-colors active:scale-95"
            >
              {letter}
            </button>
          ))}
          
          {/* Delete Button */}
          <button
            onClick={() => {
              onNameChange(name.slice(0, -1))
              playSound()
            }}
            className="col-span-3 bg-red-100 hover:bg-red-200 rounded-xl font-bold shadow-lg transition-colors"
          >
            ⌫ Apagar
          </button>
          
          {/* Clear Button */}
          <button
            onClick={() => {
              onNameChange('')
              playSound()
            }}
            className="col-span-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold shadow-lg transition-colors"
          >
            🔄 Limpar
          </button>
        </div>

        {/* Continue Button */}
        <button
          onClick={() => {
            if (name.trim()) {
              playSound()
              onNext()
            }
          }}
          disabled={!name.trim()}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-xl font-bold py-6 rounded-2xl shadow-xl transition-all disabled:cursor-not-allowed"
        >
          Continuar ▶️
        </button>
      </div>
    </div>
  )
}
