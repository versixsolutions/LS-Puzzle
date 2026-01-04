import { IMAGE_CONSTRAINTS } from '../../config/constants'

/**
 * Image Processing Utilities
 * Canvas-based manipulation for puzzle pieces
 */

// Calculate optimal grid based on piece count and aspect ratio
export const calculateGrid = (pieceCount, aspectRatio = 1) => {
  let bestCols = 2
  let bestRows = 2
  let minDiff = Infinity
  
  for (let cols = 2; cols <= pieceCount; cols++) {
    if (pieceCount % cols === 0) {
      const rows = pieceCount / cols
      const gridRatio = cols / rows
      const diff = Math.abs(gridRatio - aspectRatio)
      
      if (diff < minDiff) {
        minDiff = diff
        bestCols = cols
        bestRows = rows
      }
    }
  }
  
  return { rows: bestRows, cols: bestCols }
}

// Convert image to square canvas (crop from center)
export const imageToSquareCanvas = (img, size = IMAGE_CONSTRAINTS.TARGET_SIZE) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    
    const minSize = Math.min(img.width, img.height)
    const sourceX = (img.width - minSize) / 2
    const sourceY = (img.height - minSize) / 2
    
    ctx.drawImage(
      img,
      sourceX, sourceY, minSize, minSize,
      0, 0, size, size
    )
    
    resolve(canvas)
  })
}

// Split canvas into puzzle pieces
export const splitIntoPieces = async (imageCanvas, rows, cols) => {
  const pieceWidth = imageCanvas.width / cols
  const pieceHeight = imageCanvas.height / rows
  const pieces = []
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const pieceCanvas = document.createElement('canvas')
      pieceCanvas.width = pieceWidth
      pieceCanvas.height = pieceHeight
      const pieceCtx = pieceCanvas.getContext('2d')
      
      pieceCtx.drawImage(
        imageCanvas,
        col * pieceWidth, row * pieceHeight,
        pieceWidth, pieceHeight,
        0, 0,
        pieceWidth, pieceHeight
      )
      
      pieces.push({
        id: row * cols + col,
        correctRow: row,
        correctCol: col,
        currentRow: row,
        currentCol: col,
        image: pieceCanvas.toDataURL('image/jpeg', 0.8),
        isPlaced: false
      })
    }
  }
  
  return pieces
}

// Shuffle pieces (deterministic with seed for TEA mode)
export const shufflePieces = (pieces, cols, deterministic = false, seed = null) => {
  const shuffled = [...pieces]
  
  if (deterministic && seed) {
    // Deterministic shuffle using seed
    const random = seededRandom(seed)
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
  } else {
    // Random shuffle
    shuffled.sort(() => Math.random() - 0.5)
  }
  
  // Update positions
  return shuffled.map((piece, index) => ({
    ...piece,
    currentRow: Math.floor(index / cols),
    currentCol: index % cols
  }))
}

// Seeded random number generator for deterministic shuffling
function seededRandom(seed) {
  let x = Math.sin(seed++) * 10000
  return () => {
    x = Math.sin(x) * 10000
    return x - Math.floor(x)
  }
}

// Generate seed from image URL and user ID
export const generateSeed = (imageUrl, userId) => {
  let hash = 0
  const str = `${imageUrl}${userId}`
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

// Load image from URL or base64
export const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Create fallback image (for when uploads fail)
export const createFallbackImage = (width = 800, height = 800, text = '?') => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C']
  ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
  ctx.fillRect(0, 0, width, height)
  
  ctx.fillStyle = 'white'
  ctx.font = 'bold 40px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, width / 2, height / 2)
  
  return canvas.toDataURL('image/jpeg')
}

// Validate image file
export const validateImageFile = (file) => {
  const errors = []
  
  if (!IMAGE_CONSTRAINTS.SUPPORTED_FORMATS.includes(file.type)) {
    errors.push(`Formato não suportado: ${file.type}`)
  }
  
  const maxSizeBytes = IMAGE_CONSTRAINTS.MAX_SIZE_MB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    errors.push(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB (máximo ${IMAGE_CONSTRAINTS.MAX_SIZE_MB}MB)`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Compress image if too large
export const compressImage = async (imageBase64, maxSizeKB = 500) => {
  const img = await loadImage(imageBase64)
  const canvas = document.createElement('canvas')
  
  let width = img.width
  let height = img.height
  const maxDimension = 1200
  
  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = (height / width) * maxDimension
      width = maxDimension
    } else {
      width = (width / height) * maxDimension
      height = maxDimension
    }
  }
  
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, width, height)
  
  // Binary search for optimal quality
  let quality = 0.9
  let compressed = canvas.toDataURL('image/jpeg', quality)
  
  while (compressed.length > maxSizeKB * 1024 && quality > 0.1) {
    quality -= 0.1
    compressed = canvas.toDataURL('image/jpeg', quality)
  }
  
  return compressed
}
