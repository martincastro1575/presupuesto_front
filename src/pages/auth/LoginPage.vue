<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Toast from 'primevue/toast'

const authStore = useAuthStore()
const toast = useToast()

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    await authStore.login({ email: email.value, password: password.value })
    toast.add({
      severity: 'success',
      summary: 'Bienvenido',
      detail: 'Has iniciado sesión correctamente',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: authStore.error || 'Credenciales inválidas',
      life: 5000
    })
  }
}
</script>

<template>
  <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
    <div class="flex flex-col items-center justify-center">
      <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
        <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
          <div class="text-center mb-8">
            <i class="pi pi-wallet text-primary mb-4" style="font-size: 3rem;"></i>
            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Planificador de Gastos</div>
            <span class="text-muted-color font-medium">Inicia sesión para continuar</span>
          </div>

          <form @submit.prevent="handleLogin">
            <label for="email" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
            <InputText id="email" type="email" placeholder="tu@email.com" class="w-full md:w-[30rem] mb-8" v-model="email" required />

            <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Contraseña</label>
            <Password id="password" v-model="password" placeholder="Tu contraseña" :toggleMask="true" class="mb-8" fluid :feedback="false" required></Password>

            <Button type="submit" label="Iniciar Sesión" class="w-full" :loading="authStore.loading" icon="pi pi-sign-in"></Button>
          </form>

          <div class="mt-8 text-center">
            <span class="text-muted-color">¿No tienes cuenta? </span>
            <RouterLink to="/auth/register" class="font-medium text-primary cursor-pointer">Regístrate aquí</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Toast />
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
