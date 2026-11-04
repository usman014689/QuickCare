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
  getDonor: (token, id) => request(`/api/donors/${id}`, { token }),
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

  getMyRequests: (token) => request('/api/requests/me', { token }),
  createRequest: (token, payload) =>
    request('/api/requests', { method: 'POST', token, body: payload }),
  patchRequest: (token, id, payload) =>
    request(`/api/requests/${id}`, { method: 'PATCH', token, body: payload }),

  matchDonors: (token, { bloodGroup, city } = {}) => {
    const params = new URLSearchParams()
    if (bloodGroup) params.set('bloodGroup', bloodGroup)
    if (city) params.set('city', city)
    const query = params.toString()
    return request(`/api/match/donors${query ? `?${query}` : ''}`, { token })
  },
  matchRequests: (token) => request('/api/match/requests', { token }),

  searchGeo: (token, q) =>
    request(`/api/geo/search?q=${encodeURIComponent(q)}`, { token }),

  adminOverview: (token) => request('/api/admin/overview', { token }),
  adminDonors: (token) => request('/api/admin/donors', { token }),
  adminRequests: (token) => request('/api/admin/requests', { token }),
  adminDeactivateDonor: (token, id) =>
    request(`/api/admin/donors/${id}/deactivate`, { method: 'PATCH', token }),
  adminCancelRequest: (token, id) =>
    request(`/api/admin/requests/${id}/cancel`, { method: 'PATCH', token }),
}

export { API_BASE }
