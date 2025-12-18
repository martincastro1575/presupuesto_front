import api from './api'

// Helper para extraer data de respuesta envuelta
const extractData = (data) => {
  if (data?.data !== undefined) return data.data
  return data
}

export const reportesService = {
  async getResumenMensual(year, month) {
    const response = await api.get('/Reportes/resumen-mensual', {
      params: { anio: year, mes: month }
    })
    return extractData(response.data)
  },

  async getEvolucionMensual(meses = 6) {
    const response = await api.get('/Reportes/evolucion', {
      params: { meses }
    })
    return extractData(response.data)
  },

  async getGastosPorCategoria(year, month) {
    const response = await api.get('/Reportes/por-categoria', {
      params: { anio: year, mes: month }
    })
    return extractData(response.data)
  },

  async getComparativoPresupuesto(year, month) {
    const response = await api.get('/Reportes/comparativo')
    return extractData(response.data)
  }
}
