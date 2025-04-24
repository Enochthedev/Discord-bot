// lib/scaffoldCore.js
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { writeFile, createFolders } from './utils.js';
import * as templates from './templates.js';

// The scaffoldProject function now expects a "domains" array!
export function scaffoldProject({ projectName, withPrisma, withMongo, minimal, cwd, domains }) {
  const projectDir = path.join(cwd, projectName);
  if (fs.existsSync(projectDir)) {
    console.error(`❌ Directory "${projectName}" already exists.`);
    process.exit(1);
  }

  console.log(`🚀 Creating ${projectName}...`);
  fs.mkdirSync(projectDir, { recursive: true });

  // ---- Init NPM ----
  execSync(`npm init -y`, { cwd: projectDir, stdio: 'inherit' });

  // ---- Deps ----
  console.log('📦 Installing dependencies...');
  execSync(`npm install discord.js dotenv zod`, { cwd: projectDir, stdio: 'inherit' });
  execSync(`npm install -D typescript tsx ts-node @types/node`, { cwd: projectDir, stdio: 'inherit' });
  if (withPrisma) execSync(`npm install prisma @prisma/client`, { cwd: projectDir, stdio: 'inherit' });
  if (withMongo) execSync(`npm install mongodb`, { cwd: projectDir, stdio: 'inherit' });

  // ---- Folders ----
  const domainFolders = domains.map(domain => [
    `src/domains/${domain}/commands`
  ]).flat();

  createFolders([
    projectDir,
    path.join(projectDir, 'src/bot'),
    path.join(projectDir, 'src/config'),
    path.join(projectDir, 'src/handlers'),
    path.join(projectDir, 'src/interactions/registry'),
    path.join(projectDir, 'src/interactions'),
    path.join(projectDir, 'src/middlewares'),
    path.join(projectDir, 'src/utils'),
    ...(withPrisma ? [path.join(projectDir, 'prisma'), path.join(projectDir, 'src/prisma')] : []),
    ...(withMongo ? [path.join(projectDir, 'src/mongodb')] : []),
    ...domainFolders.map(f => path.join(projectDir, f))
  ]);

  // ---- Files ----
  writeFile(projectDir, 'tsconfig.json', templates.tsconfig());
  writeFile(projectDir, '.env', templates.env({ withPrisma, withMongo }));
  writeFile(projectDir, 'turbo.json', templates.turbo());
  writeFile(projectDir, 'src/config/index.ts', templates.config());
  writeFile(projectDir, 'src/utils/paths.ts', templates.pathsUtil());
  writeFile(projectDir, 'src/interactions/shared.ts', templates.shared());
  writeFile(projectDir, 'src/interactions/registry/commands.ts', templates.commandsRegistry(domains));
  writeFile(projectDir, 'src/handlers/commands.ts', templates.commandsHandler());
  writeFile(projectDir, 'src/bot/client.ts', templates.client());
  writeFile(projectDir, 'src/bot/deploy.ts', templates.deploy());
  writeFile(projectDir, 'src/bot/bot.ts', templates.bot());
  writeFile(projectDir, `src/domains/${domains[0]}/commands/ping.ts`, templates.pingCommand());

  // Optional: Prisma/Mongo
  if (withPrisma) {
    writeFile(projectDir, 'prisma/schema.prisma', templates.prismaSchema());
    writeFile(projectDir, 'src/prisma/client.ts', templates.prismaClient());
  }
  if (withMongo) {
    writeFile(projectDir, 'src/mongodb/mongoClient.ts', templates.mongoClient());
  }

  // Package JSON
  const pkgPath = path.join(projectDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.scripts = { dev: 'tsx src/bot/bot.ts', deploy: 'tsx src/bot/deploy.ts' };
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  // README
  writeFile(projectDir, 'README.md', templates.readme());

  console.log(`✅ Project "${projectName}" is ready.`);
}