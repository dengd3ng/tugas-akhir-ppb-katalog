import { join } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync, mkdirSync } from 'fs'
import { deflateSync } from 'zlib'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const outDir = join(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

const icons = [
  { name: 'icon-192.png', size: 192, color: { r: 79, g: 70, b: 229, a: 255 } }, // indigo-600
  { name: 'icon-512.png', size: 512, color: { r: 79, g: 70, b: 229, a: 255 } }
]

function crc32(buf) {
  const table = crc32.table || (crc32.table = makeTable())
  let crc = -1
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff]
  return (crc ^ -1) >>> 0
}

function makeTable() {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[i] = c >>> 0
  }
  return table
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const crcBuf = Buffer.alloc(4)
  const crc = crc32(Buffer.concat([typeBuf, data]))
  crcBuf.writeUInt32BE(crc, 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function createPNG(width, height, color) {
  const sig = Buffer.from([137,80,78,71,13,10,26,10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  // raw image data: each scanline starts with filter type 0
  const bytesPerPixel = 4
  const rowLen = 1 + width * bytesPerPixel
  const raw = Buffer.alloc(rowLen * height)
  for (let y = 0; y < height; y++) {
    const rowStart = y * rowLen
    raw[rowStart] = 0 // no filter
    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * bytesPerPixel
      raw[px] = color.r
      raw[px+1] = color.g
      raw[px+2] = color.b
      raw[px+3] = color.a
    }
  }

  const idatData = deflateSync(raw)
  const idat = Buffer.from(idatData)
  const iend = Buffer.alloc(0)

  const png = Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', iend)
  ])
  return png
}

for (const ic of icons) {
  const outPath = join(outDir, ic.name)
  const png = createPNG(ic.size, ic.size, ic.color)
  writeFileSync(outPath, png)
  console.log(`Wrote ${outPath} (${ic.size}x${ic.size})`)
}
console.log('All icons generated.')
