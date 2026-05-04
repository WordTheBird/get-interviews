let currentResumeId = null;

async function renderBuilder(container) {
    container.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <h2 class="text-3xl font-bold">Build Resume</h2>
        <button id="new-resume-btn" class="btn-primary">+ New Resume</button>
      </div>
      <div id="builder-content"></div>
    </div>
  `;

    await showResumeList();
    document.getElementById('new-resume-btn').addEventListener('click', () => showBuilderForm(null));
}

async function showResumeList() {
    const wrap = document.getElementById('builder-content');
    try {
        const resumes = await API.get('/resumes');
        if (resumes.length === 0) {
            wrap.innerHTML = `
        <div class="card text-center text-slate-500">
          No resumes yet. Click "+ New Resume" to build your first.
        </div>
      `;
            return;
        }
        wrap.innerHTML = `
      <ul class="space-y-3">
        ${resumes.map(r => `
          <li class="card flex justify-between items-start gap-4">
            <div>
              <h3 class="font-semibold text-lg">${escapeHtml(r.name)}</h3>
              ${r.target_job ? `<p class="text-slate-600">Target: ${escapeHtml(r.target_job)}</p>` : ''}
              <p class="text-xs text-slate-500 mt-1">Created ${formatDate(r.created_at)}</p>
            </div>
            <div class="flex gap-2 flex-shrink-0 flex-wrap">
              <button class="btn-secondary text-sm" data-preview="${r.id}">Preview</button>
              <button class="btn-secondary text-sm" data-edit-resume="${r.id}">Edit</button>
              <button class="btn-danger text-sm" data-del-resume="${r.id}">Delete</button>
            </div>
          </li>
        `).join('')}
      </ul>
    `;

        wrap.querySelectorAll('[data-preview]').forEach(b =>
            b.addEventListener('click', () => showResumePreview(parseInt(b.dataset.preview))));
        wrap.querySelectorAll('[data-edit-resume]').forEach(b =>
            b.addEventListener('click', () => showBuilderForm(parseInt(b.dataset.editResume))));
        wrap.querySelectorAll('[data-del-resume]').forEach(b =>
            b.addEventListener('click', async () => {
                if (await confirmDelete(`/resumes/${b.dataset.delResume}`, 'Delete this resume?')) {
                    showResumeList();
                }
            }));
    } catch (err) {
        wrap.innerHTML = `<p class="text-red-600">Error: ${err.message}</p>`;
    }
}

async function showBuilderForm(id) {
    currentResumeId = id;
    const main = document.getElementById('app');

    // Load all available data + existing selections (if editing)
    const [jobs, skills, certs, awards, existing] = await Promise.all([
        API.get('/jobs'),
        API.get('/skills'),
        API.get('/certifications'),
        API.get('/awards'),
        id ? API.get(`/resumes/${id}`) : Promise.resolve(null)
    ]);

    const sel = existing ? existing.selections : { jobs: [], responsibilities: [], skills: [], certifications: [], awards: [] };

    main.innerHTML = `
    <form id="builder-form" class="space-y-6">
      <h2 class="text-3xl font-bold">${id ? 'Edit Resume' : 'New Resume'}</h2>

      <div class="card space-y-4">
        <div>
          <label for="r-name" class="label">Resume Name *</label>
          <input id="r-name" name="name" type="text" required value="${escapeHtml(existing?.name || '')}"
                 placeholder="e.g., Software Engineer Application" class="input">
        </div>
        <div>
          <label for="r-target" class="label">Target Job</label>
          <input id="r-target" name="target_job" type="text" value="${escapeHtml(existing?.target_job || '')}"
                 placeholder="e.g., Frontend Engineer at TechCorp" class="input">
        </div>
      </div>

      <div class="card">
        <h3 class="font-semibold text-lg mb-3">Jobs</h3>
        ${jobs.length === 0 ? '<p class="text-slate-500 text-sm">No jobs added yet. Go to Jobs to add some.</p>' : ''}
        <div class="space-y-3">
          ${jobs.map(j => renderJobChecklist(j, sel)).join('')}
        </div>
      </div>

      <div class="card">
        <h3 class="font-semibold text-lg mb-3">Skills</h3>
        ${skills.length === 0 ? '<p class="text-slate-500 text-sm">No skills added yet.</p>' : ''}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${skills.map(s => `
            <label class="flex items-center gap-2 p-2 hover:bg-slate-50 rounded">
              <input type="checkbox" name="skill" value="${s.id}" ${sel.skills.includes(s.id) ? 'checked' : ''}
                     class="rounded border-slate-300 text-brand-600 focus:ring-brand-500">
              <span class="text-sm">
                ${escapeHtml(s.name)}
                ${s.category_name ? `<span class="text-slate-500 text-xs">(${escapeHtml(s.category_name)})</span>` : ''}
              </span>
            </label>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <h3 class="font-semibold text-lg mb-3">Certifications</h3>
        ${certs.length === 0 ? '<p class="text-slate-500 text-sm">None added yet.</p>' : ''}
        <div class="space-y-2">
          ${certs.map(c => `
            <label class="flex items-center gap-2 p-2 hover:bg-slate-50 rounded">
              <input type="checkbox" name="cert" value="${c.id}" ${sel.certifications.includes(c.id) ? 'checked' : ''}
                     class="rounded border-slate-300 text-brand-600 focus:ring-brand-500">
              <span class="text-sm">
                <strong>${escapeHtml(c.name)}</strong>
                ${c.issuer ? ` — ${escapeHtml(c.issuer)}` : ''}
              </span>
            </label>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <h3 class="font-semibold text-lg mb-3">Awards</h3>
        ${awards.length === 0 ? '<p class="text-slate-500 text-sm">None added yet.</p>' : ''}
        <div class="space-y-2">
          ${awards.map(a => `
            <label class="flex items-center gap-2 p-2 hover:bg-slate-50 rounded">
              <input type="checkbox" name="award" value="${a.id}" ${sel.awards.includes(a.id) ? 'checked' : ''}
                     class="rounded border-slate-300 text-brand-600 focus:ring-brand-500">
              <span class="text-sm">
                <strong>${escapeHtml(a.name)}</strong>
                ${a.issuer ? ` — ${escapeHtml(a.issuer)}` : ''}
              </span>
            </label>
          `).join('')}
        </div>
      </div>

      <div class="flex gap-3 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border border-slate-200">
        <button type="submit" class="btn-primary">${id ? 'Save Changes' : 'Save & Preview'}</button>
        <button type="button" id="cancel-builder" class="btn-secondary">Cancel</button>
      </div>
    </form>
  `;

    document.getElementById('cancel-builder').addEventListener('click', () => navigate('builder'));
    document.getElementById('builder-form').addEventListener('submit', handleBuilderSubmit);

    // Auto-toggle responsibilities when job is checked/unchecked
    main.querySelectorAll('input[name="job"]').forEach(cb => {
        cb.addEventListener('change', () => {
            const jobBlock = cb.closest('[data-job-block]');
            const respBoxes = jobBlock.querySelectorAll('input[name="resp"]');
            respBoxes.forEach(rb => { rb.checked = cb.checked; });
        });
    });
}

function renderJobChecklist(job, sel) {
    const jobChecked = sel.jobs.includes(job.id);
    return `
    <div class="border border-slate-200 rounded-md p-3" data-job-block>
      <label class="flex items-start gap-2 font-medium">
        <input type="checkbox" name="job" value="${job.id}" ${jobChecked ? 'checked' : ''}
               class="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500">
        <span>
          ${escapeHtml(job.title)} <span class="text-slate-600 font-normal">@ ${escapeHtml(job.company)}</span>
        </span>
      </label>
      ${job.responsibilities && job.responsibilities.length > 0 ? `
        <ul class="ml-6 mt-2 space-y-1">
          ${job.responsibilities.map(r => `
            <li>
              <label class="flex items-start gap-2 text-sm">
                <input type="checkbox" name="resp" value="${r.id}" ${sel.responsibilities.includes(r.id) ? 'checked' : ''}
                       class="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500">
                <span>${escapeHtml(r.detail)}</span>
              </label>
            </li>
          `).join('')}
        </ul>
      ` : '<p class="ml-6 mt-1 text-xs text-slate-500">No responsibilities saved for this job.</p>'}
    </div>
  `;
}

async function handleBuilderSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const getCheckedValues = (name) =>
        Array.from(form.querySelectorAll(`input[name="${name}"]:checked`))
            .map(cb => parseInt(cb.value));

    const data = {
        name: form.name.value.trim(),
        target_job: form.target_job.value.trim(),
        selections: {
            jobs: getCheckedValues('job'),
            responsibilities: getCheckedValues('resp'),
            skills: getCheckedValues('skill'),
            certifications: getCheckedValues('cert'),
            awards: getCheckedValues('award'),
        }
    };

    try {
        let id;
        if (currentResumeId) {
            await API.put(`/resumes/${currentResumeId}`, data);
            id = currentResumeId;
        } else {
            const result = await API.post('/resumes', data);
            id = result.id;
        }
        showResumePreview(id);
    } catch (err) {
        showToast('Failed to save: ' + err.message, 'error');
    }
}

// Load resume and hand it off to renderResumePreview() in preview.js
async function showResumePreview(id) {
    const main = document.getElementById('app');
    main.innerHTML = '<p>Loading preview...</p>';
    try {
        const data = await API.get(`/resumes/${id}/full`);
        renderResumePreview(main, data, id);
    } catch (err) {
        main.innerHTML = `<p class="text-red-600 dark:text-red-400">Error loading preview: ${escapeHtml(err.message)}</p>`;
    }
}