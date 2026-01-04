import CryptoJS from 'crypto-js'

/**
 * End-to-End Encryption Utilities
 * Images are encrypted client-side before upload to Supabase
 * Server never has access to decryption keys
 */

// Derive encryption key from parental PIN + child ID
export const deriveKey = (pin, childId, iterations = 10000) => {
  const salt = CryptoJS.SHA256(childId).toString()
  return CryptoJS.PBKDF2(pin, salt, {
    keySize: 256 / 32,
    iterations: iterations
  }).toString()
}

// Encrypt image data (base64 string)
export const encryptImage = (imageBase64, pin, childId) => {
  try {
    const key = deriveKey(pin, childId)
    const iv = CryptoJS.lib.WordArray.random(128 / 8)
    
    const encrypted = CryptoJS.AES.encrypt(imageBase64, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    
    return {
      encryptedData: encrypted.toString(),
      iv: iv.toString()
    }
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt image')
  }
}

// Decrypt image data
export const decryptImage = (encryptedData, iv, pin, childId) => {
  try {
    const key = deriveKey(pin, childId)
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    
    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt image - incorrect PIN?')
  }
}

// Hash PIN for storage (never store plaintext PIN)
export const hashPin = (pin) => {
  return CryptoJS.SHA256(pin).toString()
}

// Verify PIN against hash
export const verifyPin = (pin, hash) => {
  return hashPin(pin) === hash
}

// Generate secure random IV
export const generateIV = () => {
  return CryptoJS.lib.WordArray.random(128 / 8).toString()
}
