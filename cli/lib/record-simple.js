import { chromium } from 'playwright';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function recordTutorial(tutorialFile) {
  // Validate tutorial file exists
  if (!fs.existsSync(tutorialFile)) {
    throw new Error(`Tutorial file not found: ${tutorialFile}`);
  }
  
  console.log(`🎬 Recording tutorial: ${tutorialFile}`);
  
  const tutorialPath = path.resolve(tutorialFile);
  const cliRoot = path.resolve(__dirname, '..');
  
  // Find the built boardcast library
  const boardcastLibPath = path.resolve(process.cwd(), 'boardcast/dist/lib/index.js');
  const contribPath = path.resolve(process.cwd(), 'boardcast/dist/contrib');
  
  if (!fs.existsSync(boardcastLibPath)) {
    throw new Error(`Boardcast library not found at: ${boardcastLibPath}`);
  }
  
  console.log(`📦 Using boardcast library: ${boardcastLibPath}`);
  console.log(`📦 Using contrib files: ${contribPath}`);

  // Create Express server with simple routing
  const app = express();
  const port = 3002; // Use different port to avoid conflicts

  // Serve the tutorial runner HTML
  app.get('/', (req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boardcast Tutorial</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #0a0a0a;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        #chart {
            background-color: #0a0a0a;
            display: block;
            max-width: 95vw;
            max-height: 95vh;
        }
    </style>
</head>
<body>
    <svg id="chart" width="1800" height="1000"></svg>

    <script type="importmap">
    {
        "imports": {
            "d3": "https://cdn.skypack.dev/d3@7",
            "boardcast": "/boardcast.js",
            "boardcast-contrib/": "/boardcast-contrib/"
        }
    }
    </script>
    
    <script type="module">
        // Import libraries directly from simple paths
        import { BoardcastHexBoard } from '/boardcast.js';
        import { runTutorial, config } from '/tutorial.js';
        
        console.log('Initializing tutorial with config:', config);
        
        // Initialize the board
        const boardConfig = {
            gridRadius: config?.gridRadius || 8,
            hexRadius: calculateHexRadius(config?.gridRadius || 8),
            width: 1800,
            height: 1000
        };
        
        const board = new BoardcastHexBoard('#chart', boardConfig);
        
        function calculateHexRadius(gridRadius) {
            const maxRadius = Math.min(1800, 1000) / (gridRadius * 3);
            return Math.max(20, Math.min(50, maxRadius));
        }
        
        // Start tutorial after page loads
        window.addEventListener('load', async () => {
            console.log('Starting tutorial...');
            
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await runTutorial(board);
                console.log('✅ Tutorial completed successfully');
                window.tutorialComplete = true;
            } catch (error) {
                console.error('❌ Tutorial failed:', error);
                window.tutorialError = error;
            }
        });
    </script>
</body>
</html>`;
    res.send(html);
  });

  // Serve boardcast library at simple path
  app.get('/boardcast.js', (req, res) => {
    res.sendFile(boardcastLibPath);
  });

  // Serve tutorial file at simple path
  app.get('/tutorial.js', (req, res) => {
    res.sendFile(tutorialPath);
  });

  // Serve contrib files
  app.use('/boardcast-contrib', express.static(contribPath));

  const server = app.listen(port, () => {
    console.log(`📡 Server running at http://localhost:${port}`);
  });

  // Create videos directory
  const videosDir = path.join(process.cwd(), 'videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  // Launch browser for recording
  const browser = await chromium.launch({ headless: false });
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
    await page.goto(`http://localhost:${port}`);
    
    await page.waitForSelector('#chart', { state: 'visible' });
    console.log('✅ Tutorial page loaded');

    // Wait for tutorial completion
    await page.waitForFunction(() => window.tutorialComplete || window.tutorialError, { timeout: 60000 });
    
    const error = await page.evaluate(() => window.tutorialError);
    if (error) {
      throw new Error(`Tutorial execution failed: ${error.message}`);
    }

    console.log('🎥 Recording completed successfully');
    
  } catch (error) {
    console.error('❌ Recording failed:', error.message);
  } finally {
    await browser.close();
    server.close();
  }
}

export { recordTutorial };