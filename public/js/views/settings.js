async function renderSettings(container) {
    container.innerHTML = `
    <div class="space-y-6 max-w-2xl">
      <h2 class="text-3xl font-bold">Settings</h2>
      <p class="text-slate-600">Configure your profile and API access.</p>

      <form id="settings-form" class="card space-y-4">
        <h3 class="font-semibold text-lg">Profile Information</h3>
        
        <div>
          <label for="set-name" class="block text-sm font-medium">Full Name</label>
          <input id="set-name" name="full_name" type="text"
                 class="mt-1 block w-full rounded-md border-slate-300">
        </div>
        <div>
          <label for="set-email" class="block text-sm font-medium">Email</label>
          <input id="set-email" name="email" type="email"
                 class="mt-1 block w-full rounded-md border-slate-300">
        </div>
        <div>
          <label for="set-phone" class="block text-sm font-medium">Phone</label>
          <input id="set-phone" name="phone" type="tel"
                 class="mt-1 block w-full rounded-md border-slate-300">
        </div>
        <div>
          <label for="set-location" class="block text-sm font-medium">Location</label>
          <input id="set-location" name="location" type="text"
                 class="mt-1 block w-full rounded-md border-slate-300">
        </div>
        <div>
          <label for="set-summary" class="block text-sm font-medium">Professional Summary</label>
          <textarea id="set-summary" name="summary" rows="3"
                    class="mt-1 block w-full rounded-md border-slate-300"></textarea>
        </div>

        <hr class="my-2">

        <h3 class="font-semibold text-lg">Gemini AI</h3>
        <p class="text-sm text-slate-600">
          Add your free Gemini API key to unlock AI-powered suggestions. 
          Get one at <a href="https://aistudio.google.com" target="_blank" rel="noopener" class="text-brand-600 underline">aistudio.google.com</a>.
        </p>
        <div>
          <label for="set-key" class="block text-sm font-medium">Gemini API Key</label>
          <input id="set-key" name="gemini_api_key" type="password" autocomplete="off"
                 class="mt-1 block w-full rounded-md border-slate-300">
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button type="submit" class="btn-primary">Save Settings</button>
          <span id="save-status" role="status" aria-live="polite" class="text-sm text-green-600"></span>
        </div>
      </form>
    </div>
  `;

    // Load current values
    try {
        const profile = await API.get('/profile');
        document.getElementById('set-name').value = profile.full_name || '';
        document.getElementById('set-email').value = profile.email || '';
        document.getElementById('set-phone').value = profile.phone || '';
        document.getElementById('set-location').value = profile.location || '';
        document.getElementById('set-summary').value = profile.summary || '';
        document.getElementById('set-key').value = profile.gemini_api_key || '';
    } catch (err) {
        console.error('Failed to load profile:', err);
    }

    document.getElementById('settings-form').addEventListener('submit', async e => {
        e.preventDefault();
        const form = e.target;
        const data = {
            full_name: form.full_name.value,
            email: form.email.value,
            phone: form.phone.value,
            location: form.location.value,
            summary: form.summary.value,
            gemini_api_key: form.gemini_api_key.value
        };
        try {
            await API.put('/profile', data);
            const status = document.getElementById('save-status');
            status.textContent = '✓ Saved!';
            setTimeout(() => status.textContent = '', 2000);
        } catch (err) {
            alert('Save failed: ' + err.message);
        }
    });
}