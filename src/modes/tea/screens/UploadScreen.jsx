import { IMAGE_CONSTRAINTS } from '../../../config/constants'
import { validateImageFile, loadImage, createFallbackImage } from '../../../shared/utils/imageProcessing'

export default function UploadScreen({ images, onImagesChange, onNext, onBack, config }) {
  const playSound = () => {
    if (config.sfx_enabled && navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > IMAGE_CONSTRAINTS.MAX_IMAGES) {
      alert(`Máximo ${IMAGE_CONSTRAINTS.MAX_IMAGES} fotos!`)
      return
    }

    const processedImages = await Promise.all(
      files.map(async (file) => {
        const validation = validateImageFile(file)
        if (!validation.valid) {
          console.error(validation.errors)
          return null
        }

        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = async (event) => {
            try {
              const img = await loadImage(event.target.result)
              resolve({
                src: event.target.result,
                name: file.name,
                width: img.width,
                height: img.height
              })
            } catch (error) {
              resolve(null)
            }
          }
          reader.readAsDataURL(file)
        })
      })
    )

    onImagesChange([...images, ...processedImages.filter(img => img !== null)])
    playSound()
  }

  const generateRandomImages = async () => {
    const slotsToFill = IMAGE_CONSTRAINTS.MAX_IMAGES - images.length
    const keywords = ['toys', 'puppy', 'kitten', 'alphabet', 'numbers', 'colors', 'shapes', 'animals']

    playSound()

    const randomImages = await Promise.all(
      Array.from({ length: slotsToFill }).map(async (_, idx) => {
        const keyword = keywords[Math.floor(Math.random() * keywords.length)]
        const uniqueId = Date.now() + Math.random()
        const url = `https://loremflickr.com/800/800/${keyword}?lock=${uniqueId}`

        return new Promise((resolve) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = 800
            canvas.height = 800
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, 800, 800)
            resolve({
              src: canvas.toDataURL('image/jpeg'),
              name: `random-${keyword}-${idx}.jpg`,
              width: 800,
              height: 800
            })
          }
          img.onerror = () => {
            resolve({
              src: createFallbackImage(800, 800, keyword[0].toUpperCase()),
              name: `fallback-${idx}.jpg`,
              width: 800,
              height: 800
            })
          }
          img.src = url
        })
      })
    )

    onImagesChange([...images, ...randomImages.filter(img => img !== null)])
    playSound()
  }

  const removeImage = (index) => {
    onImagesChange(images.filter((_, i) => i !== index))
    playSound()
  }

  const minImagesRequired = 3

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform"
          >
            ←
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold">Escolha suas Fotos</h2>
            <p className="text-sm text-gray-600 mt-1">
              Mínimo {minImagesRequired} fotos
            </p>
          </div>
          <div className="w-12"></div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Fotos adicionadas:</span>
            <span className="text-2xl font-bold text-purple-600">
              {images.length} / {IMAGE_CONSTRAINTS.MAX_IMAGES}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-purple-500 h-4 rounded-full transition-all"
              style={{ width: `${(images.length / IMAGE_CONSTRAINTS.MAX_IMAGES) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Botão Gerar Imagens Aleatórias */}
        {images.length < IMAGE_CONSTRAINTS.MAX_IMAGES && (
          <div className="mb-6">
            <button
              onClick={generateRandomImages}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-4 rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="text-2xl">🎲</span>
              <span>Gerar Imagens Aleatórias</span>
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Preenche automaticamente com imagens educativas
            </p>
          </div>
        )}

        {/* Image Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
          {[...Array(IMAGE_CONSTRAINTS.MAX_IMAGES)].map((_, index) => (
            <div
              key={index}
              className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden relative"
            >
              {images[index] ? (
                <>
                  <img
                    src={images[index].src}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 font-bold shadow-lg"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <span className="text-4xl mb-2">+</span>
                  <span className="text-xs text-gray-500 font-semibold">
                    FOTO {index + 1}
                  </span>
                </label>
              )}
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            💡 <strong>Dica:</strong> Use fotos de objetos familiares, pessoas queridas ou coisas que a criança gosta!
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={() => {
            if (images.length >= minImagesRequired) {
              playSound()
              onNext()
            }
          }}
          disabled={images.length < minImagesRequired}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-xl font-bold py-6 rounded-2xl shadow-xl transition-all disabled:cursor-not-allowed"
        >
          {images.length >= minImagesRequired
            ? 'Continuar ▶️'
            : `Adicione ${minImagesRequired - images.length} fotos`}
        </button>
      </div>
    </div>
  )
}
