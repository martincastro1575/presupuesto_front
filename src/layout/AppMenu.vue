<script setup>
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Inicio',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }
        ]
    },
    {
        label: 'Gestion',
        items: [
            { label: 'Gastos', icon: 'pi pi-fw pi-credit-card', to: '/gastos' },
            { label: 'Ingresos', icon: 'pi pi-fw pi-wallet', to: '/ingresos' },
            { label: 'Categorias', icon: 'pi pi-fw pi-tags', to: '/categorias' },
            { label: 'Presupuestos', icon: 'pi pi-fw pi-chart-pie', to: '/presupuestos' },
            { label: 'Límites', icon: 'pi pi-fw pi-gauge', to: '/limites-categorias' }
        ]
    },
    {
        label: 'Análisis',
        items: [
            { label: 'Reportes', icon: 'pi pi-fw pi-chart-bar', to: '/reportes' }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
