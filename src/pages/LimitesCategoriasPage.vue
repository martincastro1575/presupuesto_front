<script setup>
import { ref, computed, watch } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { limitesCategoriasService } from '@/services/limitesCategorias.service'
import { categoriasService } from '@/services/categorias.service'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import ProgressBar from 'primevue/progressbar'
import Tag from 'primevue/tag'
import Card from 'primevue/card'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const toast = useToast()
const confirm = useConfirm()
const queryClient = useQueryClient()

const currentDate = new Date()
const selectedYear = ref(currentDate.getFullYear())
const selectedMonth = ref(currentDate.getMonth() + 1)

const showDialog = ref(false)
const showHistoricoDialog = ref(false)
const editingLimite = ref(null)
const historicoCategoria = ref(null)

const form = ref({
  montoLimite: null,
  categoriaId: null,
  anio: currentDate.getFullYear(),
  mes: currentDate.getMonth() + 1
})

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
  return [current - 1, current, current + 1].map(y => ({ label: y.toString(), value: y }))
})

// Queries
const { data: resumenPeriodo, isLoading } = useQuery({
  queryKey: ['limites-categorias', selectedYear, selectedMonth],
  queryFn: () => limitesCategoriasService.getByPeriodo(selectedYear.value, selectedMonth.value)
})

const { data: categorias } = useQuery({
  queryKey: ['categorias'],
  queryFn: () => categoriasService.getAll()
})

const { data: historico, isLoading: isLoadingHistorico } = useQuery({
  queryKey: ['limites-historico', historicoCategoria],
  queryFn: () => limitesCategoriasService.getHistoricoByCategoria(historicoCategoria.value),
  enabled: computed(() => !!historicoCategoria.value)
})

// Filtrar solo categorías de tipo Gasto (1) o Ambos (3)
const categoriasGasto = computed(() => {
  return categorias.value?.filter(c => c.tipo === 1 || c.tipo === 3) ?? []
})

// Mutations
const createOrUpdateMutation = useMutation({
  mutationFn: limitesCategoriasService.createOrUpdate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['limites-categorias'] })
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Límite guardado correctamente', life: 3000 })
    closeDialog()
  },
  onError: (error) => {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error al guardar límite', life: 5000 })
  }
})

const updateMutation = useMutation({
  mutationFn: ({ id, data }) => limitesCategoriasService.update(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['limites-categorias'] })
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Límite actualizado correctamente', life: 3000 })
    closeDialog()
  },
  onError: (error) => {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error al actualizar límite', life: 5000 })
  }
})

const deleteMutation = useMutation({
  mutationFn: limitesCategoriasService.delete,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['limites-categorias'] })
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Límite eliminado correctamente', life: 3000 })
  },
  onError: (error) => {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error al eliminar límite', life: 5000 })
  }
})

const copiarPeriodoMutation = useMutation({
  mutationFn: ({ anioOrigen, mesOrigen, anioDestino, mesDestino }) =>
    limitesCategoriasService.copiarPeriodo(anioOrigen, mesOrigen, anioDestino, mesDestino),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['limites-categorias'] })
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Límites copiados correctamente', life: 3000 })
  },
  onError: (error) => {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error al copiar límites', life: 5000 })
  }
})

const openNewDialog = () => {
  editingLimite.value = null
  form.value = {
    montoLimite: null,
    categoriaId: null,
    anio: selectedYear.value,
    mes: selectedMonth.value
  }
  showDialog.value = true
}

const openEditDialog = (limite) => {
  editingLimite.value = limite
  form.value = {
    montoLimite: limite.montoLimite,
    categoriaId: limite.categoriaId,
    anio: limite.anio,
    mes: limite.mes
  }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  editingLimite.value = null
}

const openHistoricoDialog = (limite) => {
  historicoCategoria.value = limite.categoriaId
  showHistoricoDialog.value = true
}

const closeHistoricoDialog = () => {
  showHistoricoDialog.value = false
  historicoCategoria.value = null
}

const handleSubmit = () => {
  if (editingLimite.value) {
    updateMutation.mutate({ id: editingLimite.value.id, data: { montoLimite: form.value.montoLimite } })
  } else {
    createOrUpdateMutation.mutate(form.value)
  }
}

const confirmDelete = (limite) => {
  confirm.require({
    message: '¿Estás seguro de eliminar este límite?',
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteMutation.mutate(limite.id)
  })
}

