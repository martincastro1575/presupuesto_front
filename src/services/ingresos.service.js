import api from './api'

const extractArray = (data) => {
  if (Array.isArray(data)) return data
  if (data?.data?.items) return data.data.items
  if (data?.items) return data.items
  if (data?.data && Array.isArray(data.data)) return data.data
  return []
}

export const ingresosService = {
  async getAll(params = {}) {
    const response = await api.get('/Ingresos', { params })
    return extractArray(response.data)
  },

  async getById(id) {
    const response = await api.get(`/Ingresos/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/Ingresos', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/Ingresos/${id}`, data)
    return response.data
  },

  async delete(id) {
    await api.delete(`/Ingresos/${id}`)
  },

  async getByPeriod(year, month) {
    const response = await api.get(`/Ingresos/periodo/${year}/${month}`)
    return extractArray(response.data)
  }
}
