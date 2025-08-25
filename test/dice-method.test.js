import { describe, test, expect, beforeEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

/**
 * Test that verifies new method integrations
 * Ensures the toolchain dependencies are properly maintained
 */

describe('New Method Integration', () => {
  test('built library contains dice method', () => {
    const libPath = path.join(process.cwd(), 'dist/lib/index.js');
    
    // Build library if it doesn't exist (for CI environments)
    if (!existsSync(libPath)) {
      console.log('Built library not found, running build...');
      try {
        execSync('npm run build:lib', { stdio: 'pipe' });
      } catch (error) {
        console.error('Build failed:', error.message);
        throw error;
      }
    }
    
    // Verify the built library file exists
    expect(existsSync(libPath)).toBe(true);
    
    // Read the built library content
    const content = readFileSync(libPath, 'utf-8');
    
    // Verify it contains the dice method
    expect(content).toContain('dice');
    expect(content).toContain('BoardcastHexBoard');
  });

  test('new methods validation is in toolchain validator', () => {
    const validatorPath = path.join(process.cwd(), 'toolchain/board-validator-chevrotain.js');
    
    expect(existsSync(validatorPath)).toBe(true);
    
    const content = readFileSync(validatorPath, 'utf-8');
    
    // Verify dice method is in VALID_METHODS
    expect(content).toContain('dice:');
    expect(content).toContain('dieType, displayedNumber');
    
    // Verify DICE clear type is supported
    expect(content).toContain("'DICE'");
    
    // Verify sleep method is supported
    expect(content).toContain('sleep:');
    expect(content).toContain('sleep(milliseconds)');
  });

  test('library build outputs to expected location', () => {
    const expectedPaths = [
      'dist/lib/index.js',
      'dist/lib/index.js.map'
    ];
    
    // Build library if dist directory doesn't exist
    const distLibPath = path.join(process.cwd(), 'dist/lib');
    if (!existsSync(distLibPath)) {
      console.log('dist/lib directory not found, running build...');
      try {
        execSync('npm run build:lib', { stdio: 'pipe' });
      } catch (error) {
        console.error('Build failed:', error.message);
        throw error;
      }
    }
    
    expectedPaths.forEach(relativePath => {
      const fullPath = path.join(process.cwd(), relativePath);
      expect(existsSync(fullPath)).toBe(true);
    });
  });
});