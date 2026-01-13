<script setup>
import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ingresosService } from '@/services/ingresos.service'
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
const editingIngreso = ref(null)
const form = ref({
  monto: null,
  fecha: new Date(),
  categoriaId: null,
  concepto: '',
  descripcion: ''
})

// Queries
const { data: ingresos, isLoading } = useQuery({
  queryKey: ['ingresos'],
  queryFn: () => ingresosService.getAll()
})

const { data: categorias } = useQuery({
  queryKey: ['categorias-ingreso'],
  queryFn: () => categoriasService.getForIngresos()
})

// Filtro por categoria
const selectedCategorias = ref([])

const ingresosFiltrados = computed(() => {
  if (!ingresos.value) return []
  if (selectedCategorias.value.length === 0) return ingresos.value

  const selectedIds = selectedCategorias.value.map(c => c.id)
  return ingresos.value.filter(i => selectedIds.includes(i.categoriaId))
})

const clearFilter = () => {
  selectedCategorias.value = []
}

// Mutations
const invalidateIngresosQueries = () => {
  queryClient.invalidateQueries({ queryKey: ['ingresos'] })
  queryClient.invalidateQueries({ queryKey: ['resumen-mensual'] })
}

const createMutation = useMutation({
  mutationFn: ingresosService.create,
  onSuccess: () => {
    invalidateIngresosQueries()
    toast.add({ severity: 'success', summary: 'Exito', detail: 'Ingreso creado correctamente', life: 3000 })
    closeDialog()
  },
  onError: (error) => {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error al crear ingreso', life: 5000 })
  }
})

const updateMutation = useMutation({
  mutationFn: ({ id, data }) => ingresosService.update(id, data),
  onSuccess: () => {
    invalidateIngresosQueries()
    toast.add({ severity: 'success', summary: 'Exito', detail: 'Ingreso actualizado correctamente', life: 3000 })
    closeDialog()
  },
  onError: (error) => {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error al actualizar ingreso', life: 5000 })
  }
})

const deleteMutation = useMutation({
  mutationFn: ingresosService.delete,
  onSuccess: () => {
    invalidateIngresosQueries()
    toast.add({ severity: 'success', summary: 'Exito', detail: 'Ingreso eliminado correctamente', life: 3000 })
  },
  onError: (error) => {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error al eliminar ingreso', life: 5000 })
  }
})

const openNewDialog = () => {
  editingIngreso.value = null
  form.value = {
    monto: null,
    fecha: new Date(),
    categoriaId: null,
    concepto: '',
    descripcion: ''
  }
  showDialog.value = true
}

const openEditDialog = (ingreso) => {
  editingIngreso.value = ingreso
  form.value = {
    monto: ingreso.monto,
    fecha: new Date(ingreso.fecha),
    categoriaId: ingreso.categoriaId,
    concepto: ingreso.concepto || '',
    descripcion: ingreso.descripcion || ''
  }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  editingIngreso.value = null
}

const handleSubmit = () => {
  const data = {
    ...form.value,
    fecha: form.value.fecha.toISOString().split('T')[0]
  }

  if (editingIngreso.value) {
    updateMutation.mutate({ id: editingIngreso.value.id, data })
  } else {
    createMutation.mutate(data)
  }
}

const confirmDelete = (ingreso) => {
  confirm.require({
    message: 'Estas seguro de eliminar este ingreso?',
    header: 'Confirmar Eliminacion',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteMutation.mutate(ingreso.id)
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
      <h1 class="text-2xl font-bold text-gray-800">Ingresos</h1>
      <Button
        label="Nuevo Ingreso"
        icon="pi pi-plus"
        @click="openNewDialog"
      />
    </div>

    <!-- Filtro por categoria -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div class="flex items-center gap-3">
        <label class="text-sm font-medium text-gray-700">Filtrar por categoria:</label>
        <MultiSelect
          v-model="selectedCategorias"
          :options="categorias ?? []"
          optionLabel="nombre"
          placeholder="Todas las categorias"
          :maxSelectedLabels="3"
          class="w-80"
          display="chip"
          filter
          filterPlaceholder="Buscar categoria..."
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
        :value="ingresosFiltrados"
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
            <p>No hay ingresos registrados</p>
          </div>
        </template>

        <Column field="fecha" header="Fecha" sortable>
          <template #body="{ data }">
            {{ formatDate(data.fecha) }}
          </template>
        </Column>

        <Column field="categoriaNombre" header="Categoria">
          <template #body="{ data }">
            <Tag :style="{ backgroundColor: data.categoriaColor }" class="text-white">
              <i :class="data.categoriaIcono" class="mr-1"></i>
              {{ data.categoriaNombre }}
            </Tag>
          </template>
        </Column>

        <Column field="concepto" header="Concepto">
          <template #body="{ data }">
            <span class="font-medium">{{ data.concepto }}</span>
          </template>
        </Column>

        <Column field="descripcion" header="Descripcion">
          <template #body="{ data }">
            <span class="text-gray-600">{{ data.descripcion || '-' }}</span>
          </template>
        </Column>

        <Column field="monto" header="Monto" sortable>
          <template #body="{ data }">
            <span class="font-semibold text-green-600">{{ formatCurrency(data.monto) }}</span>
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
      :header="editingIngreso ? 'Editar Ingreso' : 'Nuevo Ingreso'"
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
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <Dropdown
            v-model="form.categoriaId"
            :options="categorias"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Selecciona una categoria"
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
          <label class="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
          <InputText
            v-model="form.concepto"
            class="w-full"
            placeholder="Ej: Sueldo de Enero"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
          <Textarea
            v-model="form.descripcion"
            rows="3"
            class="w-full"
            placeholder="Descripcion opcional..."
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
            :label="editingIngreso ? 'Guardar' : 'Crear'"
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
:deep(.p-inputtext),
:deep(.p-multiselect) {
  width: 100%;
}

:deep(.p-multiselect.w-80) {
  width: 20rem;
}
</style>
