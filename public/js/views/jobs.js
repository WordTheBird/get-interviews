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

    try {
        const jobs = await API.get('/jobs');
        const list = document.getElementById('job-list');

        if (jobs.length === 0) {
            list.innerHTML = `
        <li class="card text-center text-slate-500">
          No jobs yet. Click "Add Job" to start building your experience.
        </li>
      `;
        } else {
            list.innerHTML = jobs.map(j => `
        <li class="card">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-semibold text-lg">${escapeHtml(j.title)}</h3>
              <p class="text-slate-600">${escapeHtml(j.company)} ${j.location ? '• ' + escapeHtml(j.location) : ''}</p>
              <p class="text-sm text-slate-500 mt-1">
                ${j.start_date || ''} – ${j.is_current ? 'Present' : (j.end_date || '')}
              </p>
            </div>
            <div class="flex gap-2">
              <button class="btn-secondary text-sm" data-edit="${j.id}">Edit</button>
              <button class="btn-danger text-sm" data-delete="${j.id}">Delete</button>
            </div>
          </div>
        </li>
      `).join('');
        }
    } catch (err) {
        container.innerHTML += `<p class="text-red-600">Error loading jobs: ${err.message}</p>`;
    }

    document.getElementById('add-job-btn').addEventListener('click', () => {
        alert('Job form coming next!');
    });
}

// Helper: prevent XSS by escaping user-supplied content
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}