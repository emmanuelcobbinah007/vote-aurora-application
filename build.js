#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

// Load environment variables from .env file
require('dotenv').config();

console.log('Starting build process...');

// Generate main Prisma client
try {
  console.log('Generating main Prisma client...');
  execSync('npx prisma generate --schema=prisma/schema.prisma', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log('✓ Main Prisma client generated successfully');
} catch (error) {
  console.error('✗ Failed to generate main Prisma client:', error.message);
  process.exit(1);
}

// Generate university Prisma client
try {
  console.log('Generating university Prisma client...');
  execSync('npx prisma generate --schema=prisma/university.prisma', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log('✓ University Prisma client generated successfully');
} catch (error) {
  console.error('✗ Failed to generate university Prisma client:', error.message);
  process.exit(1);
}

// Build Next.js
try {
  console.log('Building Next.js application...');
  execSync('next build', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log('✓ Next.js build completed successfully');
} catch (error) {
  console.error('✗ Next.js build failed:', error.message);
  process.exit(1);
}

console.log('🎉 Build completed successfully!');