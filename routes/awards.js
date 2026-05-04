const express = require('express');
const db = require('../db/database');
const router = express.Router();

router.get('/', (req, res) => {
    try {
        const awards = db.prepare('SELECT * FROM awards ORDER BY date_received DESC').all();
        res.json(awards);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', (req, res) => {
    try {
        const { name, issuer, date_received, description } = req.body;
        if (!name) return res.status(400).json({ error: 'Name required' });
        const result = db.prepare(`
      INSERT INTO awards (name, issuer, date_received, description) VALUES (?, ?, ?, ?)
    `).run(name.trim(), issuer || null, date_received || null, description || null);
        res.status(201).json({ id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', (req, res) => {
    try {
        const { name, issuer, date_received, description } = req.body;
        db.prepare(`
      UPDATE awards SET name=?, issuer=?, date_received=?, description=? WHERE id=?
    `).run(name.trim(), issuer || null, date_received || null, description || null, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM awards WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;