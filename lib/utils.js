import fs from 'fs';
import path from 'path';

export function writeFile(projectDir, filePath, content) {
  const fullPath = path.join(projectDir, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trimStart());
}

export function createFolders(folders) {
  folders.forEach(f => fs.mkdirSync(f, { recursive: true }));
}