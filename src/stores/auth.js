import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const refreshToken = ref(localStorage.getItem('refreshToken'))
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)

  // Actions
  async function login(credentials) {
    loading.value = true
    error.value = null

    try {
      const response = await authService.login(credentials)
      setAuthData(response)
      router.push({ name: 'dashboard' })
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al iniciar sesión'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(userData) {
    loading.value = true
    error.value = null

    try {
      const response = await authService.register(userData)
      setAuthData(response)
      router.push({ name: 'dashboard' })
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al registrarse'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function refreshTokens() {
    try {
      const response = await authService.refreshToken({
        token: token.value,
        refreshToken: refreshToken.value
      })
      setAuthData(response)
      return response
    } catch (err) {
      logout()
      throw err
    }
  }

  function setAuthData(authResponse) {
    // El interceptor ya extrae el data, authResponse contiene directamente los datos
    token.value = authResponse.token
    refreshToken.value = authResponse.refreshToken
    user.value = {
      id: authResponse.userId,
      email: authResponse.email,
      nombre: authResponse.nombre
    }

    localStorage.setItem('token', authResponse.token)
    localStorage.setItem('refreshToken', authResponse.refreshToken)
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  function logout() {
    token.value = null
    refreshToken.value = null
    user.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')

    router.push({ name: 'login' })
  }

  function initializeAuth() {
    const storedUser = localStorage.getItem('user')
    if (storedUser && token.value) {
      user.value = JSON.parse(storedUser)
    }
  }

  // Initialize on store creation
  initializeAuth()

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    // Actions
    login,
    register,
    refreshTokens,
    logout,
    initializeAuth
  }
})
