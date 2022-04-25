#!/usr/bin/env node
import { spawn } from 'child_process';
import { resolve } from 'path';

spawn('node', ['--experimental-json-modules', '--no-warnings', resolve(process.cwd(), 'build', 'src', 'index.js')], { stdio: 'inherit' });