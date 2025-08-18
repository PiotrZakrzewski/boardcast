import fs from 'fs';
import path from 'path';
import { tutorialTemplate } from './template.js';

async function createTutorial(filename) {
  // Ensure filename ends with .js
  if (!filename.endsWith('.js')) {
    filename += '.js';
  }
  
  // Check if file already exists
  if (fs.existsSync(filename)) {
    console.error(`❌ Error: File ${filename} already exists`);
    process.exit(1);
  }
  
  try {
    // Write the template to the file
    fs.writeFileSync(filename, tutorialTemplate, 'utf8');
    
    console.log(`✅ Created tutorial file: ${filename}`);
    console.log(`
📝 Next steps:
1. Edit ${filename} to customize your tutorial
2. Run: boardcast record ${filename}

💡 Tips:
- Modify the gridRadius in config for different board sizes
- Use the API reference at the bottom of the file
- Test movements and timing by adjusting sleep() values
    `);
    
  } catch (error) {
    console.error(`❌ Error creating file: ${error.message}`);
    process.exit(1);
  }
}

export { createTutorial };