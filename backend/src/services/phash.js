const sharp = require('sharp')

// Convert base64 PNG to a small 8x8 greyscale buffer for hashing
async function getImageHash(base64) {
  const buffer = Buffer.from(base64, 'base64')
  const pixels = await sharp(buffer)
    .resize(8, 8, { fit: 'fill' })
    .greyscale()
    .raw()
    .toBuffer()
  return pixels
}

// Compute average pixel value
function average(pixels) {
  const sum = pixels.reduce((acc, val) => acc + val, 0)
  return sum / pixels.length
}

// Generate 64-bit hash as array of 0s and 1s
function hashFromPixels(pixels) {
  const avg = average(pixels)
  return Array.from(pixels).map(p => (p >= avg ? 1 : 0))
}

// Hamming distance between two hashes
function hammingDistance(hash1, hash2) {
  let diff = 0
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) diff++
  }
  return diff
}

// Returns diff percentage (0 = identical, 100 = completely different)
async function diffPercent(base64a, base64b) {
  const [pixelsA, pixelsB] = await Promise.all([
    getImageHash(base64a),
    getImageHash(base64b)
  ])
  const hashA = hashFromPixels(pixelsA)
  const hashB = hashFromPixels(pixelsB)
  const distance = hammingDistance(hashA, hashB)
  return (distance / 64) * 100
}

module.exports = { diffPercent }
