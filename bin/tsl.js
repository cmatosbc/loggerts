#!/usr/bin/env node
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { startLogging, stopLogging } from './commandLogger';

const args = process.argv.slice(2);

const command = args[0];

if (command === 'init') {
  startLogging();
  console.log('TSL logging started...');
} else if (command === 'halt') {
  stopLogging();
  console.log('TSL logging stopped.');
} else {
  console.log(`Unknown command: ${command}`);
}
