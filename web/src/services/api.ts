import { API_URL } from '../lib/api';

// API client with authentication
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`GET ${endpoint} failed (${res.status})`);
    const data = await res.json();
    return { data };
  },

  post: async (endpoint: string, data?: unknown) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!res.ok) throw new Error(`POST ${endpoint} failed (${res.status})`);
    const responseData = await res.json();
    return { data: responseData };
  },

  patch: async (endpoint: string, data?: unknown) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!res.ok) throw new Error(`PATCH ${endpoint} failed (${res.status})`);
    const responseData = await res.json();
    return { data: responseData };
  },

  delete: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`DELETE ${endpoint} failed (${res.status})`);
    const data = await res.json();
    return { data };
  },
};
