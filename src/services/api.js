import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - agregar token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - extraer data y manejar refresh token
api.interceptors.response.use(
  (response) => {
    // Si la respuesta tiene estructura { success, data, ... }, extraer data
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Si es 401 y no es un retry, intentar refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const token = localStorage.getItem('token')
        const refreshToken = localStorage.getItem('refreshToken')

        if (token && refreshToken) {
          const baseUrl = import.meta.env.VITE_API_URL || '/api'
          const response = await axios.post(`${baseUrl}/Auth/refresh-token`, {
            token,
            refreshToken
          })

          const { token: newToken, refreshToken: newRefreshToken } = response.data

          localStorage.setItem('token', newToken)
          localStorage.setItem('refreshToken', newRefreshToken)

          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Si falla el refresh, limpiar storage y redirigir a login
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
