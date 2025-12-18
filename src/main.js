import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import Aura from '@primeuix/themes/aura'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

import App from './App.vue'
import router from './router'

// Estilos
import '@/assets/tailwind.css'
import '@/assets/styles.scss'

// Crear aplicación
const app = createApp(App)

// Pinia (State Management)
const pinia = createPinia()
app.use(pinia)

// Vue Router
app.use(router)

// Vue Query (Data Fetching)
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutos
        retry: 1,
        refetchOnWindowFocus: false
      }
    }
  }
})

// PrimeVue con tema Aura
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.app-dark'
    }
  }
})
app.use(ToastService)
app.use(ConfirmationService)

// Montar aplicación
app.mount('#app')
