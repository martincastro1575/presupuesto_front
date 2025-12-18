<script setup>
import { useLayout } from '@/layout/composables/layout';
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import Menu from 'primevue/menu';

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
const authStore = useAuthStore();
const menu = ref();

const menuItems = ref([
    {
        label: 'Cerrar Sesión',
        icon: 'pi pi-sign-out',
        command: () => authStore.logout()
    }
]);

const toggleUserMenu = (event) => {
    menu.value.toggle(event);
};
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <i class="pi pi-wallet text-primary text-2xl mr-2"></i>
                <span>Planificador de Gastos</span>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
            </div>

            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'p-anchored-overlay-enter-active', leaveToClass: 'hidden', leaveActiveClass: 'p-anchored-overlay-leave-active', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action" @click="toggleUserMenu">
                        <i class="pi pi-user"></i>
                        <span>{{ authStore.user?.nombre || 'Usuario' }}</span>
                    </button>
                    <Menu ref="menu" :model="menuItems" :popup="true" />
                </div>
            </div>
        </div>
    </div>
</template>
