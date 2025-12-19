<script setup>
import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { gastosService } from '@/services/gastos.service'
import { categoriasService } from '@/services/categorias.service'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const toast = useToast()
const confirm = useConfirm()
const queryClient = useQueryClient()

const showDialog = ref(false)
const editingGasto = ref(null)
const form = ref({
  monto: null,
  fecha: new Date(),
  categoriaId: null,
  descripcion: ''
})

// Queries
const { data: gastos, isLoading } = useQuery({
  queryKey: ['gastos'],
  queryFn: () => gastosService.getAll()
})

const { data: categorias } = useQuery({
  queryKey: ['categorias'],
  queryFn: () => categoriasService.getAll()
})

// Filtro por categorías
const selectedCategorias = ref([])

const gastosFiltrados = computed(() => {
  if (!gastos.value) return []
  if (selectedCategorias.value.length === 0) return gastos.value

  const selectedIds = selectedCategorias.value.map(c => c.id)
  return gastos.value.filter(g => selectedIds.includes(g.categoriaId))
})

const clearFilter = () => {
  selectedCategorias.value = []
}

// Mutations
// Invalida todas las queries relacionadas con gastos
const invalidateGastosQueries = () => {
  queryClient.invalidateQueries({ queryKey: ['gastos'] })
  queryClient.invalidateQueries({ queryKey: ['presupuestos'] })
  queryClient.invalidateQueries({ queryKey: ['presupuestos-reporte'] })
  queryClient.invalidateQueries({ queryKey: ['resumen-mensual'] })
  queryClient.invalidateQueries({ queryKey: ['gastos-categoria'] })
  queryClient.invalidateQueries({ queryKey: ['evolucion-mensual'] })
}

const createMutation = useMutation({
  mutationFn: gastosService.create,
  onSuccess: () => {
    invalidateGastosQueries()
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Gasto creado correctamente', life: 3000 })
    closeDialog()
  },
  onError: (error) => {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error al crear gasto', life: 5000 })
  }
})

const updateMutation = useMutation({
  mutationFn: ({ id, data }) => gastosService.update(id, data),
  onSuccess: () => {
    invalidateGastosQueries()
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Gasto actualizado correctamente', life: 3000 })
    closeDialog()
  },
  onError: (error) => {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error al actualizar gasto', life: 5000 })
  }
})

const deleteMutation = useMutation({
  mutationFn: gastosService.delete,
  onSuccess: () => {
    invalidateGastosQueries()
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Gasto eliminado correctamente', life: 3000 })
  },
  onError: (error) => {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error al eliminar gasto', life: 5000 })
  }
})

const openNewDialog = () => {
  editingGasto.value = null
  form.value = {
    monto: null,
    fecha: new Date(),
    categoriaId: null,
    descripcion: ''
  }
  showDialog.value = true
}

const openEditDialog = (gasto) => {
  editingGasto.value = gasto
  form.value = {
    monto: gasto.monto,
    fecha: new Date(gasto.fecha),
    categoriaId: gasto.categoriaId,
    descripcion: gasto.descripcion || ''
  }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  editingGasto.value = null
}

const handleSubmit = () => {
  const data = {
    ...form.value,
    fecha: form.value.fecha.toISOString().split('T')[0]
  }

  if (editingGasto.value) {
    updateMutation.mutate({ id: editingGasto.value.id, data })
  } else {
    createMutation.mutate(data)
  }
}

const confirmDelete = (gasto) => {
  confirm.require({
    message: '¿Estás seguro de eliminar este gasto?',
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteMutation.mutate(gasto.id)
  })
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value || 0)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-AR')
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Gastos</h1>
      <Button
        label="Nuevo Gasto"
        icon="pi pi-plus"
        @click="openNewDialog"
      />
    </div>

    <!-- Filtro por categorías -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div class="flex items-center gap-3">
        <label class="text-sm font-medium text-gray-700">Filtrar por categoría:</label>
        <MultiSelect
          v-model="selectedCategorias"
          :options="categorias ?? []"
          optionLabel="nombre"
          placeholder="Todas las categorías"
          :maxSelectedLabels="3"
          class="w-80"
          display="chip"
          filter
          filterPlaceholder="Buscar categoría..."
        >
          <template #option="{ option }">
            <div class="flex items-center">
              <i :class="option.icono" :style="{ color: option.color }" class="mr-2"></i>
              {{ option.nombre }}
            </div>
          </template>
          <template #chip="{ value }">
            <div class="flex items-center">
              <i :class="value.icono" :style="{ color: value.color }" class="mr-1 text-xs"></i>
              {{ value.nombre }}
            </div>
          </template>
        </MultiSelect>
        <Button
          v-if="selectedCategorias.length > 0"
          icon="pi pi-times"
          class="p-button-text p-button-sm"
          @click="clearFilter"
          v-tooltip.top="'Limpiar filtro'"
        />
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm">
      <DataTable
        :value="gastosFiltrados"
        :loading="isLoading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        stripedRows
        removableSort
        class="p-datatable-sm"
      >
        <template #empty>
          <div class="text-center py-8 text-gray-400">
            <i class="pi pi-inbox text-4xl mb-2"></i>
            <p>No hay gastos registrados</p>
          </div>
        </template>

        <Column field="fecha" header="Fecha" sortable>
          <template #body="{ data }">
            {{ formatDate(data.fecha) }}
          </template>
        </Column>

        <Column field="categoriaNombre" header="Categoría">
          <template #body="{ data }">
            <Tag :style="{ backgroundColor: data.categoriaColor }" class="text-white">
              <i :class="data.categoriaIcono" class="mr-1"></i>
              {{ data.categoriaNombre }}
            </Tag>
          </template>
        </Column>

        <Column field="descripcion" header="Descripción">
          <template #body="{ data }">
            <span class="text-gray-600">{{ data.descripcion || '-' }}</span>
          </template>
        </Column>

        <Column field="monto" header="Monto" sortable>
          <template #body="{ data }">
            <span class="font-semibold">{{ formatCurrency(data.monto) }}</span>
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
      :header="editingGasto ? 'Editar Gasto' : 'Nuevo Gasto'"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Monto</label>
          <InputNumber
            v-model="form.monto"
            mode="currency"
            currency="ARS"
            locale="es-AR"
            class="w-full"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <Calendar
            v-model="form.fecha"
            dateFormat="dd/mm/yy"
            class="w-full"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <Dropdown
            v-model="form.categoriaId"
            :options="categorias"
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

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <Textarea
            v-model="form.descripcion"
            rows="3"
            class="w-full"
            placeholder="Descripción opcional..."
          />
        </div>

        <div class="flex justify-end gap-2 pt-4">
          <Button
            label="Cancelar"
            class="p-button-text"
            @click="closeDialog"
          />
          <Button
            type="submit"
            :label="editingGasto ? 'Guardar' : 'Crear'"
            :loading="createMutation.isPending.value || updateMutation.isPending.value"
          />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<style scoped>
:deep(.p-inputnumber),
:deep(.p-calendar),
:deep(.p-dropdown),
:deep(.p-inputtextarea),
:deep(.p-multiselect) {
  width: 100%;
}

:deep(.p-multiselect.w-80) {
  width: 20rem;
}
</style>
