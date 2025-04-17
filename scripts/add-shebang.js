import fs from 'fs';
const path = './dist/index.js';
const content = fs.readFileSync(path, 'utf8');
if (!content.startsWith('#!')) {
  fs.writeFileSync(path, '#!/usr/bin/env node\n' + content);
}