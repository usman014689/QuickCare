const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const message = data?.message || `Request failed (${response.status})`
    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export const api = {
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/api/auth/me', { token }),

  getMyDonor: (token) => request('/api/donors/me', { token }),
  createDonor: (token, payload) =>
    request('/api/donors', { method: 'POST', token, body: payload }),
  updateDonor: (token, id, payload) =>
    request(`/api/donors/${id}`, { method: 'PUT', token, body: payload }),
  patchDonorAvailability: (token, id, isAvailable) =>
    request(`/api/donors/${id}/availability`, {
      method: 'PATCH',
      token,
      body: { isAvailable },
    }),

  matchRequests: (token) => request('/api/match/requests', { token }),
}

export { API_BASE }
