import { test, expect } from '@playwright/test';

test.describe('Lancer Demo Recording', () => {
  test('record lancer movement tutorial', async ({ page, context }) => {
    // This test is specifically for recording video
    await page.goto('/');
    
    // Wait for the board to be fully loaded
    await page.waitForSelector('#chart', { state: 'visible' });
    console.log('✅ Board loaded');

    // Wait a moment for any initial animations
    await page.waitForTimeout(2000);

    console.log('🎮 Starting Lancer Movement tutorial...');
    
    // Verify the tutorial button exists
    await expect(page.locator('#tutorial-lancer-movement')).toBeVisible();
    
    // Click the Lancer Movement tutorial button
    await page.click('#tutorial-lancer-movement');
    
    // Wait for the tutorial to start
    await page.waitForTimeout(1000);
    
    // Verify that the tutorial is running by checking for some expected elements
    // The tutorial should create captions, tokens, and highlights
    await page.waitForTimeout(2000);
    
    // Check that SVG elements are being added (tutorial content)
    const svgElements = await page.locator('#chart *').count();
    expect(svgElements).toBeGreaterThan(0);
    
    // Wait for the tutorial to complete (Lancer tutorial takes about 20-30 seconds)
    console.log('⏳ Recording tutorial (this takes about 30 seconds)...');
    await page.waitForTimeout(30000);

    console.log('✅ Tutorial recording complete');
    
    // Final verification that the board still has content
    const finalElements = await page.locator('#chart *').count();
    expect(finalElements).toBeGreaterThan(0);
  });
});