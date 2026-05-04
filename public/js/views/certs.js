let editingCertId = null;

async function renderCerts(container) {
    container.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-bold">Certifications</h2>
        <button id="add-cert-btn" class="btn-primary">+ Add Certification</button>
      </div>
      <ul id="cert-list" class="space-y-3"></ul>
    </div>
  `;
    await loadCerts();
    document.getElementById('add-cert-btn').addEventListener('click', () => showCertForm(null));
}

async function loadCerts() {
    const list = document.getElementById('cert-list');
    try {
        const certs = await API.get('/certifications');
        if (certs.length === 0) {
            list.innerHTML = `<li class="card text-center text-slate-500">No certifications yet.</li>`;
            return;
        }
        list.innerHTML = certs.map(c => `
      <li class="card flex justify-between items-start gap-4">
        <div>
          <h3 class="font-semibold">${escapeHtml(c.name)}</h3>
          ${c.issuer ? `<p class="text-slate-600 text-sm">${escapeHtml(c.issuer)}</p>` : ''}
          <p class="text-sm text-slate-500 mt-1">
            ${c.date_earned ? 'Earned: ' + formatDate(c.date_earned) : ''}
            ${c.expiration_date ? ' • Expires: ' + formatDate(c.expiration_date) : ''}
          </p>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <button class="btn-secondary text-sm" data-edit-cert="${c.id}">Edit</button>
          <button class="btn-danger text-sm" data-del-cert="${c.id}">Delete</button>
        </div>
      </li>
    `).join('');

        list.querySelectorAll('[data-edit-cert]').forEach(b =>
            b.addEventListener('click', () => showCertForm(parseInt(b.dataset.editCert))));
        list.querySelectorAll('[data-del-cert]').forEach(b =>
            b.addEventListener('click', async () => {
                if (await confirmDelete(`/certifications/${b.dataset.delCert}`)) loadCerts();
            }));
    } catch (err) {
        list.innerHTML = `<li class="text-red-600">Error: ${err.message}</li>`;
    }
}

async function showCertForm(id) {
    editingCertId = id;
    let cert = { name: '', issuer: '', date_earned: '', expiration_date: '' };
    if (id) {
        const all = await API.get('/certifications');
        cert = all.find(c => c.id === id) || cert;
    }

    document.getElementById('app').innerHTML = `
    <form id="cert-form" class="space-y-4 max-w-xl">
      <h2 class="text-3xl font-bold">${id ? 'Edit' : 'Add'} Certification</h2>
      <div class="card space-y-4">
        <div>
          <label for="cert-name" class="block text-sm font-medium">Name *</label>
          <input id="cert-name" name="name" type="text" required value="${escapeHtml(cert.name)}"
                 class="mt-1 block w-full rounded-md border-slate-300">
        </div>
        <div>
          <label for="cert-issuer" class="block text-sm font-medium">Issuer</label>
          <input id="cert-issuer" name="issuer" type="text" value="${escapeHtml(cert.issuer || '')}"
                 class="mt-1 block w-full rounded-md border-slate-300">
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="cert-earned" class="block text-sm font-medium">Date Earned</label>
            <input id="cert-earned" name="date_earned" type="date" value="${cert.date_earned || ''}"
                   class="mt-1 block w-full rounded-md border-slate-300">
          </div>
          <div>
            <label for="cert-exp" class="block text-sm font-medium">Expiration</label>
            <input id="cert-exp" name="expiration_date" type="date" value="${cert.expiration_date || ''}"
                   class="mt-1 block w-full rounded-md border-slate-300">
          </div>
        </div>
      </div>
      <div class="flex gap-3">
        <button type="submit" class="btn-primary">Save</button>
        <button type="button" id="cancel-cert" class="btn-secondary">Cancel</button>
      </div>
    </form>
  `;

    document.getElementById('cancel-cert').addEventListener('click', () => navigate('certs'));
    document.getElementById('cert-form').addEventListener('submit', async e => {
        e.preventDefault();
        const f = e.target;
        const data = {
            name: f.name.value,
            issuer: f.issuer.value,
            date_earned: f.date_earned.value,
            expiration_date: f.expiration_date.value
        };
        try {
            if (editingCertId) await API.put(`/certifications/${editingCertId}`, data);
            else await API.post('/certifications', data);
            navigate('certs');
        } catch (err) {
            alert('Failed: ' + err.message);
        }
    });
}