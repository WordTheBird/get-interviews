let currentEditingJobId = null;

async function renderJobs(container) {
    container.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-bold">Work Experience</h2>
        <button id="add-job-btn" class="btn-primary">+ Add Job</button>
      </div>
      <ul id="job-list" class="space-y-3" aria-live="polite"></ul>
    </div>
  `;

    await loadJobList();

    document.getElementById('add-job-btn').addEventListener('click', () => {
        showJobForm(null);
    });
}

async function loadJobList() {
    const list = document.getElementById('job-list');
    try {
        const jobs = await API.get('/jobs');

        if (jobs.length === 0) {
            list.innerHTML = `
        <li class="card text-center text-slate-500">
          No jobs yet. Click "Add Job" to start building your experience.
        </li>
      `;
            return;
        }

        list.innerHTML = jobs.map(j => `
      <li class="card">
        <div class="flex justify-between items-start gap-4">
          <div class="flex-1">
            <h3 class="font-semibold text-lg">${escapeHtml(j.title)}</h3>
            <p class="text-slate-600">${escapeHtml(j.company)}${j.location ? ' • ' + escapeHtml(j.location) : ''}</p>
            <p class="text-sm text-slate-500 mt-1">
              ${j.start_date || ''} – ${j.is_current ? 'Present' : (j.end_date || '')}
            </p>
            ${j.responsibilities && j.responsibilities.length > 0 ? `
              <ul class="mt-2 list-disc list-inside text-sm text-slate-700 space-y-1">
                ${j.responsibilities.map(r => `<li>${escapeHtml(r.detail)}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <button class="btn-secondary text-sm" data-edit="${j.id}">Edit</button>
            <button class="btn-danger text-sm" data-delete="${j.id}">Delete</button>
          </div>
        </div>
      </li>
    `).join('');

        // Wire up edit and delete buttons
        list.querySelectorAll('[data-edit]').forEach(btn => {
            btn.addEventListener('click', () => showJobForm(parseInt(btn.dataset.edit)));
        });
        list.querySelectorAll('[data-delete]').forEach(btn => {
            btn.addEventListener('click', () => deleteJob(parseInt(btn.dataset.delete)));
        });
    } catch (err) {
        list.innerHTML = `<li class="text-red-600">Error loading jobs: ${err.message}</li>`;
    }
}

async function showJobForm(jobId) {
    currentEditingJobId = jobId;
    const main = document.getElementById('app');

    // If editing, load existing data
    let job = { title: '', company: '', location: '', start_date: '', end_date: '', is_current: 0, responsibilities: [] };
    if (jobId) {
        try {
            job = await API.get(`/jobs/${jobId}`);
        } catch (err) {
            alert('Failed to load job: ' + err.message);
            return;
        }
    }

    main.innerHTML = `
    <form id="job-form" class="space-y-6 max-w-3xl">
      <h2 class="text-3xl font-bold">${jobId ? 'Edit Job' : 'Add Job'}</h2>

      <div class="card space-y-4">
        <div>
          <label for="job-title" class="block text-sm font-medium text-slate-700">Job Title *</label>
          <input id="job-title" name="title" type="text" required value="${escapeHtml(job.title)}"
                 class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500">
        </div>

        <div>
          <label for="job-company" class="block text-sm font-medium text-slate-700">Company *</label>
          <input id="job-company" name="company" type="text" required value="${escapeHtml(job.company)}"
                 class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500">
        </div>

        <div>
          <label for="job-location" class="block text-sm font-medium text-slate-700">Location</label>
          <input id="job-location" name="location" type="text" value="${escapeHtml(job.location || '')}"
                 class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="job-start" class="block text-sm font-medium text-slate-700">Start Date</label>
            <input id="job-start" name="start_date" type="month" value="${job.start_date || ''}"
                   class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500">
          </div>
          <div>
            <label for="job-end" class="block text-sm font-medium text-slate-700">End Date</label>
            <input id="job-end" name="end_date" type="month" value="${job.end_date || ''}"
                   class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500">
          </div>
        </div>

        <label class="flex items-center gap-2">
          <input id="job-current" name="is_current" type="checkbox" ${job.is_current ? 'checked' : ''}
                 class="rounded border-slate-300 text-brand-600 focus:ring-brand-500">
          <span class="text-sm text-slate-700">I currently work here</span>
        </label>
      </div>

      <div class="card space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-lg">Responsibilities & Achievements</h3>
          <button type="button" id="add-resp-btn" class="btn-secondary text-sm">+ Add</button>
        </div>
        <ul id="resp-list" class="space-y-3"></ul>
      </div>

      <div class="flex gap-3">
        <button type="submit" class="btn-primary">Save Job</button>
        <button type="button" id="cancel-btn" class="btn-secondary">Cancel</button>
      </div>
    </form>
  `;

    // Render responsibility inputs
    const respList = document.getElementById('resp-list');
    if (job.responsibilities.length === 0) {
        addResponsibilityInput(respList, '');
    } else {
        job.responsibilities.forEach(r => addResponsibilityInput(respList, r.detail));
    }

    document.getElementById('add-resp-btn').addEventListener('click', () => {
        addResponsibilityInput(respList, '');
    });
    document.getElementById('cancel-btn').addEventListener('click', () => navigate('jobs'));
    document.getElementById('job-form').addEventListener('submit', handleJobSubmit);
}

function addResponsibilityInput(list, value) {
    const li = document.createElement('li');
    li.className = 'border border-slate-200 rounded-md p-3 bg-slate-50 space-y-2';
    li.innerHTML = `
    <textarea rows="2" class="resp-input block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              placeholder="Describe an accomplishment or responsibility...">${escapeHtml(value)}</textarea>
    <div class="flex gap-2 items-center flex-wrap">
      <button type="button" class="ai-suggest-btn btn-secondary text-xs">✨ AI Suggestion</button>
      <button type="button" class="remove-resp-btn btn-danger text-xs">Remove</button>
      <span class="ai-status text-xs text-slate-500" role="status" aria-live="polite"></span>
    </div>
    <div class="ai-suggestion-box hidden bg-brand-50 border border-brand-200 rounded-md p-3 text-sm space-y-2"></div>
  `;
    list.appendChild(li);

    li.querySelector('.remove-resp-btn').addEventListener('click', () => li.remove());
    li.querySelector('.ai-suggest-btn').addEventListener('click', () => requestAISuggestion(li));
}

async function requestAISuggestion(li) {
    const textarea = li.querySelector('.resp-input');
    const status = li.querySelector('.ai-status');
    const box = li.querySelector('.ai-suggestion-box');
    const btn = li.querySelector('.ai-suggest-btn');

    const text = textarea.value.trim();
    if (!text) {
        status.textContent = 'Please enter some text first.';
        return;
    }

    btn.disabled = true;
    status.textContent = 'Thinking...';
    box.classList.add('hidden');

    try {
        const result = await API.post('/ai/suggest', {
            text,
            context: 'job responsibility on a resume'
        });

        box.innerHTML = `
      <div>
        <p class="font-semibold text-brand-800">Suggested Revision:</p>
        <p class="italic text-slate-800 mt-1">"${escapeHtml(result.revised || '')}"</p>
        <button type="button" class="apply-suggestion btn-primary text-xs mt-2">Use This</button>
      </div>
      ${result.suggestions && result.suggestions.length ? `
        <div class="mt-3 pt-3 border-t border-brand-200">
          <p class="font-semibold text-brand-800">Tips:</p>
          <ul class="list-disc list-inside text-slate-700 mt-1">
            ${result.suggestions.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    `;
        box.classList.remove('hidden');
        status.textContent = '';

        box.querySelector('.apply-suggestion')?.addEventListener('click', () => {
            textarea.value = result.revised;
            box.classList.add('hidden');
        });
    } catch (err) {
        status.textContent = 'Error: ' + err.message;
    } finally {
        btn.disabled = false;
    }
}

async function handleJobSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        title: form.title.value.trim(),
        company: form.company.value.trim(),
        location: form.location.value.trim(),
        start_date: form.start_date.value,
        end_date: form.end_date.value,
        is_current: form.is_current.checked,
        responsibilities: Array.from(document.querySelectorAll('.resp-input'))
            .map(t => t.value.trim())
            .filter(v => v.length > 0)
    };

    try {
        if (currentEditingJobId) {
            await API.put(`/jobs/${currentEditingJobId}`, data);
        } else {
            await API.post('/jobs', data);
        }
        navigate('jobs');
    } catch (err) {
        alert('Failed to save: ' + err.message);
    }
}

async function deleteJob(id) {
    if (!confirm('Delete this job? This cannot be undone.')) return;
    try {
        await API.del(`/jobs/${id}`);
        await loadJobList();
    } catch (err) {
        alert('Failed to delete: ' + err.message);
    }
}

// Helper
function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}