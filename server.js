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

// Initialize DB (just requiring it triggers setup)
require('./db/database');

// Route modules (we'll create these next)
app.use('/api/jobs', require('./routes/jobs'));
// app.use('/api/skills', require('./routes/skills'));
// ... etc.

// Fallback for SPA
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ ResuMate running at http://localhost:${PORT}`);
});