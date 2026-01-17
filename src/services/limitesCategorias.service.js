import api from './api'

const extractData = (data) => {
  if (data?.data !== undefined) return data.data
  return data
}

export const limitesCategoriasService = {
  async getAll() {
    const response = await api.get('/LimitesCategorias')
    return extractData(response.data)
  },

  async getByPeriodo(anio, mes) {
    const response = await api.get(`/LimitesCategorias/${anio}/${mes}`)
    return extractData(response.data)
  },

  async getById(id) {
    const response = await api.get(`/LimitesCategorias/detalle/${id}`)
    return extractData(response.data)
  },

  async getByCategoriaYPeriodo(categoriaId, anio, mes) {
    const response = await api.get(`/LimitesCategorias/categoria/${categoriaId}/${anio}/${mes}`)
    return extractData(response.data)
  },

  async getHistoricoByCategoria(categoriaId) {
    const response = await api.get(`/LimitesCategorias/historico/${categoriaId}`)
    return extractData(response.data)
  },

  async createOrUpdate(data) {
    const response = await api.post('/LimitesCategorias', data)
    return extractData(response.data)
  },

  async createLote(data) {
    const response = await api.post('/LimitesCategorias/lote', data)
    return extractData(response.data)
  },

  async update(id, data) {
    const response = await api.put(`/LimitesCategorias/${id}`, data)
    return extractData(response.data)
  },

  async delete(id) {
    await api.delete(`/LimitesCategorias/${id}`)
  },

  async copiarPeriodo(anioOrigen, mesOrigen, anioDestino, mesDestino) {
    const response = await api.post(
      `/LimitesCategorias/copiar/${anioOrigen}/${mesOrigen}/a/${anioDestino}/${mesDestino}`
    )
    return extractData(response.data)
  }
}
