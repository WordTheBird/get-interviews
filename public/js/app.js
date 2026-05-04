const routes = {
    dashboard: renderDashboard,
    jobs: renderJobs,
    // We'll add the rest as we build them
};

function navigate(routeName) {
    const main = document.getElementById('app');
    main.innerHTML = '';

    const view = routes[routeName];
    if (view) {
        view(main);
    } else {
        main.innerHTML = `<p>Coming soon: <strong>${routeName}</strong></p>`;
    }
}

// Wire up nav buttons
document.querySelectorAll('[data-route]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
});

// Default view on load
navigate('dashboard');