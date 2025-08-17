#!/usr/bin/env node

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function recordLancerDemo() {
  console.log('🎬 Starting Lancer demo recording...');
  
  // Ensure videos directory exists
  const videosDir = path.join(__dirname, 'videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: false, // Show browser for debugging
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: videosDir,
      size: { width: 1920, height: 1080 }
    },
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    console.log('📱 Navigating to Boardcast demo...');
    await page.goto('http://localhost:3000');
    
    // Wait for the board to be fully loaded
    await page.waitForSelector('#chart', { state: 'visible' });
    console.log('✅ Board loaded');

    // Wait a moment for any initial animations
    await page.waitForTimeout(2000);

    console.log('🎮 Starting Lancer Movement tutorial...');
    
    // Click the Lancer Movement tutorial button
    await page.click('#tutorial-lancer-movement');
    
    // Wait for the tutorial to complete
    // The Lancer tutorial takes about 20-30 seconds to complete
    console.log('⏳ Recording tutorial (this takes about 30 seconds)...');
    await page.waitForTimeout(35000);

    console.log('✅ Tutorial recording complete');

  } catch (error) {
    console.error('❌ Error during recording:', error);
  } finally {
    await context.close();
    await browser.close();
    
    // Find the recorded video file
    const videoFiles = fs.readdirSync(videosDir).filter(file => file.endsWith('.webm'));
    if (videoFiles.length > 0) {
      const videoPath = path.join(videosDir, videoFiles[0]);
      const finalPath = path.join(videosDir, 'lancer-demo.webm');
      
      // Rename to a friendly name
      fs.renameSync(videoPath, finalPath);
      console.log(`🎥 Video saved as: ${finalPath}`);
    } else {
      console.log('❌ No video file found');
    }
  }
}

// Check if dev server is running
async function checkDevServer() {
  try {
    const response = await fetch('http://localhost:3000');
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if dev server is running...');
  
  if (!(await checkDevServer())) {
    console.log('❌ Dev server not running at http://localhost:3000');
    console.log('💡 Please run "npm run dev" in the main project directory first');
    process.exit(1);
  }
  
  console.log('✅ Dev server is running');
  await recordLancerDemo();
}

if (require.main === module) {
  main().catch(console.error);
}