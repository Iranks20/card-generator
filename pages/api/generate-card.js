import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
import fs from 'fs';

// Register the custom font
// registerFont(path.resolve('./public/Pacifico-Regular.ttf'), { family: 'Pacifico' });

const cardImagePath = path.resolve('./public/card.jpg');
const outputDir = path.resolve('./public/generated_cards');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

export default async function handler(req, res) {
    console.log(`Received ${req.method} request at /api/generate-card`);

    if (req.method === 'POST') {
        const { name } = req.body;
        if (!name) {
            console.error('Name is required');
            return res.status(400).json({ error: 'Name is required' });
        }

        try {
            console.log('Loading card image...');
            const cardImage = await loadImage(cardImagePath);

            console.log('Creating canvas...');
            const canvas = createCanvas(cardImage.width, cardImage.height);
            const ctx = canvas.getContext('2d');

            console.log('Drawing image onto canvas...');
            ctx.drawImage(cardImage, 0, 0);

            ctx.font = 'italic bold 30px Pacifico';
            ctx.fillStyle = '#133378';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            console.log('Sanitizing name and adding text to image...');
            const sanitizedName = name.replace(/&/g, 'and');
            const textX = canvas.width / 1.7;
            const textY = canvas.height / 3;
            ctx.fillText(sanitizedName, textX, textY);

            console.log('Generating image buffer...');
            const buffer = canvas.toBuffer('image/jpeg', { quality: 0.85 });
            const outputFilePath = path.join(outputDir, `${sanitizedName.replace(/ /g, '_')}.jpeg`);

            console.log(`Saving image to ${outputFilePath}...`);
            fs.writeFileSync(outputFilePath, buffer);

            console.log('Sending response with generated image...');
            res.setHeader('Content-Type', 'image/jpeg');
            res.send(buffer);
        } catch (error) {
            console.error('Error generating card:', error);
            res.status(500).json({ error: 'Error generating card' });
        }
    } else if (req.method === 'GET') {
        try {
            console.log('Fetching list of generated cards...');
            const files = fs.readdirSync(outputDir).map(file => `/generated_cards/${file}`);
            res.status(200).json(files);
        } catch (error) {
            console.error('Error fetching generated cards:', error);
            res.status(500).json({ error: 'Error fetching generated cards' });
        }
    } else {
        console.error('Method not allowed');
        res.status(405).json({ error: 'Method not allowed' });
    }
}
