import api from './api'

export const authService = {
  async login(credentials) {
    const response = await api.post('/Auth/login', credentials)
    return response.data
  },

  async register(userData) {
    const response = await api.post('/Auth/register', userData)
    return response.data
  },

  async refreshToken(tokens) {
    const response = await api.post('/Auth/refresh-token', tokens)
    return response.data
  },

  async getProfile() {
    const response = await api.get('/Auth/profile')
    return response.data
  },

  async changePassword(data) {
    const response = await api.post('/Auth/change-password', data)
    return response.data
  }
}
