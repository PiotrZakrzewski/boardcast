/**
 * Integration tests for color constants support
 * Tests DSL validation, compilation, and runtime behavior
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import path from 'path';
import { readFileSync } from 'fs';

const execAsync = promisify(exec);

describe('Color Constants Integration', () => {
  const testFile = 'color-test.board';
  const jsFile = 'color-test.js';
  
  // Clean up test files
  afterAll(() => {
    if (existsSync(testFile)) unlinkSync(testFile);
    if (existsSync(jsFile)) unlinkSync(jsFile);
  });

  describe('DSL Validation', () => {
    it('should accept Colors.BLUE syntax', async () => {
      const boardContent = `setGridSizeWithScaling(3)
highlight(0, 0, Colors.BLUE)
token(1, 0, "test", "circle", Colors.RED)
dice("d6", 4, Colors.GREEN)`;
      
      writeFileSync(testFile, boardContent);
      
      const { stdout, stderr } = await execAsync(`node ./toolchain/bin/boardcast-toolchain validate ${testFile}`);
      expect(stdout).toContain('✅ Board file is valid!');
      expect(stderr).toBe('');
    });

    it('should accept direct color constants (BLUE syntax)', async () => {
      const boardContent = `setGridSizeWithScaling(3)
highlight(0, 0, BLUE)
token(1, 0, "test", "circle", RED)
dice("d6", 4, GREEN)
blink(0, 1, PURPLE)
pulse(-1, 0, YELLOW)`;
      
      writeFileSync(testFile, boardContent);
      
      const { stdout, stderr } = await execAsync(`node ./toolchain/bin/boardcast-toolchain validate ${testFile}`);
      expect(stdout).toContain('✅ Board file is valid!');
      expect(stderr).toBe('');
    });

    it('should accept semantic color constants', async () => {
      const boardContent = `setGridSizeWithScaling(4)
highlight(0, 0, ALLY)
highlight(1, 0, ENEMY)  
highlight(0, 1, NEUTRAL)
highlight(-1, 0, HIGHLIGHT)
highlight(0, -1, DANGER)
highlight(2, 0, DIFFICULT)
pulse(1, 1, ENGAGEMENT)`;
      
      writeFileSync(testFile, boardContent);
      
      const { stdout, stderr } = await execAsync(`node ./toolchain/bin/boardcast-toolchain validate ${testFile}`);
      expect(stdout).toContain('✅ Board file is valid!');
      expect(stderr).toBe('');
    });

    it('should accept all palette colors', async () => {
      const paletteColors = [
        'BLUE', 'RED', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE', 'CYAN', 'PINK',
        'DARK_BLUE', 'DARK_RED', 'DARK_GREEN', 'DARK_YELLOW', 
        'DARK_PURPLE', 'DARK_ORANGE', 'DARK_CYAN', 'DARK_PINK',
        'WHITE', 'LIGHT_GRAY', 'GRAY', 'DARK_GRAY', 'BLACK',
        'ALLY', 'ENEMY', 'NEUTRAL', 'HIGHLIGHT', 'DANGER', 'DIFFICULT', 'ENGAGEMENT'
      ];
      
      const boardContent = `setGridSizeWithScaling(6)
${paletteColors.map((color, i) => {
        const q = (i % 5) - 2;
        const r = Math.floor(i / 5) - 2;
        return `highlight(${q}, ${r}, ${color})`;
      }).join('\n')}`;
      
      writeFileSync(testFile, boardContent);
      
      const { stdout, stderr } = await execAsync(`node ./toolchain/bin/boardcast-toolchain validate ${testFile}`);
      expect(stdout).toContain('✅ Board file is valid!');
      expect(stderr).toBe('');
    });

    it('should reject invalid color constants', async () => {
      const boardContent = `setGridSizeWithScaling(3)
highlight(0, 0, INVALID_COLOR)`;
      
      writeFileSync(testFile, boardContent);
      
      try {
        await execAsync(`node ./toolchain/bin/boardcast-toolchain validate ${testFile}`);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        const output = (error.stdout || '') + (error.stderr || '');
        expect(output).toContain('Color must be a valid hex color');
        expect(output).toContain('INVALID_COLOR');
      }
    });

    it('should still accept hex colors', async () => {
      const boardContent = `setGridSizeWithScaling(3)
highlight(0, 0, "#FF0000")
token(1, 0, "test", "circle", "#00FF00")
dice("d20", 15, "#0000FF")`;
      
      writeFileSync(testFile, boardContent);
      
      const { stdout, stderr } = await execAsync(`node ./toolchain/bin/boardcast-toolchain validate ${testFile}`);
      expect(stdout).toContain('✅ Board file is valid!');
      expect(stderr).toBe('');
    });
  });

  describe('DSL Compilation', () => {
    it('should compile color constants to strings', async () => {
      const boardContent = `setGridSizeWithScaling(3)
highlight(0, 0, BLUE)
token(1, 0, "hero", "circle", ALLY)
dice("d6", 4, GREEN)`;
      
      writeFileSync(testFile, boardContent);
      
      await execAsync(`node ./toolchain/bin/boardcast-toolchain compile ${testFile}`);
      
      const jsContent = readFileSync(jsFile, 'utf8');
      expect(jsContent).toContain('board.highlight(0, 0, "BLUE")');
      expect(jsContent).toContain('board.token(1, 0, "hero", "circle", "ALLY")');
      expect(jsContent).toContain('board.dice("d6", 4, "GREEN")');
    });

    it('should compile Colors.BLUE syntax to color name', async () => {
      const boardContent = `setGridSizeWithScaling(3)
highlight(0, 0, Colors.BLUE)
token(1, 0, "hero", "circle", Colors.ALLY)`;
      
      writeFileSync(testFile, boardContent);
      
      await execAsync(`node ./toolchain/bin/boardcast-toolchain compile ${testFile}`);
      
      const jsContent = readFileSync(jsFile, 'utf8');
      expect(jsContent).toContain('board.highlight(0, 0, "BLUE")');
      expect(jsContent).toContain('board.token(1, 0, "hero", "circle", "ALLY")');
    });

    it('should preserve hex colors as-is', async () => {
      const boardContent = `setGridSizeWithScaling(3)
highlight(0, 0, "#FF0000")
token(1, 0, "hero", "circle", "#00FF00")`;
      
      writeFileSync(testFile, boardContent);
      
      await execAsync(`node ./toolchain/bin/boardcast-toolchain compile ${testFile}`);
      
      const jsContent = readFileSync(jsFile, 'utf8');
      expect(jsContent).toContain('board.highlight(0, 0, "#FF0000")');
      expect(jsContent).toContain('board.token(1, 0, "hero", "circle", "#00FF00")');
    });
  });

  describe('Build Integration', () => {
    it('should build successfully with color constants', async () => {
      const boardContent = `setGridSizeWithScaling(4)
# Demonstrate all color features
highlight(0, 0, HIGHLIGHT)
highlight(1, 0, ALLY)
highlight(-1, 0, ENEMY)
highlight(0, 1, NEUTRAL)
token(0, -1, "player", "circle", BLUE)
token(1, -1, "ally", "rect", GREEN)
token(-1, -1, "enemy", "triangle", RED)
dice("d20", 18, CYAN)
dice("d6", 4, YELLOW)
caption("Color palette demo!", 2000)`;
      
      writeFileSync(testFile, boardContent);
      
      const { stdout, stderr } = await execAsync(`node ./toolchain/bin/boardcast-toolchain build ${testFile}`);
      expect(stdout).toContain('✅ Board file is valid!');
      expect(stdout).toContain('✅ Compilation successful');
      expect(stderr).toBe('');
      
      // Verify the generated JavaScript file exists and contains expected content
      expect(existsSync(jsFile)).toBe(true);
      
      const jsContent = readFileSync(jsFile, 'utf8');
      expect(jsContent).toContain('export const config');
      expect(jsContent).toContain('export async function runTutorial');
      expect(jsContent).toContain('board.highlight(0, 0, "HIGHLIGHT")');
      expect(jsContent).toContain('board.token(0, -1, "player", "circle", "BLUE")');
      expect(jsContent).toContain('board.dice("d20", 18, "CYAN")');
    });
  });
});