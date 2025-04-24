#!/usr/bin/env node

import minimist from 'minimist';
import prompts from 'prompts';
import { scaffoldProject } from '../lib/scaffoldCore.js';

const args = minimist(process.argv.slice(2));
const projectName = args._[0];

if (!projectName) {
  console.error('❌ Please provide a project name.');
  console.log('Usage: npx create-discord-ts-bot <project-name> [--with-prisma] [--with-mongo] [--minimal]');
  process.exit(1);
}

// === INTERACTIVE PROMPT ===
async function main() {
  const { domains } = await prompts({
    type: 'list',
    name: 'domains',
    message: 'Enter domain names for your bot (comma-separated, e.g. support,moderation,fun):',
    initial: 'core',
    separator: ','
  });

  // Fallback if prompts cancelled or blank
  const selectedDomains = (domains && domains.length > 0) ? domains.map(d => d.trim()).filter(Boolean) : ['core'];

  // Orchestrate scaffold
  scaffoldProject({
    projectName,
    withPrisma: args['with-prisma'] ?? false,
    withMongo: args['with-mongo'] ?? false,
    minimal: args['minimal'] ?? false,
    cwd: process.cwd(),
    domains: selectedDomains
  });
}

main();