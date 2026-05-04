function renderDashboard(container) {
    container.innerHTML = `
    <div class="space-y-6">
      <div>
        <h2 class="text-3xl font-bold text-slate-900">Welcome to Get Interviews 👋</h2>
        <p class="mt-2 text-slate-600">Build resumes tailored to land your next interview.</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button data-route="jobs" class="card text-left hover:shadow-md transition-shadow">
          <div class="text-3xl mb-2" aria-hidden="true">💼</div>
          <h3 class="font-semibold text-lg">Jobs</h3>
          <p class="text-sm text-slate-600 mt-1">Manage your work experience and accomplishments.</p>
        </button>
        
        <button data-route="skills" class="card text-left hover:shadow-md transition-shadow">
          <div class="text-3xl mb-2" aria-hidden="true">🛠️</div>
          <h3 class="font-semibold text-lg">Skills</h3>
          <p class="text-sm text-slate-600 mt-1">Catalog your technical and soft skills.</p>
        </button>
        
        <button data-route="builder" class="card text-left hover:shadow-md transition-shadow">
          <div class="text-3xl mb-2" aria-hidden="true">📄</div>
          <h3 class="font-semibold text-lg">Build Resume</h3>
          <p class="text-sm text-slate-600 mt-1">Mix and match to create a tailored resume.</p>
        </button>
      </div>
    </div>
  `;

    // Wire up the cards as nav buttons
    container.querySelectorAll('[data-route]').forEach(btn => {
        btn.addEventListener('click', () => navigate(btn.dataset.route));
    });
}