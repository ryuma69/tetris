const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, drawPixel) {
  // RGBA buffer with filter byte 0 at each scanline start
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawPixel(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk
  const idatChunk = createChunk('IDAT', deflated);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// Icon Drawer: Neon purple/cyan T-tetromino on dark background
function drawTetrisIcon(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;

  // Outer rounded rect border
  const cornerDist = Math.max(0, Math.hypot(Math.max(0, Math.abs(nx - 0.5) - 0.35), Math.max(0, Math.abs(ny - 0.5) - 0.35)));
  if (cornerDist > 0.12) return [0, 0, 0, 0];

  // Base background
  let r = 16, g = 18, b = 28, a = 255;

  // Tetris T shape
  // Top bar: y in [0.25, 0.45], x in [0.2, 0.8]
  // Center stem: y in [0.45, 0.75], x in [0.4, 0.6]
  const inTopBar = ny >= 0.25 && ny <= 0.48 && nx >= 0.2 && nx <= 0.8;
  const inStem = ny >= 0.45 && ny <= 0.75 && nx >= 0.4 && nx <= 0.6;

  if (inTopBar || inStem) {
    // Gradient from Cyan to Violet
    const grad = nx * 0.6 + ny * 0.4;
    r = Math.floor(6 + grad * 160);
    g = Math.floor(182 - grad * 100);
    b = Math.floor(212 + grad * 35);
  }

  return [r, g, b, a];
}

const outDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

[16, 48, 128].forEach((size) => {
  const pngBuf = createPng(size, size, drawTetrisIcon);
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), pngBuf);
  console.log(`Generated icon-${size}.png (${size}x${size})`);
});
