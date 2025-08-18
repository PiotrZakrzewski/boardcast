#!/usr/bin/env node

const { chromium } = require('playwright');
const express = require('express');
const path = require('path');
const fs = require('fs');

async function serveAndRecord() {
  console.log('🎬 Starting Lancer demo server and recording...');
  
  // Ensure videos directory exists
  const videosDir = path.join(__dirname, 'videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  // Create Express server to serve the HTML file and library
  const app = express();
  const port = 3001;

  // Serve static files from the recording directory
  app.use(express.static(__dirname));
  
  // Serve the built library files from parent dist directory
  app.use('/dist', express.static(path.join(__dirname, '../dist')));
  
  // Serve D3.js locally as fallback
  app.get('/d3.min.js', (req, res) => {
    res.redirect('https://d3js.org/d3.v7.min.js');
  });

  const server = app.listen(port, () => {
    console.log(`📡 Demo server running at http://localhost:${port}`);
  });

  // Launch browser for recording
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
    console.log('📱 Navigating to Lancer demo...');
    await page.goto(`http://localhost:${port}/lancer-demo.html`);
    
    // Wait for the page to load
    await page.waitForSelector('#chart', { state: 'visible' });
    console.log('✅ Demo page loaded');

    // Wait for demo to start (the demo auto-starts after page load)
    await page.waitForTimeout(2000);
    console.log('🎮 Demo started automatically...');

    // Wait for demo completion by listening for the custom event
    console.log('⏳ Waiting for demo to complete...');
    
    // Poll for demo completion
    let demoComplete = false;
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes max
    
    while (!demoComplete && attempts < maxAttempts) {
      try {
        demoComplete = await page.evaluate(() => {
          return window.isDemoComplete && window.isDemoComplete();
        });
        
        if (!demoComplete) {
          await page.waitForTimeout(1000);
          attempts++;
          
          // Log progress every 10 seconds
          if (attempts % 10 === 0) {
            console.log(`⏳ Still recording... (${attempts} seconds elapsed)`);
          }
        }
      } catch (error) {
        // Demo might not be ready yet, continue waiting
        await page.waitForTimeout(1000);
        attempts++;
      }
    }

    if (demoComplete) {
      console.log('✅ Demo completed successfully');
      // Give a little extra time for final animations
      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️  Demo did not complete within timeout, stopping recording');
    }

  } catch (error) {
    console.error('❌ Error during recording:', error);
  } finally {
    await context.close();
    await browser.close();
    server.close();
    
    // Find and rename the recorded video file
    const videoFiles = fs.readdirSync(videosDir).filter(file => file.endsWith('.webm'));
    if (videoFiles.length > 0) {
      const videoPath = path.join(videosDir, videoFiles[videoFiles.length - 1]); // Get the latest one
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const finalPath = path.join(videosDir, `lancer-demo-standalone-${timestamp}.webm`);
      
      // Rename to a friendly name with timestamp
      fs.renameSync(videoPath, finalPath);
      console.log(`🎥 Video saved as: ${finalPath}`);
    } else {
      console.log('❌ No video file found');
    }
    
    console.log('🏁 Recording complete!');
  }
}

async function main() {
  // Check if express is available
  try {
    require.resolve('express');
  } catch {
    console.log('❌ Express not found. Installing...');
    const { execSync } = require('child_process');
    execSync('npm install express', { stdio: 'inherit' });
    console.log('✅ Express installed');
  }
  
  await serveAndRecord();
}

if (require.main === module) {
  main().catch(console.error);
}