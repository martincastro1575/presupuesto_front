<script setup>
import { ref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { categoriasService } from '@/services/categorias.service'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import ColorPicker from 'primevue/colorpicker'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const toast = useToast()
const confirm = useConfirm()
const queryClient = useQueryClient()

const showDialog = ref(false)
const editingCategoria = ref(null)
const form = ref({
  nombre: '',
  icono: 'pi-tag',
  color: '6366f1'
})

const iconOptions = [
  { label: 'Carrito', value: 'pi-shopping-cart' },
  { label: 'Auto', value: 'pi-car' },
  { label: 'Rayo', value: 'pi-bolt' },
  { label: 'Ticket', value: 'pi-ticket' },
  { label: 'Corazón', value: 'pi-heart' },
  { label: 'Libro', value: 'pi-book' },
  { label: 'Casa', value: 'pi-home' },
  { label: 'Etiqueta', value: 'pi-tag' },
  { label: 'Billetera', value: 'pi-wallet' },
  { label: 'Regalo', value: 'pi-gift' },
  { label: 'Teléfono', value: 'pi-phone' },
  { label: 'Wifi', value: 'pi-wifi' }
]

// Queries
const { data: categorias, isLoading } = useQuery({
  queryKey: ['categorias'],
  queryFn: () => categoriasService.getAll()
})

// Mutations
const createMutation = useMutation({
  mutationFn: categoriasService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['categorias'] })
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría creada correctamente', life: 3000 })
    closeDialog()
  },
  onError: (error) => {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error al crear categoría', life: 5000 })
  }
})

const updateMutation = useMutation({
  mutationFn: ({ id, data }) => categoriasService.update(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['categorias'] })
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría actualizada correctamente', life: 3000 })
    closeDialog()
  },
  onError: (error) => {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error al actualizar categoría', life: 5000 })
  }
})

const deleteMutation = useMutation({
  mutationFn: categoriasService.delete,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['categorias'] })
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría eliminada correctamente', life: 3000 })
  },
  onError: (error) => {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Error al eliminar categoría', life: 5000 })
  }
})

const openNewDialog = () => {
  editingCategoria.value = null
  form.value = {
    nombre: '',
    icono: 'pi-tag',
    color: '6366f1'
  }
  showDialog.value = true
}

const openEditDialog = (categoria) => {
  editingCategoria.value = categoria
  form.value = {
    nombre: categoria.nombre,
    icono: categoria.icono,
    color: categoria.color.replace('#', '')
  }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  editingCategoria.value = null
}

const handleSubmit = () => {
  const data = {
    ...form.value,
    color: `#${form.value.color}`
  }

  if (editingCategoria.value) {
    updateMutation.mutate({ id: editingCategoria.value.id, data })
  } else {
    createMutation.mutate(data)
  }
}

const confirmDelete = (categoria) => {
  if (categoria.esPredefinida) {
    toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'No se pueden eliminar categorías predefinidas', life: 3000 })
    return
  }

  confirm.require({
    message: '¿Estás seguro de eliminar esta categoría?',
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteMutation.mutate(categoria.id)
  })
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Categorías</h1>
      <Button
        label="Nueva Categoría"
        icon="pi pi-plus"
        @click="openNewDialog"
      />
    </div>

    <div class="bg-white rounded-lg shadow-sm">
      <DataTable
        :value="categorias"
        :loading="isLoading"
        paginator
        :rows="10"
        stripedRows
        class="p-datatable-sm"
      >
        <template #empty>
          <div class="text-center py-8 text-gray-400">
            <i class="pi pi-inbox text-4xl mb-2"></i>
            <p>No hay categorías registradas</p>
          </div>
        </template>

        <Column header="Icono" style="width: 80px">
          <template #body="{ data }">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: data.color }"
            >
              <i :class="`pi ${data.icono}`" class="text-white"></i>
            </div>
          </template>
        </Column>

        <Column field="nombre" header="Nombre" sortable />

        <Column header="Tipo" style="width: 150px">
          <template #body="{ data }">
            <Tag
              :value="data.esPredefinida ? 'Predefinida' : 'Personalizada'"
              :severity="data.esPredefinida ? 'info' : 'success'"
            />
          </template>
        </Column>

        <Column header="Acciones" style="width: 120px">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button
                icon="pi pi-pencil"
                class="p-button-text p-button-sm"
                @click="openEditDialog(data)"
                :disabled="data.esPredefinida"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-text p-button-danger p-button-sm"
                @click="confirmDelete(data)"
                :disabled="data.esPredefinida"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Dialog para crear/editar -->
    <Dialog
      v-model:visible="showDialog"
      :header="editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'"
      :modal="true"
      :style="{ width: '400px' }"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <InputText
            v-model="form.nombre"
            class="w-full"
            placeholder="Nombre de la categoría"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Icono</label>
          <Dropdown
            v-model="form.icono"
            :options="iconOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          >
            <template #value="{ value }">
              <div class="flex items-center">
                <i :class="`pi ${value}`" class="mr-2"></i>
                {{ iconOptions.find(i => i.value === value)?.label }}
              </div>
            </template>
            <template #option="{ option }">
              <div class="flex items-center">
                <i :class="`pi ${option.value}`" class="mr-2"></i>
                {{ option.label }}
              </div>
            </template>
          </Dropdown>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <div class="flex items-center gap-3">
            <ColorPicker v-model="form.color" />
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: `#${form.color}` }"
            >
              <i :class="`pi ${form.icono}`" class="text-white"></i>
            </div>
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
            :label="editingCategoria ? 'Guardar' : 'Crear'"
            :loading="createMutation.isPending.value || updateMutation.isPending.value"
          />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<style scoped>
:deep(.p-inputtext),
:deep(.p-dropdown) {
  width: 100%;
}
</style>
