require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize DB
require('./db/database');

// API Routes - must come BEFORE the SPA fallback
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/certifications', require('./routes/certifications'));
app.use('/api/awards', require('./routes/awards'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/resumes', require('./routes/resumes'));
app.use('/api/ai', require('./routes/ai'));

// Safety net: any unknown /api/* should return JSON 404, not HTML
app.use('/api', (req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// SPA fallback — must come LAST
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});

app.listen(PORT, () => {
    console.log(`✅ ResuMate running at http://localhost:${PORT}`);
});