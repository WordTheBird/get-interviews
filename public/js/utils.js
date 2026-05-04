// ==================== HTML ESCAPE ====================
function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

// ==================== DATE FORMATTERS ====================
function formatMonth(value) {
    if (!value) return '';
    const [y, m] = value.split('-');
    if (!y || !m) return value;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m,10)-1] || ''} ${y}`;
}

function formatDate(value) {
    if (!value) return '';
    try {
        const d = new Date(value);
        if (isNaN(d)) return value;
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return value; }
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'info', duration = 3000) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    toast.textContent = message;
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    document.body.appendChild(toast);

    // Trigger transition
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ==================== CUSTOM CONFIRM DIALOG ====================
function customConfirm(message, { okLabel = 'Confirm', cancelLabel = 'Cancel', danger = false } = {}) {
    return new Promise(resolve => {
        const dialog = document.createElement('dialog');
        dialog.className = 'rounded-lg p-0 max-w-md w-full backdrop:bg-black/50 dark:bg-slate-800';
        dialog.innerHTML = `
      <div class="p-6 space-y-4">
        <p class="text-slate-800 dark:text-slate-100">${escapeHtml(message)}</p>
        <div class="flex justify-end gap-2">
          <button data-cancel class="btn-secondary">${escapeHtml(cancelLabel)}</button>
          <button data-ok class="${danger ? 'btn-danger' : 'btn-primary'}">${escapeHtml(okLabel)}</button>
        </div>
      </div>
    `;
        document.body.appendChild(dialog);
        dialog.showModal();

        const cleanup = (result) => {
            dialog.close();
            dialog.remove();
            resolve(result);
        };

        dialog.querySelector('[data-ok]').addEventListener('click', () => cleanup(true));
        dialog.querySelector('[data-cancel]').addEventListener('click', () => cleanup(false));
        dialog.addEventListener('close', () => cleanup(false));
    });
}

// ==================== DELETE WITH CONFIRMATION ====================
async function confirmDelete(endpoint, message = 'Are you sure you want to delete this?') {
    const confirmed = await customConfirm(message, {
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
        danger: true
    });
    if (!confirmed) return false;
    try {
        await API.del(endpoint);
        showToast('Deleted successfully', 'success');
        return true;
    } catch (err) {
        showToast('Failed to delete: ' + err.message, 'error');
        return false;
    }
}

// ==================== LOADING STATE ====================
function setButtonLoading(btn, isLoading, originalText) {
    if (isLoading) {
        btn.dataset.originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Loading...';
    } else {
        btn.disabled = false;
        btn.textContent = originalText || btn.dataset.originalText || btn.textContent;
    }
}