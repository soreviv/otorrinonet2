import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const algorithm = 'aes-256-gcm'

function getKey(): Buffer {
  const password = process.env.ENCRYPTION_KEY
  const kdfSalt = process.env.ENCRYPTION_KDF_SALT

  if (!password || !kdfSalt) {
    if (process.env.NODE_ENV === 'production') {
      // In production without keys: data is stored plaintext (log warning, don't crash)
      console.warn('[crypto] ENCRYPTION_KEY / ENCRYPTION_KDF_SALT not set — data will NOT be encrypted at rest.')
    }
    // Deterministic dev key derived from fixed strings
    return scryptSync('otorrinonet-dev-key-not-for-production', 'otorrinonet-kdf-salt-dev', 32)
  }

  return scryptSync(password, kdfSalt, 32)
}

// Returns "iv:authTag:encryptedHex"
export function encrypt(text: string): string {
  if (!text) return text
  const key = getKey()
  const iv = randomBytes(16)
  const cipher = createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')
  return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

export function decrypt(data: string): string {
  if (!data || !data.includes(':')) return data
  try {
    const [ivHex, authTagHex, encryptedText] = data.split(':')
    const key = getKey()
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const decipher = createDecipheriv(algorithm, key, iv)
    decipher.setAuthTag(authTag)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch {
    // Data wasn't encrypted (legacy plaintext) — return as-is
    return data
  }
}
