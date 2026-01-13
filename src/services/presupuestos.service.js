import api from './api'

// Helper para extraer array de la respuesta
const extractArray = (data) => {
  if (Array.isArray(data)) return data
  if (data?.data?.items) return data.data.items
  if (data?.items) return data.items
  if (data?.data && Array.isArray(data.data)) return data.data
  return []
}

export const presupuestosService = {
  async getAll(params = {}) {
    const response = await api.get('/Presupuestos', { params })
    return extractArray(response.data)
  },

  async getById(id) {
    const response = await api.get(`/Presupuestos/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/Presupuestos', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/Presupuestos/${id}`, data)
    return response.data
  },

  async delete(id) {
    await api.delete(`/Presupuestos/${id}`)
  },

  async getByPeriod(year, month) {
    const response = await api.get(`/Presupuestos/${year}/${month}`)
    return extractArray(response.data)
  }
}
