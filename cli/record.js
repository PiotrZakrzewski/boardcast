import { chromium } from 'playwright';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function recordTutorial(tutorialFile) {
  // Validate tutorial file exists
  if (!fs.existsSync(tutorialFile)) {
    throw new Error(`Tutorial file not found: ${tutorialFile}`);
  }
  
  // Validate it's a JavaScript file
  if (!tutorialFile.endsWith('.js')) {
    throw new Error('Tutorial file must be a .js file');
  }
  
  console.log(`🎬 Recording tutorial: ${tutorialFile}`);
  
  // Get paths
  const projectRoot = path.resolve(__dirname, '..');
  const runtimeDir = path.join(projectRoot, 'runtime');
  const distDir = path.join(projectRoot, 'dist');
  const tutorialPath = path.resolve(tutorialFile);
  
  // Check if dist directory exists (library must be built)
  if (!fs.existsSync(distDir)) {
    throw new Error('Boardcast library not built. Run "npm run build" first.');
  }
  
  // Import tutorial to validate syntax and get config
  let tutorialConfig;
  try {
    // Dynamic import the tutorial file to validate it
    const tutorialModule = require(tutorialPath);
    if (!tutorialModule.runTutorial) {
      throw new Error('Tutorial file must export a runTutorial function');
    }
    if (!tutorialModule.config) {
      throw new Error('Tutorial file must export a config object');
    }
    tutorialConfig = tutorialModule.config;
    console.log(`📋 Tutorial config:`, tutorialConfig);
  } catch (error) {
    throw new Error(`Tutorial file validation failed: ${error.message}`);
  }
  
  // Create videos directory
  const videosDir = path.join(process.cwd(), 'videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  // Create Express server
  const app = express();
  const port = 3001;

  // Serve runtime files (HTML template)
  app.use(express.static(runtimeDir));
  
  // Serve the built library files
  app.use('/dist', express.static(distDir));
  
  // Serve the user's tutorial file
  app.get('/user-tutorial.js', (req, res) => {
    res.sendFile(tutorialPath);
  });

  const server = app.listen(port, () => {
    console.log(`📡 Server running at http://localhost:${port}`);
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
    console.log('📱 Loading tutorial...');
    await page.goto(`http://localhost:${port}/tutorial-runner.html`);
    
    // Wait for the page to load
    await page.waitForSelector('#chart', { state: 'visible' });
    console.log('✅ Tutorial page loaded');

    // Wait for tutorial to start
    await page.waitForTimeout(2000);
    console.log('🎮 Tutorial started...');

    // Wait for tutorial completion or error
    console.log('⏳ Recording in progress...');
    
    let completed = false;
    let attempts = 0;
    const maxAttempts = 300; // 5 minutes max
    
    while (!completed && attempts < maxAttempts) {
      try {
        // Check for completion
        const isComplete = await page.evaluate(() => {
          return window.isTutorialComplete && window.isTutorialComplete();
        });
        
        if (isComplete) {
          // Check if there was an error
          const error = await page.evaluate(() => {
            return window.getTutorialError && window.getTutorialError();
          });
          
          if (error) {
            throw new Error(`Tutorial runtime error: ${error.message || error}`);
          }
          
          completed = true;
          console.log('✅ Tutorial completed successfully');
        } else {
          await page.waitForTimeout(1000);
          attempts++;
          
          // Log progress every 10 seconds
          if (attempts % 10 === 0) {
            console.log(`⏳ Still recording... (${attempts} seconds elapsed)`);
          }
        }
      } catch (error) {
        if (error.message.includes('Tutorial runtime error')) {
          throw error; // Re-throw tutorial errors
        }
        // Other errors might be temporary, continue waiting
        await page.waitForTimeout(1000);
        attempts++;
      }
    }

    if (!completed) {
      throw new Error('Tutorial did not complete within timeout (5 minutes)');
    }
    
    // Give a little extra time for final animations
    await page.waitForTimeout(2000);

  } finally {
    await context.close();
    await browser.close();
    server.close();
    
    // Find and rename the recorded video file
    const videoFiles = fs.readdirSync(videosDir).filter(file => file.endsWith('.webm'));
    if (videoFiles.length > 0) {
      const videoPath = path.join(videosDir, videoFiles[videoFiles.length - 1]);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const baseName = path.basename(tutorialFile, '.js');
      const finalPath = path.join(videosDir, `${baseName}-${timestamp}.webm`);
      
      // Rename to timestamped name
      fs.renameSync(videoPath, finalPath);
      console.log(`🎥 Video saved: ${finalPath}`);
      
    } else {
      throw new Error('No video file was created');
    }
    
    console.log('🏁 Recording complete!');
  }
}

export { recordTutorial };