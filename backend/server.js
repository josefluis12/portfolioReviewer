const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const { Anthropic } = require('@anthropic-ai/sdk');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config({ path: './.env' });

const app = express();
const upload = multer({ dest: 'uploads/' });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors());
app.use(express.json());

console.log("Anthropic API Key:", process.env.ANTHROPIC_API_KEY);  // Debugging line

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log("Uploaded file details:", req.file);

        const filePath = req.file.path;
        let extractedText = '';

        if (req.file.mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            extractedText = data.text;
        } else if (req.file.mimetype.startsWith('image/')) {
            const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
            extractedText = text;
        } else {
            return res.status(400).json({ error: 'Unsupported file type' });
        }

        fs.unlinkSync(filePath);

        const response = await anthropic.messages.create({
            model: "claude-3-sonnet-20240229",
            max_tokens: 500,
            messages: [{ role: "user", content: `Please analyze this portfolio image/document and provide/enumerate detailed, industry-ready recommendations and feedback. Consider visual hierarchy, information architecture, storytelling, and design best practices. Format your response by encapsulating each sentence with <p> and </p> tags. Separate different ideas with <br> tags in between. Separate headings with <br>. Add line breaks before bullet points if you are going to use it. Utilize <strong> and <i> to emphasize keywords. No need to introduce your response. \n\n${extractedText}` }]
        });

        console.log("Anthropic Response:", response); // Debugging output

        // ✅ Correct way to extract text from response
        const analysisText = response.content.map(c => c.text).join("\n");

        res.json({ analysis: analysisText });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(5000, () => console.log('Server running on port 5000'));
