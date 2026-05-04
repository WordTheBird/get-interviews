let editingAwardId = null;

async function renderAwards(container) {
    container.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-bold">Awards</h2>
        <button id="add-award-btn" class="btn-primary">+ Add Award</button>
      </div>
      <ul id="award-list" class="space-y-3"></ul>
    </div>
  `;
    await loadAwards();
    document.getElementById('add-award-btn').addEventListener('click', () => showAwardForm(null));
}

async function loadAwards() {
    const list = document.getElementById('award-list');
    try {
        const awards = await API.get('/awards');
        if (awards.length === 0) {
            list.innerHTML = `<li class="card text-center text-slate-500">No awards yet.</li>`;
            return;
        }
        list.innerHTML = awards.map(a => `
      <li class="card flex justify-between items-start gap-4">
        <div>
          <h3 class="font-semibold">${escapeHtml(a.name)}</h3>
          ${a.issuer ? `<p class="text-slate-600 text-sm">${escapeHtml(a.issuer)}</p>` : ''}
          ${a.date_received ? `<p class="text-sm text-slate-500">${formatDate(a.date_received)}</p>` : ''}
          ${a.description ? `<p class="text-sm text-slate-700 mt-2">${escapeHtml(a.description)}</p>` : ''}
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <button class="btn-secondary text-sm" data-edit-award="${a.id}">Edit</button>
          <button class="btn-danger text-sm" data-del-award="${a.id}">Delete</button>
        </div>
      </li>
    `).join('');

        list.querySelectorAll('[data-edit-award]').forEach(b =>
            b.addEventListener('click', () => showAwardForm(parseInt(b.dataset.editAward))));
        list.querySelectorAll('[data-del-award]').forEach(b =>
            b.addEventListener('click', async () => {
                if (await confirmDelete(`/awards/${b.dataset.delAward}`)) loadAwards();
            }));
    } catch (err) {
        list.innerHTML = `<li class="text-red-600">Error: ${err.message}</li>`;
    }
}

async function showAwardForm(id) {
    editingAwardId = id;
    let award = { name: '', issuer: '', date_received: '', description: '' };
    if (id) {
        const all = await API.get('/awards');
        award = all.find(a => a.id === id) || award;
    }

    document.getElementById('app').innerHTML = `
    <form id="award-form" class="space-y-4 max-w-xl">
      <h2 class="text-3xl font-bold">${id ? 'Edit' : 'Add'} Award</h2>
      <div class="card space-y-4">
        <div>
          <label for="aw-name" class="block text-sm font-medium">Name *</label>
          <input id="aw-name" name="name" type="text" required value="${escapeHtml(award.name)}"
                 class="mt-1 block w-full rounded-md border-slate-300">
        </div>
        <div>
          <label for="aw-issuer" class="block text-sm font-medium">Issuer / Organization</label>
          <input id="aw-issuer" name="issuer" type="text" value="${escapeHtml(award.issuer || '')}"
                 class="mt-1 block w-full rounded-md border-slate-300">
        </div>
        <div>
          <label for="aw-date" class="block text-sm font-medium">Date Received</label>
          <input id="aw-date" name="date_received" type="date" value="${award.date_received || ''}"
                 class="mt-1 block w-full rounded-md border-slate-300">
        </div>
        <div>
          <label for="aw-desc" class="block text-sm font-medium">Description</label>
          <textarea id="aw-desc" name="description" rows="3"
                    class="mt-1 block w-full rounded-md border-slate-300">${escapeHtml(award.description || '')}</textarea>
          <div class="mt-2 flex gap-2 items-center flex-wrap">
            <button type="button" id="aw-ai-btn" class="btn-secondary text-xs">✨ AI Suggestion</button>
            <span id="aw-ai-status" class="text-xs text-slate-500" role="status" aria-live="polite"></span>
          </div>
          <div id="aw-ai-box" class="hidden mt-2 bg-brand-50 border border-brand-200 rounded-md p-3 text-sm space-y-2"></div>
        </div>
      </div>
      <div class="flex gap-3">
        <button type="submit" class="btn-primary">Save</button>
        <button type="button" id="cancel-award" class="btn-secondary">Cancel</button>
      </div>
    </form>
  `;

    document.getElementById('cancel-award').addEventListener('click', () => navigate('awards'));
    document.getElementById('aw-ai-btn').addEventListener('click', requestAwardAI);
    document.getElementById('award-form').addEventListener('submit', async e => {
        e.preventDefault();
        const f = e.target;
        const data = {
            name: f.name.value,
            issuer: f.issuer.value,
            date_received: f.date_received.value,
            description: f.description.value
        };
        try {
            if (editingAwardId) await API.put(`/awards/${editingAwardId}`, data);
            else await API.post('/awards', data);
            navigate('awards');
        } catch (err) {
            alert('Failed: ' + err.message);
        }
    });
}

async function requestAwardAI() {
    const textarea = document.getElementById('aw-desc');
    const status = document.getElementById('aw-ai-status');
    const box = document.getElementById('aw-ai-box');
    const text = textarea.value.trim();

    if (!text) { status.textContent = 'Please enter a description first.'; return; }

    status.textContent = 'Thinking...';
    box.classList.add('hidden');

    try {
        const result = await API.post('/ai/suggest', {
            text,
            context: 'an award description on a resume'
        });
        box.innerHTML = `
      <div>
        <p class="font-semibold text-brand-800">Suggested Revision:</p>
        <p class="italic text-slate-800 mt-1">"${escapeHtml(result.revised || '')}"</p>
        <button type="button" id="apply-aw-suggest" class="btn-primary text-xs mt-2">Use This</button>
      </div>
      ${result.suggestions ? `
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
        document.getElementById('apply-aw-suggest')?.addEventListener('click', () => {
            textarea.value = result.revised;
            box.classList.add('hidden');
        });
    } catch (err) {
        status.textContent = 'Error: ' + err.message;
    }
}