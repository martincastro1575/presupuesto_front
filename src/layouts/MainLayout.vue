<script setup>
import { ref, computed } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Menu from 'primevue/menu'

const authStore = useAuthStore()
const route = useRoute()
const userMenu = ref()

const menuItems = [
  { label: 'Dashboard', icon: 'pi pi-home', to: '/' },
  { label: 'Gastos', icon: 'pi pi-credit-card', to: '/gastos' },
  { label: 'Categorías', icon: 'pi pi-tags', to: '/categorias' },
  { label: 'Presupuestos', icon: 'pi pi-chart-pie', to: '/presupuestos' },
  { label: 'Reportes', icon: 'pi pi-chart-bar', to: '/reportes' }
]

const userMenuItems = ref([
  {
    label: 'Cerrar Sesión',
    icon: 'pi pi-sign-out',
    command: () => authStore.logout()
  }
])

const toggleUserMenu = (event) => {
  userMenu.value.toggle(event)
}

const isActiveRoute = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-gray-200">
        <i class="pi pi-wallet text-primary-500 text-2xl mr-3"></i>
        <span class="font-bold text-lg text-gray-800">Planificador</span>
      </div>

      <!-- Navigation -->
      <nav class="p-4">
        <ul class="space-y-1">
          <li v-for="item in menuItems" :key="item.to">
            <RouterLink
              :to="item.to"
              class="flex items-center px-4 py-3 rounded-lg transition-colors"
              :class="isActiveRoute(item.to)
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-600 hover:bg-gray-100'"
            >
              <i :class="item.icon" class="mr-3"></i>
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="ml-64">
      <!-- Header -->
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
        <div class="flex items-center gap-4">
          <span class="text-gray-600">{{ authStore.user?.nombre }}</span>
          <Avatar
            :label="authStore.user?.nombre?.charAt(0)?.toUpperCase()"
            class="bg-primary-500 text-white cursor-pointer"
            shape="circle"
            @click="toggleUserMenu"
          />
          <Menu ref="userMenu" :model="userMenuItems" :popup="true" />
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
