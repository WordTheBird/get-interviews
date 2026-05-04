const routes = {
    dashboard: renderDashboard,
    jobs: renderJobs,
    settings: renderSettings,
    // We'll add skills, certs, awards, builder next
};

function navigate(routeName) {
    const main = document.getElementById('app');
    main.innerHTML = '';

    // Update active state on nav buttons
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

// Wire up nav buttons
document.querySelectorAll('[data-route]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
});

// Credits modal
document.getElementById('credits-btn').addEventListener('click', () => {
    document.getElementById('credits-modal').showModal();
});
document.getElementById('close-credits').addEventListener('click', () => {
    document.getElementById('credits-modal').close();
});

// Default view
navigate('dashboard');