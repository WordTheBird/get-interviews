const express = require('express');
const db = require('../db/database');
const router = express.Router();

// =============== JOBS ===============

// GET all jobs (with their responsibilities)
router.get('/', (req, res) => {
    try {
        const jobs = db.prepare('SELECT * FROM jobs ORDER BY start_date DESC').all();
        jobs.forEach(j => {
            j.responsibilities = db
                .prepare('SELECT * FROM job_responsibilities WHERE job_id = ? ORDER BY sort_order, id')
                .all(j.id);
        });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single job
router.get('/:id', (req, res) => {
    try {
        const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });
        job.responsibilities = db
            .prepare('SELECT * FROM job_responsibilities WHERE job_id = ? ORDER BY sort_order, id')
            .all(job.id);
        res.json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create a job
router.post('/', (req, res) => {
    try {
        const { title, company, location, start_date, end_date, is_current, responsibilities } = req.body;

        if (!title || !company) {
            return res.status(400).json({ error: 'Title and company are required.' });
        }

        // Use a transaction so partial failures don't leave orphaned data
        const insertJob = db.prepare(`
      INSERT INTO jobs (title, company, location, start_date, end_date, is_current)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        const insertResp = db.prepare(`
      INSERT INTO job_responsibilities (job_id, detail, sort_order) VALUES (?, ?, ?)
    `);

        const transaction = db.transaction(() => {
            const result = insertJob.run(
                title, company, location || null,
                start_date || null, end_date || null,
                is_current ? 1 : 0
            );
            const jobId = result.lastInsertRowid;
            if (Array.isArray(responsibilities)) {
                responsibilities.forEach((detail, idx) => {
                    if (detail && detail.trim()) {
                        insertResp.run(jobId, detail.trim(), idx);
                    }
                });
            }
            return jobId;
        });

        const newId = transaction();
        res.status(201).json({ id: newId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update a job (replaces all responsibilities)
router.put('/:id', (req, res) => {
    try {
        const { title, company, location, start_date, end_date, is_current, responsibilities } = req.body;
        const jobId = req.params.id;

        const updateJob = db.prepare(`
      UPDATE jobs SET title=?, company=?, location=?, start_date=?, end_date=?, is_current=?
      WHERE id=?
    `);
        const deleteResps = db.prepare('DELETE FROM job_responsibilities WHERE job_id = ?');
        const insertResp = db.prepare(`
      INSERT INTO job_responsibilities (job_id, detail, sort_order) VALUES (?, ?, ?)
    `);

        const transaction = db.transaction(() => {
            updateJob.run(title, company, location || null, start_date || null, end_date || null, is_current ? 1 : 0, jobId);
            deleteResps.run(jobId);
            if (Array.isArray(responsibilities)) {
                responsibilities.forEach((detail, idx) => {
                    if (detail && detail.trim()) {
                        insertResp.run(jobId, detail.trim(), idx);
                    }
                });
            }
        });

        transaction();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE
router.delete('/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM jobs WHERE id = ?').run(req.params.id);
        // Responsibilities cascade delete via FK constraint
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;