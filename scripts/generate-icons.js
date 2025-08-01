import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = join(__dirname, '../src/assets/logo2.png');
const outputDir = join(__dirname, '../public/icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
    try {
        console.log('Generating PWA icons...');
        
        for (const size of sizes) {
            const outputFile = join(outputDir, `icon-${size}x${size}.png`);
            
            // Calculate padding (10% of the size)
            const padding = Math.floor(size * 0.1);
            const imageSize = size - (padding * 2);
            
            await sharp(inputFile)
                .resize(imageSize, imageSize, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                })
                .extend({
                    top: padding,
                    bottom: padding,
                    left: padding,
                    right: padding,
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                })
                .png()
                .toFile(outputFile);
            
            console.log(`Generated ${size}x${size} icon`);
        }
        
        console.log('All icons generated successfully!');
    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

generateIcons(); 