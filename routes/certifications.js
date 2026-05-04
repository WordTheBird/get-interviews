const express = require('express');
const db = require('../db/database');
const router = express.Router();

router.get('/', (req, res) => {
    try {
        const certs = db.prepare('SELECT * FROM certifications ORDER BY date_earned DESC').all();
        res.json(certs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', (req, res) => {
    try {
        const { name, issuer, date_earned, expiration_date } = req.body;
        if (!name) return res.status(400).json({ error: 'Name required' });
        const result = db.prepare(`
      INSERT INTO certifications (name, issuer, date_earned, expiration_date)
      VALUES (?, ?, ?, ?)
    `).run(name.trim(), issuer || null, date_earned || null, expiration_date || null);
        res.status(201).json({ id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', (req, res) => {
    try {
        const { name, issuer, date_earned, expiration_date } = req.body;
        db.prepare(`
      UPDATE certifications SET name=?, issuer=?, date_earned=?, expiration_date=? WHERE id=?
    `).run(name.trim(), issuer || null, date_earned || null, expiration_date || null, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM certifications WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;