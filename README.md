# eval-angular-lukas-martinez

Catálogo de películas construido con Angular 21 (standalone components, Signals y Control Flow) como prueba práctica de nivel intermedio.

## Stack

- Angular 21 (standalone, sin NgModules)
- json-server + json-server-auth como backend simulado (persistencia en `db.json`)
- RxJS / Signals para el estado
- Vitest para pruebas unitarias

## Requisitos previos

- Node.js 20+
- npm 10+

## Instalación

```bash
npm install
```

## Cómo correr el proyecto

El backend (json-server-auth) y el frontend deben correr al mismo tiempo. Hay un script que levanta ambos:

```bash
npm run dev
```

Esto inicia:

- La API simulada en `http://localhost:3000` (`npm run api`), servida desde `db.json` con las reglas de permisos de `routes.json`.
- La app Angular en `http://localhost:4200` (`npm start`).

Si preferís levantarlos por separado, en dos terminales:

```bash
npm run api    # http://localhost:3000
npm start      # http://localhost:4200
```

La URL de la API se configura en `src/environments/environment.ts` (desarrollo) y `environment.prod.ts` (producción). Por defecto apunta a `http://localhost:3000`.

## Credencial de prueba

El login consume `POST /login` de json-server-auth contra los usuarios definidos en `db.json`.

| Email | Contraseña |
| --- | --- |
| `admin@evaluacion.com` | `Admin123!` |

Con esa cuenta se obtiene un token JWT que se guarda en `localStorage` (clave `mv_access_grant`) y habilita el acceso al panel de administración (`/admin`).

## Scripts disponibles

```bash
npm start       # Levanta la app en modo desarrollo
npm run build   # Build de producción en dist/
npm test        # Pruebas unitarias con Vitest
npm run api     # Levanta json-server-auth (puerto 3000)
npm run dev     # Levanta API y app juntos (concurrently)
```

## Estructura del proyecto

Organización por características (features), con carpetas dedicadas al núcleo y a lo compartido:

```
src/app/
├── core/                    # Transversal a toda la app
│   ├── guards/              # backstageGuard: protege el panel de administración
│   ├── interceptors/        # auth.interceptor: adjunta el token a las peticiones
│   ├── models/               # Interfaces y tipos del dominio (Movie, AppUser, ...)
│   ├── services/             # MovieService, AuthService, SearchHistoryService, UiStateService
│   └── validators/           # blockFutureYear: validador personalizado
├── features/
│   ├── admin/                # CRUD de películas (listado, alta/edición con formulario reactivo)
│   ├── auth/                 # Login
│   └── movies/                # Listado (buscador + historial) y detalle de película
├── layout/                    # Shell de la app: navegación, sesión, spotlightTally
└── shared/
    ├── components/            # app-reel-card (Content Projection), página 404
    └── pipes/                 # Pipes de fecha/año, calificación y texto de título
```

## Funcionalidades principales

- **Listado y detalle de películas**: consumidos vía `HttpClient` con interfaces tipadas, mostrando estados de carga y error.
- **Buscador por título**: con debounce (`SEARCH_DEBOUNCE_MS`, 375 ms) e historial persistido en `localStorage` bajo la clave `mv_search_log_v3` (máximo 5 entradas).
- **Formulario reactivo de películas**: `FormBuilder`, validaciones estándar y personalizada (`blockFutureYear`, evita años futuros), `FormArray` para el reparto (`castLineup`) y selectores dependientes (el género filtra las clasificaciones de edad disponibles).
- **Autenticación**: login contra json-server-auth, interceptor que adjunta el token JWT, guard (`backstageGuard`) que protege `/admin` y mantiene la sesión al recargar, logout y UI condicionada al estado de autenticación.
- **CRUD de películas y carga de póster**: alta, edición, listado y baja (`discardMovie`) reutilizando el mismo formulario, con previsualización de la imagen del póster.
- **Angular 19+**: `@if` / `@for` (con `track`) / `@switch`, un bloque `@defer` en el detalle de película, señales (`layoutMode`, `spotlightTally`) y un `effect()` de auditoría en el layout.

## Notas

- La ruta comodín (`**`) redirige a `/lost-reel`, la página de "no encontrado".
- El backend es simulado; los datos y usuarios de prueba se reinician al restaurar `db.json` desde control de versiones.
