import api from './api'

// Helper para extraer array de la respuesta
const extractArray = (data) => {
  if (Array.isArray(data)) return data
  if (data?.items) return data.items
  if (data?.data) return data.data
  return []
}

// Enum para tipos de categoria
export const TipoCategoria = {
  Gasto: 1,
  Ingreso: 2,
  Ambos: 3
}

export const categoriasService = {
  async getAll(tipo = null) {
    const params = tipo ? { tipo } : {}
    const response = await api.get('/Categorias', { params })
    return extractArray(response.data)
  },

  async getForGastos() {
    return this.getAll(TipoCategoria.Gasto)
  },

  async getForIngresos() {
    return this.getAll(TipoCategoria.Ingreso)
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
