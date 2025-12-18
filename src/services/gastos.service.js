import api from './api'

export const gastosService = {
  async getAll(params = {}) {
    const response = await api.get('/Gastos', { params })
    console.log('Gastos API response:', response.data)
    // Si la respuesta es un objeto con items/data, extraer el array
    const data = response.data
    if (Array.isArray(data)) {
      return data
    }
    if (data?.items) {
      return data.items
    }
    if (data?.data) {
      return data.data
    }
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
