export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const fetchClient = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Handle unauthorized (optional: emit event or just let caller handle)
        // For now, we rely on the component using this to handle logout or redirect
    }

    return response;
};

export const api = {
    getNotes: () => fetchClient('/notes'),
    createNote: (data: { title: string; content: string; tags?: string[]; isFavorite?: boolean }) =>
        fetchClient('/notes', { method: 'POST', body: JSON.stringify(data) }),
    updateNote: (id: string, data: { title: string; content: string; tags?: string[]; isFavorite?: boolean }) =>
        fetchClient(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteNote: (id: string) => fetchClient(`/notes/${id}`, { method: 'DELETE' }),
    chatWithAI: (message: string, signal?: AbortSignal) => fetchClient('/chat', { method: 'POST', body: JSON.stringify({ message }), signal }),
    getTags: () => fetchClient('/notes/tags'),
    deleteAccount: () => fetchClient('/auth/account', { method: 'DELETE' }),
};
