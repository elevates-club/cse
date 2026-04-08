import sharp from 'sharp';
import { readdir, stat, writeFile } from 'fs/promises';
import { join, extname } from 'path';

const TARGET_DIRS = ['./public'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const QUALITY = 30;

async function compressImage(filePath) {
  const ext = extname(filePath).toLowerCase();
  const buffer = await sharp(filePath)
    .webp({ quality: QUALITY, effort: 0 }) // Convert to WebP at aggressive speed/quality
    .toBuffer();

  const originalSize = (await stat(filePath)).size;
  // Rename extension to .webp if it wasn't already
  const newPath = filePath.replace(ext, '.webp');
  await writeFile(newPath, buffer);
  const newSize = (await stat(newPath)).size;

  const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(2);
  console.log(`✅ Compressed: ${filePath} -> ${newPath} (${(originalSize / 1024).toFixed(1)}KB -> ${(newSize / 1024).toFixed(1)}KB, -${reduction}%)`);
}

async function walk(dir) {
  const files = await readdir(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    const stats = await stat(fullPath);
    if (stats.isDirectory()) {
      await walk(fullPath);
    } else if (ALLOWED_EXTENSIONS.includes(extname(file).toLowerCase())) {
      try {
        await compressImage(fullPath);
      } catch (err) {
        console.error(`❌ Failed to compress ${fullPath}:`, err.message);
      }
    }
  }
}

async function main() {
  console.log('🚀 Starting image compression...');
  for (const dir of TARGET_DIRS) {
    console.log(`Scanning ${dir}...`);
    await walk(dir);
  }
  console.log('✨ Compression complete!');
}

main().catch(console.error);
