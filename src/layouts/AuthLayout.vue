<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">
          <i class="pi pi-wallet mr-2"></i>
          Planificador de Gastos
        </h1>
        <p class="text-primary-100">Controla tus finanzas personales</p>
      </div>
      <div class="bg-white rounded-xl shadow-2xl p-8">
        <RouterView />
      </div>
    </div>
  </div>
</template>
