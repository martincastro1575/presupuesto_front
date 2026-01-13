import api from './api'

export const gastosService = {
  async getAll(params = {}) {
    const response = await api.get('/Gastos', { params })
    // Estructura: { success, data: { items: [...] } }
    const data = response.data
    if (Array.isArray(data)) return data
    if (data?.data?.items) return data.data.items
    if (data?.items) return data.items
    if (data?.data && Array.isArray(data.data)) return data.data
    return []
  },

  async getById(id) {
    const response = await api.get(`/Gastos/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/Gastos', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/Gastos/${id}`, data)
    return response.data
  },

  async delete(id) {
    await api.delete(`/Gastos/${id}`)
  },

  async getByPeriod(year, month) {
    const response = await api.get(`/Gastos/periodo/${year}/${month}`)
    return response.data
  }
}
