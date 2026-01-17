import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import AppLayout from '@/layout/AppLayout.vue'

const routes = [
  {
    path: '/auth/login',
    name: 'login',
    component: () => import('@/pages/auth/LoginPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/auth/register',
    name: 'register',
    component: () => import('@/pages/auth/RegisterPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/pages/DashboardPage.vue')
      },
      {
        path: 'gastos',
        name: 'gastos',
        component: () => import('@/pages/GastosPage.vue')
      },
      {
        path: 'ingresos',
        name: 'ingresos',
        component: () => import('@/pages/IngresosPage.vue')
      },
      {
        path: 'categorias',
        name: 'categorias',
        component: () => import('@/pages/CategoriasPage.vue')
      },
      {
        path: 'presupuestos',
        name: 'presupuestos',
        component: () => import('@/pages/PresupuestosPage.vue')
      },
      {
        path: 'limites-categorias',
        name: 'limites-categorias',
        component: () => import('@/pages/LimitesCategoriasPage.vue')
      },
      {
        path: 'reportes',
        name: 'reportes',
        component: () => import('@/pages/ReportesPage.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
