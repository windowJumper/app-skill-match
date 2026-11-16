const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const outputDir = path.join(__dirname, '..', 'assets', 'images');
const primary = [37, 99, 235, 255];
const points = [
  [0.68, 0.28], [0.36, 0.28], [0.27, 0.35], [0.27, 0.43],
  [0.35, 0.50], [0.65, 0.50], [0.73, 0.57], [0.73, 0.65],
  [0.64, 0.72], [0.32, 0.72],
];

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  const projection = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared));
  return Math.hypot(px - (ax + projection * dx), py - (ay + projection * dy));
}

function renderPng(size, background) {
  const rows = Buffer.alloc((size * 4 + 1) * size);
  const thickness = size * (size < 128 ? 0.105 : 0.087);
  for (let y = 0; y < size; y += 1) {
    const rowOffset = y * (size * 4 + 1);
    for (let x = 0; x < size; x += 1) {
      const px = (x + 0.5) / size;
      const py = (y + 0.5) / size;
      const onMark = points.slice(0, -1).some((point, index) =>
        distanceToSegment(px, py, point[0], point[1], points[index + 1][0], points[index + 1][1]) <= thickness / size / 2,
      );
      const color = onMark ? white : background;
      const offset = rowOffset + 1 + x * 4;
      rows[offset] = color[0];
      rows[offset + 1] = color[1];
      rows[offset + 2] = color[2];
      rows[offset + 3] = color[3];
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(rows, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'icon.png'), renderPng(1024, primary));
fs.writeFileSync(path.join(outputDir, 'android-icon-foreground.png'), renderPng(1024, [0, 0, 0, 0]));
fs.writeFileSync(path.join(outputDir, 'android-icon-monochrome.png'), renderPng(432, [0, 0, 0, 0]));
fs.writeFileSync(path.join(outputDir, 'splash-icon.png'), renderPng(512, [0, 0, 0, 0]));
fs.writeFileSync(path.join(outputDir, 'favicon.png'), renderPng(64, primary));
