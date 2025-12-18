<script setup>
import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { presupuestosService } from '@/services/presupuestos.service'
import { categoriasService } from '@/services/categorias.service'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import ProgressBar from 'primevue/progressbar'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const toast = useToast()
const confirm = useConfirm()
const queryClient = useQueryClient()

const currentDate = new Date()
const selectedYear = ref(currentDate.getFullYear())
const selectedMonth = ref(currentDate.getMonth() + 1)

const showDialog = ref(false)
const editingPresupuesto = ref(null)
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
const { data: presupuestos, isLoading } = useQuery({
  queryKey: ['presupuestos', selectedYear, selectedMonth],
  queryFn: () => presupuestosService.getByPeriod(selectedYear.value, selectedMonth.value)
})

const { data: categorias } = useQuery({
  queryKey: ['categorias'],
  queryFn: () => categoriasService.getAll()
})

// Mutations
const createMutation = useMutation({
  mutationFn: presupuestosService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['presupuestos'] })
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Presupuesto creado correctamente', life: 3000 })
    closeDialog()
  },
  onError: (error) => {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error al crear presupuesto', life: 5000 })
  }
})

const updateMutation = useMutation({
  mutationFn: ({ id, data }) => presupuestosService.update(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['presupuestos'] })
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Presupuesto actualizado correctamente', life: 3000 })
    closeDialog()
  },
  onError: (error) => {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error al actualizar presupuesto', life: 5000 })
  }
})

const deleteMutation = useMutation({
  mutationFn: presupuestosService.delete,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['presupuestos'] })
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Presupuesto eliminado correctamente', life: 3000 })
  },
  onError: (error) => {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error al eliminar presupuesto', life: 5000 })
  }
})

const openNewDialog = () => {
  editingPresupuesto.value = null
  form.value = {
    montoLimite: null,
    categoriaId: null,
    anio: selectedYear.value,
    mes: selectedMonth.value
  }
  showDialog.value = true
}

const openEditDialog = (presupuesto) => {
  editingPresupuesto.value = presupuesto
  form.value = {
    montoLimite: presupuesto.montoLimite,
    categoriaId: presupuesto.categoriaId,
    anio: presupuesto.anio,
    mes: presupuesto.mes
  }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  editingPresupuesto.value = null
}

const handleSubmit = () => {
  if (editingPresupuesto.value) {
    updateMutation.mutate({ id: editingPresupuesto.value.id, data: form.value })
  } else {
    createMutation.mutate(form.value)
  }
}

const confirmDelete = (presupuesto) => {
  confirm.require({
    message: '¿Estás seguro de eliminar este presupuesto?',
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteMutation.mutate(presupuesto.id)
  })
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value || 0)
}

const getProgressSeverity = (porcentaje) => {
  if (porcentaje >= 100) return 'danger'
  if (porcentaje >= 75) return 'warning'
  return 'success'
}

const getProgressColor = (porcentaje) => {
  if (porcentaje >= 100) return '#ef4444'
  if (porcentaje >= 75) return '#f59e0b'
  return '#22c55e'
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Presupuestos</h1>
      <Button
        label="Nuevo Presupuesto"
        icon="pi pi-plus"
        @click="openNewDialog"
      />
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

    <div class="bg-white rounded-lg shadow-sm">
      <DataTable
        :value="presupuestos ?? []"
        :loading="isLoading"
        stripedRows
        class="p-datatable-sm"
      >
        <template #empty>
          <div class="text-center py-8 text-gray-400">
            <i class="pi pi-inbox text-4xl mb-2"></i>
            <p>No hay presupuestos para este período</p>
          </div>
        </template>

        <Column header="Categoría">
          <template #body="{ data }">
            <Tag
              v-if="data.categoriaId"
              :style="{ backgroundColor: data.categoriaColor }"
              class="text-white"
            >
              <i :class="data.categoriaIcono" class="mr-1"></i>
              {{ data.categoriaNombre }}
            </Tag>
            <span v-else class="text-gray-600">General</span>
          </template>
        </Column>

        <Column header="Límite">
          <template #body="{ data }">
            <span class="font-semibold">{{ formatCurrency(data.montoLimite) }}</span>
          </template>
        </Column>

        <Column header="Gastado">
          <template #body="{ data }">
            <span :class="data.montoGastado > data.montoLimite ? 'text-red-600' : 'text-gray-600'">
              {{ formatCurrency(data.montoGastado || 0) }}
            </span>
          </template>
        </Column>

        <Column header="Progreso" style="width: 200px">
          <template #body="{ data }">
            <div>
              <ProgressBar
                :value="Math.min(((data.montoGastado || 0) / data.montoLimite) * 100, 100)"
                :showValue="false"
                style="height: 8px"
                :pt="{
                  value: { style: { backgroundColor: getProgressColor(((data.montoGastado || 0) / data.montoLimite) * 100) } }
                }"
              />
              <span class="text-xs text-gray-500">
                {{ Math.round(((data.montoGastado || 0) / data.montoLimite) * 100) }}%
              </span>
            </div>
          </template>
        </Column>

        <Column header="Acciones" style="width: 120px">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button
                icon="pi pi-pencil"
                class="p-button-text p-button-sm"
                @click="openEditDialog(data)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-text p-button-danger p-button-sm"
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
      :header="editingPresupuesto ? 'Editar Presupuesto' : 'Nuevo Presupuesto'"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Monto Límite</label>
          <InputNumber
            v-model="form.montoLimite"
            mode="currency"
            currency="ARS"
            locale="es-AR"
            class="w-full"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoría (opcional)</label>
          <Dropdown
            v-model="form.categoriaId"
            :options="categorias"
            optionLabel="nombre"
            optionValue="id"
            placeholder="General (todas las categorías)"
            class="w-full"
            showClear
          >
            <template #option="{ option }">
              <div class="flex items-center">
                <i :class="option.icono" :style="{ color: option.color }" class="mr-2"></i>
                {{ option.nombre }}
              </div>
            </template>
          </Dropdown>
        </div>

        <div class="grid grid-cols-2 gap-4">
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
            :label="editingPresupuesto ? 'Guardar' : 'Crear'"
            :loading="createMutation.isPending.value || updateMutation.isPending.value"
          />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<style scoped>
:deep(.p-inputnumber),
:deep(.p-dropdown) {
  width: 100%;
}
</style>
