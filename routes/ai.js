const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const db = require('../db/database');
const router = express.Router();

/**
 * Helper: Get the user's Gemini API key from DB,
 * falling back to .env for development.
 */
function getApiKey() {
    const profile = db.prepare('SELECT gemini_api_key FROM profile WHERE id = 1').get();
    return (profile && profile.gemini_api_key) || process.env.GEMINI_API_KEY;
}

// POST /api/ai/suggest - Review a piece of text and suggest improvements
router.post('/suggest', async (req, res) => {
    try {
        const { text, context } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Text is required.' });
        }

        const apiKey = getApiKey();
        if (!apiKey) {
            return res.status(400).json({
                error: 'No Gemini API key configured. Add one in Settings.'
            });
        }

        // Initialize the new Google GenAI client
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are a professional resume coach helping a student craft compelling resume bullet points.

Context: This is a ${context || 'resume bullet point'}.

Original text:
"${text}"

Please provide:
1. A revised, stronger version using strong action verbs and quantifiable results where possible.
2. 2-3 specific suggestions for improvement.

Respond ONLY with valid JSON in this exact format:
{
  "revised": "the improved version of the text",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}

Do not include markdown code fences or any other text outside the JSON.`;

        // Call the API using the new SDK pattern
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        const responseText = (result.text || '').trim();

        // Strip markdown fences if Gemini adds them anyway
        const cleaned = responseText
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '');

        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        } catch (e) {
            return res.json({
                revised: responseText,
                suggestions: ['(AI returned non-JSON response — shown above)']
            });
        }

        res.json(parsed);
    } catch (err) {
        console.error('AI Error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;