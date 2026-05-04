async function renderDashboard(container) {
    container.innerHTML = `
    <div class="space-y-8">
      <div>
        <h2 class="text-3xl font-bold">Welcome to Get Interviews</h2>
        <p class="mt-2 text-slate-600 dark:text-slate-400">
          Build resumes tailored to land your next interview. Start by adding your details, then compose a resume in the builder.
        </p>
      </div>

      <section aria-labelledby="overview-heading">
        <h3 id="overview-heading" class="text-lg font-semibold mb-3">Your Library</h3>
        <div id="dash-stats" class="grid grid-cols-2 md:grid-cols-5 gap-3"></div>
      </section>

      <section aria-labelledby="actions-heading">
        <h3 id="actions-heading" class="text-lg font-semibold mb-3">Manage Content</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${dashCard('jobs', 'Jobs', 'Manage your work history and accomplishments.')}
          ${dashCard('skills', 'Skills', 'Catalog your technical and soft skills.')}
          ${dashCard('certs', 'Certifications', 'Track your professional credentials.')}
          ${dashCard('awards', 'Awards', 'Highlight recognition and honors.')}
          ${dashCard('builder', 'Build Resume', 'Compose a tailored resume from your library.', true)}
          ${dashCard('profile', 'Profile', 'Edit your personal info and AI key.')}
        </div>
      </section>
    </div>
  `;

    container.querySelectorAll('[data-route]').forEach(btn => {
        btn.addEventListener('click', () => navigate(btn.dataset.route));
    });

    await loadDashStats();
}

function dashCard(route, title, description, highlighted = false) {
    return `
    <button data-route="${route}" class="card text-left hover:shadow-md transition-shadow ${highlighted ? 'ring-2 ring-brand-500' : ''}">
      <h4 class="font-semibold text-lg">${title}</h4>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">${description}</p>
      <span class="inline-block mt-3 text-sm text-brand-600 dark:text-brand-400">Open →</span>
    </button>
  `;
}

async function loadDashStats() {
    const wrap = document.getElementById('dash-stats');
    try {
        const [jobs, skills, certs, awards, resumes] = await Promise.all([
            API.get('/jobs'),
            API.get('/skills'),
            API.get('/certifications'),
            API.get('/awards'),
            API.get('/resumes'),
        ]);

        wrap.innerHTML = [
            statTile('Jobs', jobs.length),
            statTile('Skills', skills.length),
            statTile('Certifications', certs.length),
            statTile('Awards', awards.length),
            statTile('Resumes', resumes.length),
        ].join('');
    } catch (err) {
        wrap.innerHTML = `<p class="text-red-600 col-span-full">Could not load stats: ${escapeHtml(err.message)}</p>`;
    }
}

function statTile(label, count) {
    return `
    <div class="card text-center py-4">
      <div class="text-3xl font-bold text-brand-600 dark:text-brand-400">${count}</div>
      <div class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mt-1">${label}</div>
    </div>
  `;
}