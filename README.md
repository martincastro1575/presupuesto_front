# Planificador de Gastos - Frontend

Frontend desarrollado con Vue 3 para la gestion de gastos personales.

## Requisitos Previos

- [Node.js](https://nodejs.org/) 18 o superior
- [npm](https://www.npmjs.com/) o [pnpm](https://pnpm.io/)

## Tecnologias

| Tecnologia | Version | Descripcion |
|------------|---------|-------------|
| Vue 3 | 3.4+ | Framework principal |
| Vite | 5.3+ | Build tool |
| PrimeVue | 4.2+ | Libreria de componentes UI |
| Tailwind CSS | 4.0+ | Framework CSS utilitario |
| Vue Router | 4.4+ | Enrutamiento SPA |
| Pinia | 2.1+ | Gestion de estado |
| TanStack Query | 5.17+ | Gestion de datos async |
| Axios | 1.6+ | Cliente HTTP |
| Chart.js | 4.4+ | Graficos |

## Instalacion

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd PlanificadorGastos-Frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

## Scripts Disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera build de produccion |
| `npm run preview` | Previsualiza build de produccion |

## Estructura del Proyecto

```
src/
├── assets/             # Archivos estaticos (CSS, imagenes)
├── components/         # Componentes reutilizables
├── composables/        # Composables de Vue (hooks)
├── layout/             # Componentes de layout (Sidebar, Topbar, etc.)
├── pages/              # Paginas de la aplicacion
│   ├── auth/           # Paginas de autenticacion
│   │   ├── LoginPage.vue
│   │   └── RegisterPage.vue
│   ├── DashboardPage.vue
│   ├── GastosPage.vue
│   ├── IngresosPage.vue
│   ├── CategoriasPage.vue
│   ├── PresupuestosPage.vue
│   └── ReportesPage.vue
├── router/             # Configuracion de rutas
├── services/           # Servicios de API
│   ├── api.js          # Configuracion de Axios
│   ├── auth.service.js
│   ├── categorias.service.js
│   ├── gastos.service.js
│   ├── ingresos.service.js
│   ├── presupuestos.service.js
│   └── reportes.service.js
├── stores/             # Stores de Pinia
├── utils/              # Utilidades
├── App.vue             # Componente raiz
└── main.js             # Punto de entrada
```

## Paginas

| Ruta | Pagina | Descripcion |
|------|--------|-------------|
| `/` | Dashboard | Resumen con ingresos, gastos, balance y graficos de evolucion |
| `/gastos` | Gastos | CRUD de gastos con filtro por categoria |
| `/ingresos` | Ingresos | CRUD de ingresos con filtro por categoria |
| `/categorias` | Categorias | Gestion de categorias (Gasto, Ingreso o Ambos) |
| `/presupuestos` | Presupuestos | Configuracion de presupuestos por categoria |
| `/reportes` | Reportes | Graficos comparativos de ingresos/gastos por categoria y evolucion |
| `/auth/login` | Login | Inicio de sesion |
| `/auth/register` | Registro | Registro de usuario |

## Configuracion

### Variables de Entorno

Crear archivo `.env` en la raiz del proyecto:

```env
VITE_API_URL=http://localhost:5000/api
```

### API Backend

El frontend se conecta al backend en `http://localhost:5000/api` por defecto.
Para produccion, configurar la variable `VITE_API_URL`.

## Autenticacion

La aplicacion usa JWT para autenticacion:

1. El usuario inicia sesion en `/auth/login`
2. El token se almacena en localStorage
3. Axios interceptor agrega el token a cada request
4. Las rutas protegidas redirigen a login si no hay token

## Servicios de API

### Gastos
```javascript
import { gastosService } from '@/services/gastos.service'

// Obtener todos los gastos
const gastos = await gastosService.getAll()

// Crear gasto
await gastosService.create({ monto: 100, categoriaId: 1, fecha: '2024-01-15' })

// Actualizar gasto
await gastosService.update(id, { monto: 150 })

// Eliminar gasto
await gastosService.delete(id)
```

### Ingresos
```javascript
import { ingresosService } from '@/services/ingresos.service'

// Obtener todos los ingresos
const ingresos = await ingresosService.getAll()

// Crear ingreso
await ingresosService.create({
  monto: 50000,
  categoriaId: 100, // Categoria de tipo Ingreso (Sueldo)
  concepto: 'Sueldo',
  fecha: '2024-01-05'
})

// Obtener por periodo
const ingresosEnero = await ingresosService.getByPeriod(2024, 1)
```

### Reportes
```javascript
import { reportesService } from '@/services/reportes.service'

// Resumen mensual (incluye totalIngresos, totalGastado, balance)
const resumen = await reportesService.getResumenMensual(2024, 1)

// Evolucion mensual (incluye ingresos y gastos por mes)
const evolucion = await reportesService.getEvolucionMensual(12)

// Gastos agrupados por categoria
const gastosPorCategoria = await reportesService.getGastosPorCategoria(2024, 1)

// Ingresos agrupados por categoria
const ingresosPorCategoria = await reportesService.getIngresosPorCategoria(2024, 1)
```

### Categorias
```javascript
import { categoriasService, TipoCategoria } from '@/services/categorias.service'

// Obtener categorias para gastos (tipo Gasto o Ambos)
const categoriasGasto = await categoriasService.getForGastos()

// Obtener categorias para ingresos (tipo Ingreso o Ambos)
const categoriasIngreso = await categoriasService.getForIngresos()

// Obtener todas las categorias
const todas = await categoriasService.getAll()
```

## Componentes PrimeVue Utilizados

- DataTable - Tablas con paginacion y ordenamiento
- Dialog - Modales
- Button - Botones con iconos
- InputText, InputNumber - Campos de formulario
- Dropdown, MultiSelect - Selectores
- Calendar - Selector de fecha
- Toast - Notificaciones
- ConfirmDialog - Confirmaciones

## Despliegue

### Vercel

El proyecto incluye `vercel.json` para despliegue en Vercel:

```bash
npm run build
vercel deploy
```

### Otros

Para otros proveedores, ejecutar:

```bash
npm run build
```

Los archivos generados estaran en la carpeta `dist/`.

## Licencia

Proyecto personal - Uso libre