const copiarDelMesAnterior = () => {
  let mesOrigen = selectedMonth.value - 1
  let anioOrigen = selectedYear.value

  if (mesOrigen === 0) {
    mesOrigen = 12
    anioOrigen = anioOrigen - 1
  }

  confirm.require({
    message: `¿Copiar límites de ${getMesNombre(mesOrigen)} ${anioOrigen} a ${getMesNombre(selectedMonth.value)} ${selectedYear.value}?`,
    header: 'Copiar Límites',
    icon: 'pi pi-copy',
    accept: () => copiarPeriodoMutation.mutate({
      anioOrigen,
      mesOrigen,
      anioDestino: selectedYear.value,
      mesDestino: selectedMonth.value
    })
  })
}

const getMesNombre = (mes) => {
  return meses.find(m => m.value === mes)?.label ?? ''
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value || 0)
}

const getProgressColor = (porcentaje) => {
  if (porcentaje >= 100) return '#ef4444'
  if (porcentaje >= 75) return '#f59e0b'
  return '#22c55e'
}

const getStatusSeverity = (excedeLimite, porcentaje) => {
  if (excedeLimite) return 'danger'
  if (porcentaje >= 75) return 'warning'
  return 'success'
}

const getStatusLabel = (excedeLimite, porcentaje) => {
  if (excedeLimite) return 'Excedido'
  if (porcentaje >= 75) return 'Alerta'
  return 'Normal'
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Límites por Categoría</h1>
      <div class="flex gap-2">
        <Button
          label="Copiar del mes anterior"
          icon="pi pi-copy"
          class="p-button-outlined"
          @click="copiarDelMesAnterior"
          :loading="copiarPeriodoMutation.isPending.value"
        />
        <Button
          label="Nuevo Límite"
          icon="pi pi-plus"
          @click="openNewDialog"
        />
      </div>
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

    <!-- Resumen del período -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" v-if="resumenPeriodo">
      <Card class="shadow-sm">
        <template #content>
          <div class="text-center">
            <div class="text-gray-500 text-sm mb-1">Total Límites</div>
            <div class="text-2xl font-bold text-blue-600">
              {{ formatCurrency(resumenPeriodo.totalLimites) }}
            </div>
          </div>
        </template>
      </Card>

      <Card class="shadow-sm">
        <template #content>
          <div class="text-center">
            <div class="text-gray-500 text-sm mb-1">Total Gastado</div>
            <div class="text-2xl font-bold" :class="resumenPeriodo.totalGastado > resumenPeriodo.totalLimites ? 'text-red-600' : 'text-green-600'">
              {{ formatCurrency(resumenPeriodo.totalGastado) }}
            </div>
          </div>
        </template>
      </Card>

      <Card class="shadow-sm">
        <template #content>
          <div class="text-center">
            <div class="text-gray-500 text-sm mb-1">Categorías Excedidas</div>
            <div class="text-2xl font-bold" :class="resumenPeriodo.categoriasExcedidas > 0 ? 'text-red-600' : 'text-green-600'">
              {{ resumenPeriodo.categoriasExcedidas }}
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Tabla de límites -->
    <div class="bg-white rounded-lg shadow-sm">
      <DataTable
        :value="resumenPeriodo?.limites ?? []"
        :loading="isLoading"
        stripedRows
        class="p-datatable-sm"
      >
        <template #empty>
          <div class="text-center py-8 text-gray-400">
            <i class="pi pi-inbox text-4xl mb-2"></i>
            <p>No hay límites definidos para este período</p>
          </div>
        </template>

        <Column header="Categoría">
          <template #body="{ data }">
            <Tag
              :style="{ backgroundColor: data.categoriaColor }"
              class="text-white"
            >
              <i :class="data.categoriaIcono" class="mr-1"></i>
              {{ data.categoriaNombre }}
            </Tag>
          </template>
        </Column>

        <Column header="Límite">
          <template #body="{ data }">
            <span class="font-semibold">{{ formatCurrency(data.montoLimite) }}</span>
          </template>
        </Column>

        <Column header="Gastado">
          <template #body="{ data }">
            <span :class="data.excedeLimite ? 'text-red-600 font-semibold' : 'text-gray-600'">
              {{ formatCurrency(data.montoGastado) }}
            </span>
          </template>
        </Column>

        <Column header="Disponible">
          <template #body="{ data }">
            <span :class="data.montoDisponible < 0 ? 'text-red-600' : 'text-green-600'">
              {{ formatCurrency(data.montoDisponible) }}
            </span>
          </template>
        </Column>

        <Column header="Progreso" style="width: 180px">
          <template #body="{ data }">
            <div>
              <ProgressBar
                :value="Math.min(data.porcentajeConsumido, 100)"
                :showValue="false"
                style="height: 8px"
                :pt="{
                  value: { style: { backgroundColor: getProgressColor(data.porcentajeConsumido) } }
                }"
              />
              <span class="text-xs text-gray-500">
                {{ Math.round(data.porcentajeConsumido) }}%
              </span>
            </div>
          </template>
        </Column>

        <Column header="Estado" style="width: 100px">
          <template #body="{ data }">
            <Tag
              :severity="getStatusSeverity(data.excedeLimite, data.porcentajeConsumido)"
              :value="getStatusLabel(data.excedeLimite, data.porcentajeConsumido)"
            />
          </template>
        </Column>

        <Column header="Acciones" style="width: 150px">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button
                icon="pi pi-history"
                class="p-button-text p-button-sm"
                v-tooltip.top="'Ver histórico'"
                @click="openHistoricoDialog(data)"
              />
              <Button
                icon="pi pi-pencil"
                class="p-button-text p-button-sm"
                v-tooltip.top="'Editar'"
                @click="openEditDialog(data)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-text p-button-danger p-button-sm"
                v-tooltip.top="'Eliminar'"
                @click="confirmDelete(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Dialog para crear/editar -->
    <Dialog
      v-model:visible="showDialog"
      :header="editingLimite ? 'Editar Límite' : 'Nuevo Límite'"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="!editingLimite">
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <Dropdown
            v-model="form.categoriaId"
            :options="categoriasGasto"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Selecciona una categoría"
            class="w-full"
            required
          >
            <template #option="{ option }">
              <div class="flex items-center">
                <i :class="option.icono" :style="{ color: option.color }" class="mr-2"></i>
                {{ option.nombre }}
              </div>
            </template>
          </Dropdown>
        </div>

        <div v-else class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <Tag
            :style="{ backgroundColor: editingLimite.categoriaColor }"
            class="text-white"
          >
            <i :class="editingLimite.categoriaIcono" class="mr-1"></i>
            {{ editingLimite.categoriaNombre }}
          </Tag>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Monto Límite</label>
          <InputNumber
            v-model="form.montoLimite"
            mode="currency"
            currency="ARS"
            locale="es-AR"
            class="w-full"
            :min="0"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-4" v-if="!editingLimite">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <Dropdown
              v-model="form.anio"
              :options="years"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <Dropdown
              v-model="form.mes"
              :options="meses"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-4">
          <Button
            label="Cancelar"
            class="p-button-text"
            @click="closeDialog"
          />
          <Button
            type="submit"
            :label="editingLimite ? 'Guardar' : 'Crear'"
            :loading="createOrUpdateMutation.isPending.value || updateMutation.isPending.value"
          />
        </div>
      </form>
    </Dialog>

    <!-- Dialog para histórico -->
    <Dialog
      v-model:visible="showHistoricoDialog"
      header="Histórico de Límites"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div v-if="isLoadingHistorico" class="text-center py-4">
        <i class="pi pi-spin pi-spinner text-2xl"></i>
      </div>

      <div v-else-if="historico">
        <div class="mb-4">
          <Tag
            :style="{ backgroundColor: historico.categoriaColor }"
            class="text-white"
          >
            <i :class="historico.categoriaIcono" class="mr-1"></i>
            {{ historico.categoriaNombre }}
          </Tag>
        </div>

        <DataTable
          :value="historico.limites ?? []"
          stripedRows
          class="p-datatable-sm"
        >
          <template #empty>
            <div class="text-center py-4 text-gray-400">
              No hay histórico disponible
            </div>
          </template>

          <Column header="Período">
            <template #body="{ data }">
              {{ getMesNombre(data.mes) }} {{ data.anio }}
            </template>
          </Column>

          <Column header="Límite">
            <template #body="{ data }">
              <span class="font-semibold">{{ formatCurrency(data.montoLimite) }}</span>
            </template>
          </Column>

          <Column header="Gastado">
            <template #body="{ data }">
              <span :class="data.excedeLimite ? 'text-red-600' : 'text-gray-600'">
                {{ formatCurrency(data.montoGastado) }}
              </span>
            </template>
          </Column>

          <Column header="% Consumido">
            <template #body="{ data }">
              <Tag
                :severity="getStatusSeverity(data.excedeLimite, data.porcentajeConsumido)"
                :value="`${Math.round(data.porcentajeConsumido)}%`"
              />
            </template>
          </Column>
        </DataTable>
      </div>

      <template #footer>
        <Button label="Cerrar" class="p-button-text" @click="closeHistoricoDialog" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
:deep(.p-inputnumber),
:deep(.p-dropdown) {
  width: 100%;
}
</style>
