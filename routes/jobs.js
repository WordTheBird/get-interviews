const express = require('express');
const db = require('../db/database');
const router = express.Router();

// GET all jobs (with their responsibilities)
router.get('/', (req, res) => {
    const jobs = db.prepare('SELECT * FROM jobs ORDER BY start_date DESC').all();
    jobs.forEach(j => {
        j.responsibilities = db
            .prepare('SELECT * FROM job_responsibilities WHERE job_id = ? ORDER BY sort_order')
            .all(j.id);
    });
    res.json(jobs);
});

// POST create a job
router.post('/', (req, res) => {
    const { title, company, location, start_date, end_date, is_current } = req.body;
    const stmt = db.prepare(`
    INSERT INTO jobs (title, company, location, start_date, end_date, is_current)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
    const result = stmt.run(title, company, location, start_date, end_date, is_current ? 1 : 0);
    res.status(201).json({ id: result.lastInsertRowid });
});

// PUT update
router.put('/:id', (req, res) => {
    const { title, company, location, start_date, end_date, is_current } = req.body;
    db.prepare(`
    UPDATE jobs SET title=?, company=?, location=?, start_date=?, end_date=?, is_current=?
    WHERE id=?
  `).run(title, company, location, start_date, end_date, is_current ? 1 : 0, req.params.id);
    res.json({ success: true });
});

// DELETE
router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM jobs WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;