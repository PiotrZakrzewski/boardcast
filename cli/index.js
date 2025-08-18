#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const command = process.argv[2];
const arg = process.argv[3];

function showHelp() {
  console.log(`
Boardcast CLI - Create animated hex board tutorials

Usage:
  boardcast create <filename.js>    Create new tutorial boilerplate
  boardcast record <filename.js>    Record tutorial to WebM video

Examples:
  boardcast create my-tutorial.js
  boardcast record my-tutorial.js
  `);
}

async function main() {
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  switch (command) {
    case 'create':
      if (!arg) {
        console.error('❌ Error: Please specify a filename');
        console.log('Usage: boardcast create <filename.js>');
        process.exit(1);
      }
      const { createTutorial } = await import('./create.js');
      await createTutorial(arg);
      break;

    case 'record':
      if (!arg) {
        console.error('❌ Error: Please specify a tutorial file');
        console.log('Usage: boardcast record <filename.js>');
        process.exit(1);
      }
      const { recordTutorial } = await import('./record.js');
      await recordTutorial(arg);
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});