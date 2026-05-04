function renderResumePreview(container, data, resumeId) {
    const { profile, jobs, skills, certifications, awards, resume } = data;

    // Group skills by category for display
    const skillsByCategory = {};
    skills.forEach(s => {
        const cat = s.category_name || 'Other';
        if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
        skillsByCategory[cat].push(s.name);
    });

    container.innerHTML = `
    <div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 no-print">
        <h2 class="text-2xl font-bold">Preview: ${escapeHtml(resume.name)}</h2>
        <div class="flex gap-2">
          <button id="back-to-builder" class="btn-secondary">← Back</button>
          <button id="edit-resume-btn" class="btn-secondary">Edit Selections</button>
          <button id="print-resume-btn" class="btn-primary">Print / Save as PDF</button>
        </div>
      </div>

      <div id="resume-document" class="resume-doc bg-white shadow-md mx-auto p-10 max-w-[8.5in]">
        <!-- HEADER -->
        <header class="resume-header text-center pb-4 border-b-2 border-slate-800">
          <h1 class="text-3xl font-bold">${escapeHtml(profile.full_name || 'Your Name')}</h1>
          <p class="text-sm text-slate-700 mt-2">
            ${[profile.email, profile.phone, profile.location].filter(Boolean).map(escapeHtml).join(' • ')}
          </p>
        </header>

        ${profile.summary ? `
          <section class="resume-section mt-4">
            <h2 class="resume-section-title">Summary</h2>
            <p class="text-sm">${escapeHtml(profile.summary)}</p>
          </section>
        ` : ''}

        ${jobs.length > 0 ? `
          <section class="resume-section mt-4">
            <h2 class="resume-section-title">Experience</h2>
            ${jobs.map(j => `
              <div class="mb-3">
                <div class="flex justify-between items-baseline">
                  <div>
                    <strong>${escapeHtml(j.title)}</strong>, ${escapeHtml(j.company)}
                    ${j.location ? `<span class="text-slate-600"> — ${escapeHtml(j.location)}</span>` : ''}
                  </div>
                  <span class="text-sm text-slate-600">
                    ${formatMonth(j.start_date)} – ${j.is_current ? 'Present' : formatMonth(j.end_date)}
                  </span>
                </div>
                ${j.responsibilities.length > 0 ? `
                  <ul class="list-disc list-outside ml-5 mt-1 text-sm space-y-1">
                    ${j.responsibilities.map(r => `<li>${escapeHtml(r.detail)}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </section>
        ` : ''}

        ${Object.keys(skillsByCategory).length > 0 ? `
          <section class="resume-section mt-4">
            <h2 class="resume-section-title">Skills</h2>
            <ul class="text-sm space-y-1">
              ${Object.entries(skillsByCategory).map(([cat, items]) => `
                <li><strong>${escapeHtml(cat)}:</strong> ${items.map(escapeHtml).join(', ')}</li>
              `).join('')}
            </ul>
          </section>
        ` : ''}

        ${certifications.length > 0 ? `
          <section class="resume-section mt-4">
            <h2 class="resume-section-title">Certifications</h2>
            <ul class="text-sm space-y-1">
              ${certifications.map(c => `
                <li>
                  <strong>${escapeHtml(c.name)}</strong>${c.issuer ? `, ${escapeHtml(c.issuer)}` : ''}
                  ${c.date_earned ? `<span class="text-slate-600"> — ${formatDate(c.date_earned)}</span>` : ''}
                </li>
              `).join('')}
            </ul>
          </section>
        ` : ''}

        ${awards.length > 0 ? `
          <section class="resume-section mt-4">
            <h2 class="resume-section-title">Awards</h2>
            <ul class="text-sm space-y-1">
              ${awards.map(a => `
                <li>
                  <strong>${escapeHtml(a.name)}</strong>${a.issuer ? `, ${escapeHtml(a.issuer)}` : ''}
                  ${a.date_received ? `<span class="text-slate-600"> — ${formatDate(a.date_received)}</span>` : ''}
                  ${a.description ? `<div class="text-slate-700">${escapeHtml(a.description)}</div>` : ''}
                </li>
              `).join('')}
            </ul>
          </section>
        ` : ''}
      </div>
    </div>
  `;

    document.getElementById('back-to-builder').addEventListener('click', () => navigate('builder'));
    document.getElementById('edit-resume-btn').addEventListener('click', () => showBuilderForm(resumeId));
    document.getElementById('print-resume-btn').addEventListener('click', () => window.print());
}