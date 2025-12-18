<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'

const authStore = useAuthStore()
const toast = useToast()

const nombre = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const passwordsMatch = computed(() => {
  return password.value === confirmPassword.value
})

const handleRegister = async () => {
  if (!passwordsMatch.value) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Las contraseñas no coinciden',
      life: 3000
    })
    return
  }

  try {
    await authStore.register({
      nombre: nombre.value,
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value
    })
    toast.add({
      severity: 'success',
      summary: 'Cuenta Creada',
      detail: 'Tu cuenta ha sido creada exitosamente',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: authStore.error || 'Error al crear la cuenta',
      life: 5000
    })
  }
}
</script>

<template>
  <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
    <div class="flex flex-col items-center justify-center">
      <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
        <div class="w-full bg-surface-0 dark:bg-surface-900 py-12 px-8 sm:px-20" style="border-radius: 53px">
          <div class="text-center mb-8">
            <i class="pi pi-wallet text-primary mb-4" style="font-size: 3rem;"></i>
            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Crear Cuenta</div>
            <span class="text-muted-color font-medium">Regístrate para comenzar</span>
          </div>

          <form @submit.prevent="handleRegister">
            <label for="nombre" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Nombre</label>
            <InputText id="nombre" type="text" placeholder="Tu nombre" class="w-full md:w-[30rem] mb-6" v-model="nombre" required />

            <label for="email" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
            <InputText id="email" type="email" placeholder="tu@email.com" class="w-full md:w-[30rem] mb-6" v-model="email" required />

            <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Contraseña</label>
            <Password id="password" v-model="password" placeholder="Mínimo 8 caracteres" :toggleMask="true" class="mb-2" fluid required>
              <template #footer>
                <ul class="pl-2 mt-2 text-muted-color text-sm">
                  <li>• Mínimo 8 caracteres</li>
                  <li>• Al menos una mayúscula</li>
                  <li>• Al menos una minúscula</li>
                  <li>• Al menos un número</li>
                </ul>
              </template>
            </Password>

            <label for="confirmPassword" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2 mt-6">Confirmar Contraseña</label>
            <Password id="confirmPassword" v-model="confirmPassword" placeholder="Repite tu contraseña" :toggleMask="true" class="mb-2" fluid :feedback="false" required :invalid="confirmPassword && !passwordsMatch"></Password>
            <small v-if="confirmPassword && !passwordsMatch" class="text-red-500">Las contraseñas no coinciden</small>

            <Button type="submit" label="Crear Cuenta" class="w-full mt-6" :loading="authStore.loading" icon="pi pi-user-plus" :disabled="!passwordsMatch && confirmPassword"></Button>
          </form>

          <div class="mt-8 text-center">
            <span class="text-muted-color">¿Ya tienes cuenta? </span>
            <RouterLink to="/auth/login" class="font-medium text-primary cursor-pointer">Inicia sesión aquí</RouterLink>
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
