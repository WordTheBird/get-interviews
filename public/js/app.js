const routes = {
    dashboard: renderDashboard,
    jobs: renderJobs,
    skills: renderSkills,
    certs: renderCerts,
    awards: renderAwards,
    builder: renderBuilder,
    settings: renderSettings,
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
        <p class="text-slate-600">🚧 Coming soon: <strong>${routeName}</strong></p>
      </div>
    `;
    }
}

document.querySelectorAll('[data-route]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
});

document.getElementById('credits-btn').addEventListener('click', () => {
    document.getElementById('credits-modal').showModal();
});
document.getElementById('close-credits').addEventListener('click', () => {
    document.getElementById('credits-modal').close();
});

navigate('dashboard');