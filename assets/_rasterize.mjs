import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const dir = dirname(fileURLToPath(import.meta.url)) + '/';

const bg = readFileSync(dir + 'icon-background.svg');
const fg = readFileSync(dir + 'icon-foreground.svg');

// 1) couches adaptatives 1024px
await sharp(bg).resize(1024, 1024).png().toFile(dir + 'icon-background.png');
await sharp(fg).resize(1024, 1024).png().toFile(dir + 'icon-foreground.png');

// 2) icône composée (legacy / aperçu) = fond + avant-plan
const bgPng = await sharp(bg).resize(1024, 1024).png().toBuffer();
const fgPng = await sharp(fg).resize(1024, 1024).png().toBuffer();
await sharp(bgPng).composite([{ input: fgPng }]).png().toFile(dir + 'icon-only.png');
await sharp(bgPng).composite([{ input: fgPng }]).png().toFile(dir + 'logo.png');

// 3) splash 2732px : fond violet centré + carte plus petite
const splashBg = await sharp(bg).resize(2732, 2732).png().toBuffer();
const fgSmall = await sharp(fg).resize(2350, 2350).png().toBuffer();
await sharp(splashBg)
  .composite([{ input: fgSmall, gravity: 'center' }])
  .png().toFile(dir + 'splash.png');
await sharp(splashBg)
  .composite([{ input: fgSmall, gravity: 'center' }])
  .png().toFile(dir + 'splash-dark.png');

console.log('Rasterisation OK');
