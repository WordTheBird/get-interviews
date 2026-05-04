const express = require('express');
const db = require('../db/database');
const router = express.Router();

// GET all resumes (just list)
router.get('/', (req, res) => {
    try {
        const resumes = db.prepare('SELECT * FROM resumes ORDER BY created_at DESC').all();
        res.json(resumes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single resume with all selected items resolved
router.get('/:id', (req, res) => {
    try {
        const resume = db.prepare('SELECT * FROM resumes WHERE id = ?').get(req.params.id);
        if (!resume) return res.status(404).json({ error: 'Resume not found' });

        const items = db.prepare(`
      SELECT * FROM resume_items WHERE resume_id = ? ORDER BY sort_order, id
    `).all(req.params.id);

        // Group items by type for easy frontend consumption
        resume.selections = {
            jobs: items.filter(i => i.item_type === 'job').map(i => i.item_id),
            responsibilities: items.filter(i => i.item_type === 'responsibility').map(i => i.item_id),
            skills: items.filter(i => i.item_type === 'skill').map(i => i.item_id),
            certifications: items.filter(i => i.item_type === 'cert').map(i => i.item_id),
            awards: items.filter(i => i.item_type === 'award').map(i => i.item_id),
        };

        res.json(resume);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create a new resume with selections
router.post('/', (req, res) => {
    try {
        const { name, target_job, selections } = req.body;
        if (!name) return res.status(400).json({ error: 'Name required' });

        const insertResume = db.prepare(`
      INSERT INTO resumes (name, target_job) VALUES (?, ?)
    `);
        const insertItem = db.prepare(`
      INSERT INTO resume_items (resume_id, item_type, item_id, sort_order)
      VALUES (?, ?, ?, ?)
    `);

        const transaction = db.transaction(() => {
            const result = insertResume.run(name, target_job || null);
            const resumeId = result.lastInsertRowid;
            saveSelections(insertItem, resumeId, selections);
            return resumeId;
        });

        const id = transaction();
        res.status(201).json({ id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update resume (replaces all selections)
router.put('/:id', (req, res) => {
    try {
        const { name, target_job, selections } = req.body;
        const id = req.params.id;

        const updateResume = db.prepare('UPDATE resumes SET name=?, target_job=? WHERE id=?');
        const deleteItems = db.prepare('DELETE FROM resume_items WHERE resume_id = ?');
        const insertItem = db.prepare(`
      INSERT INTO resume_items (resume_id, item_type, item_id, sort_order)
      VALUES (?, ?, ?, ?)
    `);

        const transaction = db.transaction(() => {
            updateResume.run(name, target_job || null, id);
            deleteItems.run(id);
            saveSelections(insertItem, id, selections);
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
        db.prepare('DELETE FROM resumes WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET fully-resolved resume (with all data needed for preview)
router.get('/:id/full', (req, res) => {
    try {
        const resume = db.prepare('SELECT * FROM resumes WHERE id = ?').get(req.params.id);
        if (!resume) return res.status(404).json({ error: 'Resume not found' });

        const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
        const items = db.prepare(`
      SELECT * FROM resume_items WHERE resume_id = ? ORDER BY sort_order, id
    `).all(req.params.id);

        const jobIds = items.filter(i => i.item_type === 'job').map(i => i.item_id);
        const respIds = items.filter(i => i.item_type === 'responsibility').map(i => i.item_id);
        const skillIds = items.filter(i => i.item_type === 'skill').map(i => i.item_id);
        const certIds = items.filter(i => i.item_type === 'cert').map(i => i.item_id);
        const awardIds = items.filter(i => i.item_type === 'award').map(i => i.item_id);

        const placeholders = (arr) => arr.map(() => '?').join(',');

        const jobs = jobIds.length
            ? db.prepare(`SELECT * FROM jobs WHERE id IN (${placeholders(jobIds)}) ORDER BY start_date DESC`).all(...jobIds)
            : [];

        // For each job, only include selected responsibilities
        jobs.forEach(j => {
            j.responsibilities = respIds.length
                ? db.prepare(`
            SELECT * FROM job_responsibilities
            WHERE job_id = ? AND id IN (${placeholders(respIds)})
            ORDER BY sort_order, id
          `).all(j.id, ...respIds)
                : [];
        });

        const skills = skillIds.length
            ? db.prepare(`
          SELECT s.*, c.name AS category_name FROM skills s
          LEFT JOIN skill_categories c ON s.category_id = c.id
          WHERE s.id IN (${placeholders(skillIds)})
          ORDER BY c.name, s.name
        `).all(...skillIds)
            : [];

        const certifications = certIds.length
            ? db.prepare(`SELECT * FROM certifications WHERE id IN (${placeholders(certIds)}) ORDER BY date_earned DESC`).all(...certIds)
            : [];

        const awards = awardIds.length
            ? db.prepare(`SELECT * FROM awards WHERE id IN (${placeholders(awardIds)}) ORDER BY date_received DESC`).all(...awardIds)
            : [];

        res.json({ resume, profile, jobs, skills, certifications, awards });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Helper: persist a selections object as resume_items rows
function saveSelections(insertStmt, resumeId, selections) {
    if (!selections) return;
    const map = [
        ['job', selections.jobs],
        ['responsibility', selections.responsibilities],
        ['skill', selections.skills],
        ['cert', selections.certifications],
        ['award', selections.awards],
    ];
    let order = 0;
    map.forEach(([type, ids]) => {
        if (Array.isArray(ids)) {
            ids.forEach(id => {
                insertStmt.run(resumeId, type, id, order++);
            });
        }
    });
}

module.exports = router;