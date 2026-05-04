const API = {
    async get(endpoint) {
        const res = await fetch(`/api${endpoint}`);
        if (!res.ok) throw new Error(`GET ${endpoint} failed: ${res.status}`);
        return res.json();
    },
    async post(endpoint, data) {
        const res = await fetch(`/api${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`POST ${endpoint} failed: ${res.status}`);
        return res.json();
    },
    async put(endpoint, data) {
        const res = await fetch(`/api${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`PUT ${endpoint} failed: ${res.status}`);
        return res.json();
    },
    async del(endpoint) {
        const res = await fetch(`/api${endpoint}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`DELETE ${endpoint} failed: ${res.status}`);
        return res.json();
    }
};