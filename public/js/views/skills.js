async function renderSkills(container) {
    container.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <h2 class="text-3xl font-bold">Skills</h2>
        <div class="flex gap-2">
          <button id="add-cat-btn" class="btn-secondary">+ Category</button>
          <button id="add-skill-btn" class="btn-primary">+ Skill</button>
        </div>
      </div>
      <div id="skills-content" class="space-y-4"></div>
    </div>
  `;

    await loadSkills();

    document.getElementById('add-cat-btn').addEventListener('click', addCategory);
    document.getElementById('add-skill-btn').addEventListener('click', () => showSkillForm());
}

async function loadSkills() {
    const wrap = document.getElementById('skills-content');
    try {
        const cats = await API.get('/skills/categories');
        const allSkills = await API.get('/skills');
        const uncategorized = allSkills.filter(s => !s.category_id);

        let html = '';

        if (cats.length === 0 && allSkills.length === 0) {
            html = `
        <div class="card text-center text-slate-500">
          No skills yet. Start by adding a category (e.g., "Languages") and then skills.
        </div>
      `;
        } else {
            cats.forEach(cat => {
                html += renderCategoryCard(cat);
            });
            if (uncategorized.length > 0) {
                html += renderCategoryCard({ id: null, name: 'Uncategorized', skills: uncategorized });
            }
        }

        wrap.innerHTML = html;
        wireSkillButtons();
    } catch (err) {
        wrap.innerHTML = `<p class="text-red-600">Error: ${err.message}</p>`;
    }
}

function renderCategoryCard(cat) {
    return `
    <div class="card">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-lg">${escapeHtml(cat.name)}</h3>
        ${cat.id ? `<button class="btn-danger text-xs" data-del-cat="${cat.id}">Delete Category</button>` : ''}
      </div>
      ${cat.skills.length === 0 ? `
        <p class="text-sm text-slate-500">No skills in this category yet.</p>
      ` : `
        <div class="flex flex-wrap gap-2">
          ${cat.skills.map(s => `
            <span class="inline-flex items-center gap-2 bg-brand-100 text-brand-800 px-3 py-1 rounded-full text-sm">
              ${escapeHtml(s.name)}
              <button class="text-brand-700 hover:text-red-600" data-del-skill="${s.id}" aria-label="Delete ${escapeHtml(s.name)}">×</button>
            </span>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function wireSkillButtons() {
    document.querySelectorAll('[data-del-cat]').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (await confirmDelete(`/skills/categories/${btn.dataset.delCat}`, 'Delete this category? Skills inside will become uncategorized.')) {
                loadSkills();
            }
        });
    });
    document.querySelectorAll('[data-del-skill]').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (await confirmDelete(`/skills/${btn.dataset.delSkill}`, 'Delete this skill?')) {
                loadSkills();
            }
        });
    });
}

async function addCategory() {
    const name = prompt('New category name (e.g., "Languages", "Frameworks"):');
    if (!name || !name.trim()) return;
    try {
        await API.post('/skills/categories', { name: name.trim() });
        loadSkills();
    } catch (err) {
        alert('Failed to add: ' + err.message);
    }
}

async function showSkillForm() {
    const cats = await API.get('/skills/categories');
    const main = document.getElementById('app');

    main.innerHTML = `
    <form id="skill-form" class="space-y-4 max-w-md">
      <h2 class="text-3xl font-bold">Add Skill</h2>
      <div class="card space-y-4">
        <div>
          <label for="skill-name" class="label">Skill Name *</label>
          <input id="skill-name" name="name" type="text" required class="input">
        </div>
        <div>
          <label for="skill-cat" class="label">Category</label>
          <select id="skill-cat" name="category_id" class="input">
            <option value="">— Uncategorized —</option>
            ${cats.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="flex gap-3">
        <button type="submit" class="btn-primary">Save Skill</button>
        <button type="button" id="cancel-skill" class="btn-secondary">Cancel</button>
      </div>
    </form>
  `;

    document.getElementById('cancel-skill').addEventListener('click', () => navigate('skills'));
    document.getElementById('skill-form').addEventListener('submit', async e => {
        e.preventDefault();
        const form = e.target;
        try {
            await API.post('/skills', {
                name: form.name.value,
                category_id: form.category_id.value || null
            });
            navigate('skills');
        } catch (err) {
            alert('Failed: ' + err.message);
        }
    });
}