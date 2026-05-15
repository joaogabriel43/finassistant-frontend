// scripts/generate-icons.js
// Generates PWA icons for FortunAI using sharp (SVG → PNG)
import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'

const SIZES = [192, 512]
const BG_COLOR = '#7C3AED' // FortunAI purple

async function generateIcon(size) {
  const fontSize = Math.floor(size * 0.5)
  const radius = Math.floor(size * 0.15)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" rx="${radius}" fill="${BG_COLOR}"/>
    <text
      x="${size / 2}"
      y="${size / 2 + fontSize * 0.35}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${fontSize}"
      font-weight="700"
      fill="white"
      text-anchor="middle"
    >F</text>
  </svg>`

  await sharp(Buffer.from(svg))
    .png()
    .toFile(`public/icons/pwa-${size}x${size}.png`)

  console.log(`Generated pwa-${size}x${size}.png`)
}

async function main() {
  if (!existsSync('public/icons')) {
    await mkdir('public/icons', { recursive: true })
  }
  for (const size of SIZES) {
    await generateIcon(size)
  }
  console.log('PWA icons generated in public/icons/')
}

main().catch(console.error)
