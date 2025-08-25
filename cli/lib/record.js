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
  
  // Get paths - look for boardcast library in node_modules or peer dependency
  const tutorialPath = path.resolve(tutorialFile);
  const cliRoot = path.resolve(__dirname, '..');
  const runtimeDir = path.join(cliRoot, 'runtime');
  
  // Try to find boardcast library
  let boardcastPath;
  const possiblePaths = [
    // Try peer dependency in parent project
    path.resolve(process.cwd(), 'node_modules/boardcast/dist'),
    // Try in CLI package node_modules  
    path.join(cliRoot, 'node_modules/boardcast/dist'),
    // Try relative to working directory
    path.resolve(process.cwd(), 'dist')
  ];
  
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      boardcastPath = testPath;
      break;
    }
  }
  
  if (!boardcastPath) {
    throw new Error('Boardcast library not found. Please install boardcast as a dependency or run "npm run build" in a boardcast project.');
  }
  
  console.log(`📦 Using boardcast library from: ${boardcastPath}`);
  
  // Basic tutorial file validation and config extraction
  let tutorialConfig;
  try {
    const tutorialContent = fs.readFileSync(tutorialPath, 'utf8');
    
    // Basic syntax validation
    if (!tutorialContent.includes('runTutorial')) {
      throw new Error('Tutorial file must export a runTutorial function');
    }
    if (!tutorialContent.includes('config')) {
      throw new Error('Tutorial file must export a config object');
    }
    
    // Extract config using regex
    const configMatch = tutorialContent.match(/export\s+const\s+config\s*=\s*({[^}]*})/);
    if (configMatch) {
      try {
        tutorialConfig = JSON.parse(configMatch[1].replace(/'/g, '"'));
      } catch {
        tutorialConfig = { gridRadius: 8, title: "Tutorial" };
      }
    } else {
      tutorialConfig = { gridRadius: 8, title: "Tutorial" };
    }
    
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

  // Serve runtime files (HTML template) - both at root and /boardcast/ path
  app.use(express.static(runtimeDir));
  app.use('/boardcast', express.static(runtimeDir));
  
  // Serve the built library files - boardcastPath already points to dist/
  app.use('/dist', express.static(boardcastPath));
  app.use('/boardcast/dist/lib', express.static(path.join(boardcastPath, 'lib')));
  
  // Serve boardcast-contrib from the built dist directory
  const contribPath = path.resolve(boardcastPath, '../dist/contrib');
  if (fs.existsSync(contribPath)) {
    app.use('/boardcast-contrib', express.static(contribPath));
    app.use('/boardcast/boardcast-contrib', express.static(contribPath));
    console.log(`📦 Using boardcast-contrib from: ${contribPath}`);
  } else {
    console.log(`⚠️  boardcast-contrib not found at: ${contribPath}`);
  }
  
  // Serve the user's tutorial file
  app.get('/user-tutorial.js', (req, res) => {
    res.sendFile(tutorialPath);
  });
  app.get('/boardcast/user-tutorial.js', (req, res) => {
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
    await page.goto(`http://localhost:${port}/boardcast/tutorial-runner.html`);
    
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