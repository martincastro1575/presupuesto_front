import api from './api'

// Helper para extraer array de la respuesta
const extractArray = (data) => {
  if (Array.isArray(data)) return data
  if (data?.items) return data.items
  if (data?.data) return data.data
  return []
}

export const categoriasService = {
  async getAll() {
    const response = await api.get('/Categorias')
    return extractArray(response.data)
  },

  async getById(id) {
    const response = await api.get(`/Categorias/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/Categorias', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/Categorias/${id}`, data)
    return response.data
  },

  async delete(id) {
    await api.delete(`/Categorias/${id}`)
  }
}
