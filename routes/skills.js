const express = require('express');
const db = require('../db/database');
const router = express.Router();

// =============== CATEGORIES ===============

// GET all categories (with their skills)
router.get('/categories', (req, res) => {
    try {
        const cats = db.prepare('SELECT * FROM skill_categories ORDER BY name').all();
        cats.forEach(c => {
            c.skills = db.prepare('SELECT * FROM skills WHERE category_id = ? ORDER BY name').all(c.id);
        });
        res.json(cats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/categories', (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
        const result = db.prepare('INSERT INTO skill_categories (name) VALUES (?)').run(name.trim());
        res.status(201).json({ id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/categories/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM skill_categories WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============== SKILLS ===============

router.get('/', (req, res) => {
    try {
        const skills = db.prepare(`
      SELECT s.*, c.name AS category_name 
      FROM skills s 
      LEFT JOIN skill_categories c ON s.category_id = c.id 
      ORDER BY c.name, s.name
    `).all();
        res.json(skills);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', (req, res) => {
    try {
        const { name, category_id } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
        const result = db.prepare('INSERT INTO skills (name, category_id) VALUES (?, ?)')
            .run(name.trim(), category_id || null);
        res.status(201).json({ id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', (req, res) => {
    try {
        const { name, category_id } = req.body;
        db.prepare('UPDATE skills SET name=?, category_id=? WHERE id=?')
            .run(name.trim(), category_id || null, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM skills WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;