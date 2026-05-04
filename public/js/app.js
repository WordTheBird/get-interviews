const routes = {
    dashboard: renderDashboard,
    jobs: renderJobs,
    skills: renderSkills,
    certs: renderCerts,
    awards: renderAwards,
    builder: renderBuilder,
    profile: renderProfile,
};

function navigate(routeName) {
    const main = document.getElementById('app');
    main.innerHTML = '';

    document.querySelectorAll('[data-route]').forEach(btn => {
        btn.classList.toggle('nav-btn-active', btn.dataset.route === routeName);
    });

    const view = routes[routeName];
    if (view) {
        view(main);
    } else {
        main.innerHTML = `
      <div class="card text-center">
        <p class="text-slate-600 dark:text-slate-400">Coming soon: <strong>${routeName}</strong></p>
      </div>
    `;
    }
}

document.querySelectorAll('[data-route]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
});

// Theme toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
    const current = window.Theme.current();
    // Cycle: system → dark → light → system
    const next = current === 'system' ? 'dark' : current === 'dark' ? 'light' : 'system';
    window.Theme.set(next);
    showToast(`Theme: ${next}`, 'info', 1500);
});

// Credits modal
document.getElementById('credits-btn').addEventListener('click', () => {
    document.getElementById('credits-modal').showModal();
});
document.getElementById('close-credits').addEventListener('click', () => {
    document.getElementById('credits-modal').close();
});

navigate('dashboard');