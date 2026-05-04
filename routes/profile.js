const express = require('express');
const db = require('../db/database');
const router = express.Router();

// Ensure a profile row exists (id=1)
db.prepare(`
  INSERT OR IGNORE INTO profile (id, full_name, email) VALUES (1, '', '')
`).run();

// GET profile
router.get('/', (req, res) => {
    const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
    // NEVER expose the API key to the frontend in plaintext for production,
    // but for a local app this is acceptable
    res.json(profile);
});

// PUT update profile
router.put('/', (req, res) => {
    const { full_name, email, phone, location, summary, gemini_api_key } = req.body;
    db.prepare(`
    UPDATE profile SET full_name=?, email=?, phone=?, location=?, summary=?, gemini_api_key=?
    WHERE id=1
  `).run(
        full_name || '', email || '', phone || '',
        location || '', summary || '', gemini_api_key || ''
    );
    res.json({ success: true });
});

module.exports = router;