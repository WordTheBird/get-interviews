async function renderProfile(container) {
    container.innerHTML = `
    <div class="space-y-6 max-w-2xl">
      <div>
        <h2 class="text-3xl font-bold">Profile</h2>
        <p class="mt-1 text-slate-600 dark:text-slate-400">
          Your personal info appears at the top of every resume you generate.
        </p>
      </div>

      <form id="profile-form" class="card space-y-4">
        <h3 class="font-semibold text-lg">Personal Information</h3>

        <div>
          <label for="set-name" class="label">Full Name</label>
          <input id="set-name" name="full_name" type="text" autocomplete="name" class="input">
        </div>
        <div>
          <label for="set-email" class="label">Email</label>
          <input id="set-email" name="email" type="email" autocomplete="email" class="input">
        </div>
        <div>
          <label for="set-phone" class="label">Phone</label>
          <input id="set-phone" name="phone" type="tel" autocomplete="tel" class="input">
        </div>
        <div>
          <label for="set-location" class="label">Location</label>
          <input id="set-location" name="location" type="text" placeholder="City, State" class="input">
        </div>
        <div>
          <label for="set-summary" class="label">Professional Summary</label>
          <textarea id="set-summary" name="summary" rows="3" class="input"
                    placeholder="A short paragraph describing your background and goals."></textarea>
        </div>

        <hr class="border-slate-200 dark:border-slate-700">

        <h3 class="font-semibold text-lg">Gemini AI Integration</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400">
          Provide your free Gemini API key to enable AI-powered writing suggestions.
          Get one at <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer"
                       class="text-brand-600 dark:text-brand-400 underline">aistudio.google.com</a>.
          Your key is stored locally and never transmitted anywhere except Google's API.
        </p>
        <div>
          <label for="set-key" class="label">Gemini API Key</label>
          <input id="set-key" name="gemini_api_key" type="password" autocomplete="off" class="input">
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button type="submit" id="save-profile-btn" class="btn-primary">Save Profile</button>
        </div>
      </form>
    </div>
  `;

    try {
        const profile = await API.get('/profile');
        document.getElementById('set-name').value = profile.full_name || '';
        document.getElementById('set-email').value = profile.email || '';
        document.getElementById('set-phone').value = profile.phone || '';
        document.getElementById('set-location').value = profile.location || '';
        document.getElementById('set-summary').value = profile.summary || '';
        document.getElementById('set-key').value = profile.gemini_api_key || '';
    } catch (err) {
        showToast('Failed to load profile: ' + err.message, 'error');
    }

    document.getElementById('profile-form').addEventListener('submit', async e => {
        e.preventDefault();
        const btn = document.getElementById('save-profile-btn');
        setButtonLoading(btn, true);

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
            showToast('Profile saved successfully', 'success');
        } catch (err) {
            showToast('Save failed: ' + err.message, 'error');
        } finally {
            setButtonLoading(btn, false, 'Save Profile');
        }
    });
}