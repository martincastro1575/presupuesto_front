<script setup>
import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { reportesService } from '@/services/reportes.service'
import { presupuestosService } from '@/services/presupuestos.service'
import Card from 'primevue/card'
import Chart from 'primevue/chart'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'

const currentDate = new Date()
const selectedYear = ref(currentDate.getFullYear())
const selectedMonth = ref(currentDate.getMonth() + 1)

const meses = [
  { label: 'Enero', value: 1 },
  { label: 'Febrero', value: 2 },
  { label: 'Marzo', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Mayo', value: 5 },
  { label: 'Junio', value: 6 },
  { label: 'Julio', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Septiembre', value: 9 },
  { label: 'Octubre', value: 10 },
  { label: 'Noviembre', value: 11 },
  { label: 'Diciembre', value: 12 }
]

const years = computed(() => {
  const current = currentDate.getFullYear()
  return [current - 2, current - 1, current].map(y => ({ label: y.toString(), value: y }))
})

// Queries
const { data: resumen, isLoading: loadingResumen } = useQuery({
  queryKey: ['resumen-mensual', selectedYear, selectedMonth],
  queryFn: () => reportesService.getResumenMensual(selectedYear.value, selectedMonth.value)
})

const { data: gastosPorCategoria, isLoading: loadingCategorias } = useQuery({
  queryKey: ['gastos-categoria', selectedYear, selectedMonth],
  queryFn: () => reportesService.getGastosPorCategoria(selectedYear.value, selectedMonth.value)
})

const { data: presupuestos, isLoading: loadingPresupuestos } = useQuery({
  queryKey: ['presupuestos-reporte', selectedYear, selectedMonth],
  queryFn: () => presupuestosService.getByPeriod(selectedYear.value, selectedMonth.value)
})

const { data: evolucion, isLoading: loadingEvolucion } = useQuery({
  queryKey: ['evolucion-mensual'],
  queryFn: () => reportesService.getEvolucionMensual(12)
})

// Chart data para categorías (bar horizontal)
const barData = computed(() => {
  if (!gastosPorCategoria.value?.length) return null

  return {
    labels: gastosPorCategoria.value.map(c => c.categoriaNombre),
    datasets: [
      {
        label: 'Gastos',
        data: gastosPorCategoria.value.map(c => c.totalMonto),
        backgroundColor: gastosPorCategoria.value.map(c => c.categoriaColor)
      }
    ]
  }
})

const barOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      ticks: {
        callback: (value) => `$${value.toLocaleString()}`
      }
    }
  }
}

// Chart data para evolución
const lineData = computed(() => {
  if (!evolucion.value) return null

  return {
    labels: evolucion.value.map(e => e.mesNombre),
    datasets: [
      {
        label: 'Gastos Mensuales',
        data: evolucion.value.map(e => e.totalGastado),
        fill: true,
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.2)',
        tension: 0.4
      }
    ]
  }
})

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
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

// Chart data para comparativo presupuesto vs gastos
const comparativoData = computed(() => {
  if (!presupuestos.value?.length) return null

  return {
    labels: presupuestos.value.map(p => p.categoriaNombre || 'General'),
    datasets: [
      {
        label: 'Presupuesto',
        data: presupuestos.value.map(p => p.montoLimite),
        backgroundColor: '#3b82f6'
      },
      {
        label: 'Gastado',
        data: presupuestos.value.map(p => p.montoGastado || 0),
        backgroundColor: presupuestos.value.map(p => (p.montoGastado || 0) > p.montoLimite ? '#ef4444' : '#22c55e')
      }
    ]
  }
})

const comparativoOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
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

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value || 0)
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Reportes</h1>
    </div>

    <!-- Filtros de período -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex gap-4 items-center">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Año:</label>
          <Dropdown
            v-model="selectedYear"
            :options="years"
            optionLabel="label"
            optionValue="value"
            class="w-32"
          />
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Mes:</label>
          <Dropdown
            v-model="selectedMonth"
            :options="meses"
            optionLabel="label"
            optionValue="value"
            class="w-40"
          />
        </div>
      </div>
    </div>

    <!-- Resumen del mes -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card class="shadow-sm">
        <template #content>
          <div class="text-center">
            <i class="pi pi-wallet text-blue-500 text-2xl mb-2"></i>
            <p class="text-gray-500 text-sm">Total Gastado</p>
            <Skeleton v-if="loadingResumen" width="80px" height="24px" class="mx-auto" />
            <p v-else class="text-xl font-bold text-gray-800">
              {{ formatCurrency(resumen?.totalGastado) }}
            </p>
          </div>
        </template>
      </Card>

      <Card class="shadow-sm">
        <template #content>
          <div class="text-center">
            <i class="pi pi-chart-bar text-green-500 text-2xl mb-2"></i>
            <p class="text-gray-500 text-sm">Promedio por Gasto</p>
            <Skeleton v-if="loadingResumen" width="80px" height="24px" class="mx-auto" />
            <p v-else class="text-xl font-bold text-gray-800">
              {{ formatCurrency(resumen?.promedioGasto) }}
            </p>
          </div>
        </template>
      </Card>

      <Card class="shadow-sm">
        <template #content>
          <div class="text-center">
            <i class="pi pi-shopping-cart text-purple-500 text-2xl mb-2"></i>
            <p class="text-gray-500 text-sm">Cantidad de Gastos</p>
            <Skeleton v-if="loadingResumen" width="40px" height="24px" class="mx-auto" />
            <p v-else class="text-xl font-bold text-gray-800">
              {{ resumen?.cantidadGastos || 0 }}
            </p>
          </div>
        </template>
      </Card>

      <Card class="shadow-sm">
        <template #content>
          <div class="text-center">
            <i class="pi pi-calendar text-orange-500 text-2xl mb-2"></i>
            <p class="text-gray-500 text-sm">Período</p>
            <p class="text-xl font-bold text-gray-800">
              {{ meses.find(m => m.value === selectedMonth)?.label }} {{ selectedYear }}
            </p>
          </div>
        </template>
      </Card>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Gastos por Categoría -->
      <Card class="shadow-sm">
        <template #title>
          <div class="flex items-center">
            <i class="pi pi-chart-bar mr-2 text-primary-500"></i>
            Gastos por Categoría
          </div>
        </template>
        <template #content>
          <div class="h-72">
            <Skeleton v-if="loadingCategorias" height="100%" />
            <Chart
              v-else-if="barData"
              type="bar"
              :data="barData"
              :options="barOptions"
              class="h-full"
            />
            <div v-else class="h-full flex items-center justify-center text-gray-400">
              No hay datos disponibles
            </div>
          </div>
        </template>
      </Card>

      <!-- Comparativo Presupuesto -->
      <Card class="shadow-sm">
        <template #title>
          <div class="flex items-center">
            <i class="pi pi-chart-pie mr-2 text-primary-500"></i>
            Presupuesto vs Gastado
          </div>
        </template>
        <template #content>
          <div class="h-72">
            <Skeleton v-if="loadingPresupuestos" height="100%" />
            <Chart
              v-else-if="comparativoData"
              type="bar"
              :data="comparativoData"
              :options="comparativoOptions"
              class="h-full"
            />
            <div v-else class="h-full flex items-center justify-center text-gray-400">
              No hay presupuestos configurados
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Evolución Anual -->
    <Card class="shadow-sm mb-6">
      <template #title>
        <div class="flex items-center">
          <i class="pi pi-chart-line mr-2 text-primary-500"></i>
          Evolución de Gastos (Últimos 12 meses)
        </div>
      </template>
      <template #content>
        <div class="h-72">
          <Skeleton v-if="loadingEvolucion" height="100%" />
          <Chart
            v-else-if="lineData"
            type="line"
            :data="lineData"
            :options="lineOptions"
            class="h-full"
          />
          <div v-else class="h-full flex items-center justify-center text-gray-400">
            No hay datos disponibles
          </div>
        </div>
      </template>
    </Card>

    <!-- Detalle por Categoría -->
    <Card class="shadow-sm">
      <template #title>
        <div class="flex items-center">
          <i class="pi pi-list mr-2 text-primary-500"></i>
          Detalle por Categoría
        </div>
      </template>
      <template #content>
        <DataTable
          :value="gastosPorCategoria"
          :loading="loadingCategorias"
          stripedRows
          class="p-datatable-sm"
        >
          <template #empty>
            <div class="text-center py-4 text-gray-400">
              No hay gastos en este período
            </div>
          </template>

          <Column header="Categoría">
            <template #body="{ data }">
              <Tag :style="{ backgroundColor: data.categoriaColor }" class="text-white">
                <i :class="data.categoriaIcono" class="mr-1"></i>
                {{ data.categoriaNombre }}
              </Tag>
            </template>
          </Column>

          <Column header="Cantidad">
            <template #body="{ data }">
              {{ data.cantidadGastos }} gastos
            </template>
          </Column>

          <Column header="Total">
            <template #body="{ data }">
              <span class="font-semibold">{{ formatCurrency(data.totalMonto) }}</span>
            </template>
          </Column>

          <Column header="% del Total">
            <template #body="{ data }">
              <span class="text-gray-600">
                {{ resumen?.totalGastado ? Math.round((data.totalMonto / resumen.totalGastado) * 100) : 0 }}%
              </span>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>
