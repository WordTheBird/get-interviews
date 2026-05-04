// Escape HTML to prevent XSS
function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

// Format a YYYY-MM date as "Jun 2024"
function formatMonth(value) {
    if (!value) return '';
    const [y, m] = value.split('-');
    if (!y || !m) return value;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m,10)-1] || ''} ${y}`;
}

// Format YYYY-MM-DD as "Jun 15, 2024"
function formatDate(value) {
    if (!value) return '';
    try {
        const d = new Date(value);
        if (isNaN(d)) return value;
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return value; }
}

// Generic confirm-and-delete
async function confirmDelete(endpoint, message = 'Delete this item?') {
    if (!confirm(message)) return false;
    try {
        await API.del(endpoint);
        return true;
    } catch (err) {
        alert('Failed to delete: ' + err.message);
        return false;
    }
}