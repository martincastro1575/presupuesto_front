<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { reportesService } from '@/services/reportes.service'
import Card from 'primevue/card'
import Chart from 'primevue/chart'
import ProgressBar from 'primevue/progressbar'
import Skeleton from 'primevue/skeleton'

const currentDate = new Date()
const currentYear = currentDate.getFullYear()
const currentMonth = currentDate.getMonth() + 1

// Query para resumen mensual
const { data: resumen, isLoading: loadingResumen } = useQuery({
  queryKey: ['resumen-mensual', currentYear, currentMonth],
  queryFn: () => reportesService.getResumenMensual(currentYear, currentMonth)
})

// Query para evolución mensual
const { data: evolucion, isLoading: loadingEvolucion } = useQuery({
  queryKey: ['evolucion-mensual'],
  queryFn: () => reportesService.getEvolucionMensual(6)
})

// Query para gastos por categoría
const { data: gastosPorCategoria, isLoading: loadingCategorias } = useQuery({
  queryKey: ['gastos-categoria', currentYear, currentMonth],
  queryFn: () => reportesService.getGastosPorCategoria(currentYear, currentMonth)
})

// Chart data para evolución (gastos e ingresos)
const chartData = computed(() => {
  if (!evolucion.value) return null

  return {
    labels: evolucion.value.map(e => e.mesNombre),
    datasets: [
      {
        label: 'Ingresos',
        data: evolucion.value.map(e => e.totalIngresos),
        fill: false,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        tension: 0.4
      },
      {
        label: 'Gastos',
        data: evolucion.value.map(e => e.totalGastado),
        fill: false,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        tension: 0.4
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => `$${value.toLocaleString()}`
      }
    }
  }
}

// Chart data para categorías (donut)
const donutData = computed(() => {
  if (!gastosPorCategoria.value?.length) return null

  return {
    labels: gastosPorCategoria.value.map(c => c.categoriaNombre),
    datasets: [
      {
        data: gastosPorCategoria.value.map(c => c.totalMonto),
        backgroundColor: gastosPorCategoria.value.map(c => c.categoriaColor)
      }
    ]
  }
})

const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right'
    }
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value || 0)
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

    <!-- Resumen Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card class="shadow-sm">
        <template #content>
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 mr-4">
              <i class="pi pi-arrow-down text-green-600 text-xl"></i>
            </div>
            <div>
              <p class="text-gray-500 text-sm">Ingresos del Mes</p>
              <Skeleton v-if="loadingResumen" width="100px" height="24px" />
              <p v-else class="text-2xl font-bold text-green-600">
                {{ formatCurrency(resumen?.totalIngresos) }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <Card class="shadow-sm">
        <template #content>
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-red-100 mr-4">
              <i class="pi pi-arrow-up text-red-600 text-xl"></i>
            </div>
            <div>
              <p class="text-gray-500 text-sm">Gastos del Mes</p>
              <Skeleton v-if="loadingResumen" width="100px" height="24px" />
              <p v-else class="text-2xl font-bold text-red-600">
                {{ formatCurrency(resumen?.totalGastado) }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <Card class="shadow-sm">
        <template #content>
          <div class="flex items-center">
            <div class="p-3 rounded-full mr-4" :class="(resumen?.balance ?? 0) >= 0 ? 'bg-blue-100' : 'bg-orange-100'">
              <i class="pi pi-wallet text-xl" :class="(resumen?.balance ?? 0) >= 0 ? 'text-blue-600' : 'text-orange-600'"></i>
            </div>
            <div>
              <p class="text-gray-500 text-sm">Balance</p>
              <Skeleton v-if="loadingResumen" width="100px" height="24px" />
              <p v-else class="text-2xl font-bold" :class="(resumen?.balance ?? 0) >= 0 ? 'text-blue-600' : 'text-orange-600'">
                {{ formatCurrency(resumen?.balance) }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <Card class="shadow-sm">
        <template #content>
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 mr-4">
              <i class="pi pi-chart-bar text-purple-600 text-xl"></i>
            </div>
            <div>
              <p class="text-gray-500 text-sm">Promedio por Gasto</p>
              <Skeleton v-if="loadingResumen" width="100px" height="24px" />
              <p v-else class="text-2xl font-bold text-gray-800">
                {{ formatCurrency(resumen?.promedioGasto) }}
              </p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Evolución Mensual -->
      <Card class="shadow-sm">
        <template #title>
          <div class="flex items-center">
            <i class="pi pi-chart-line mr-2 text-primary-500"></i>
            Evolución Mensual
          </div>
        </template>
        <template #content>
          <div class="h-64">
            <Skeleton v-if="loadingEvolucion" height="100%" />
            <Chart
              v-else-if="chartData"
              type="line"
              :data="chartData"
              :options="chartOptions"
              class="h-full"
            />
            <div v-else class="h-full flex items-center justify-center text-gray-400">
              No hay datos disponibles
            </div>
          </div>
        </template>
      </Card>

      <!-- Gastos por Categoría -->
      <Card class="shadow-sm">
        <template #title>
          <div class="flex items-center">
            <i class="pi pi-chart-pie mr-2 text-primary-500"></i>
            Gastos por Categoría
          </div>
        </template>
        <template #content>
          <div class="h-64">
            <Skeleton v-if="loadingCategorias" height="100%" />
            <Chart
              v-else-if="donutData"
              type="doughnut"
              :data="donutData"
              :options="donutOptions"
              class="h-full"
            />
            <div v-else class="h-full flex items-center justify-center text-gray-400">
              No hay datos disponibles
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
