#!/usr/bin/env node
/**
 * Roll With Advantage - Image optimization
 *
 * Resizes oversized images down to a sensible per-folder maximum width and
 * losslessly recompresses them IN PLACE (same path, same format). Files are
 * only overwritten when the optimized version is actually smaller, so it is
 * safe to run repeatedly and will never enlarge a file or change a reference.
 *
 * Why in place / same format: image paths are referenced from HTML, CSS, JS
 * (some built dynamically) and JSON data, and the admin panel uploads new
 * PNG/JPGs. Keeping filenames + formats means nothing has to be rewritten and
 * future uploads can simply be re-run through this script.
 *
 * Usage:
 *   node scripts/optimize-images.js          # optimize in place
 *   node scripts/optimize-images.js --dry    # report only, write nothing
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..', 'public', 'assets', 'images');
const DRY = process.argv.includes('--dry');

// Maximum width (px) per top-level subfolder. Images wider than this are
// downscaled (aspect preserved); narrower images keep their dimensions.
const FOLDER_CAPS = {
  maps: 4096,    // zoomable - keep generous detail
  heirs: 1400,
  houses: 1400,
  story: 1400,
  cast: 1400,
  npcs: 1200,
  tools: 1400,
  dice: 1200,
  artist: 1600
};
const TOP_LEVEL_CAP = 2560; // full-screen backgrounds / textures live at the root

const RASTER = new Set(['.png', '.jpg', '.jpeg']);

function capFor(file) {
  const rel = path.relative(ROOT, file);
  const parts = rel.split(path.sep);
  if (parts.length > 1 && FOLDER_CAPS[parts[0]]) return FOLDER_CAPS[parts[0]];
  return TOP_LEVEL_CAP;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (RASTER.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

async function optimize(file) {
  const ext = path.extname(file).toLowerCase();
  const originalSize = fs.statSync(file).size;
  const image = sharp(file, { failOn: 'none' });
  const meta = await image.metadata();
  const cap = capFor(file);

  let pipeline = sharp(file, { failOn: 'none' }).rotate(); // respect EXIF orientation
  if (meta.width && meta.width > cap) {
    pipeline = pipeline.resize({ width: cap, withoutEnlargement: true });
  }

  if (ext === '.png') {
    pipeline = pipeline.png({ compressionLevel: 9, effort: 10 }); // lossless
  } else {
    pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
  }

  const buffer = await pipeline.toBuffer();
  const saved = originalSize - buffer.length;

  // Only adopt the result if it is meaningfully smaller (>2% and >2KB)
  const worthwhile = saved > Math.max(2048, originalSize * 0.02);
  if (worthwhile && !DRY) {
    fs.writeFileSync(file, buffer);
  }

  return { file, originalSize, newSize: worthwhile ? buffer.length : originalSize, changed: worthwhile };
}

(async () => {
  const files = walk(ROOT);
  console.log(`${DRY ? '[dry run] ' : ''}Scanning ${files.length} raster images under ${path.relative(process.cwd(), ROOT)}\n`);

  let beforeTotal = 0, afterTotal = 0, changedCount = 0;
  const bigWins = [];

  for (const file of files) {
    try {
      const r = await optimize(file);
      beforeTotal += r.originalSize;
      afterTotal += r.newSize;
      if (r.changed) {
        changedCount++;
        const savedMB = (r.originalSize - r.newSize) / 1048576;
        if (savedMB > 0.5) bigWins.push({ file: path.relative(ROOT, file), savedMB, from: r.originalSize, to: r.newSize });
      }
    } catch (e) {
      console.warn(`  ! skipped ${path.relative(ROOT, file)}: ${e.message}`);
    }
  }

  bigWins.sort((a, b) => b.savedMB - a.savedMB);
  if (bigWins.length) {
    console.log('Biggest reductions:');
    for (const w of bigWins.slice(0, 15)) {
      console.log(`  ${(w.from / 1048576).toFixed(1)}MB -> ${(w.to / 1048576).toFixed(2)}MB  ${w.file}`);
    }
    console.log('');
  }

  const pct = beforeTotal ? ((1 - afterTotal / beforeTotal) * 100).toFixed(1) : '0';
  console.log(`${DRY ? '[dry run] would optimize' : 'Optimized'} ${changedCount}/${files.length} files`);
  console.log(`Total: ${(beforeTotal / 1048576).toFixed(1)}MB -> ${(afterTotal / 1048576).toFixed(1)}MB  (${pct}% smaller)`);
})();
