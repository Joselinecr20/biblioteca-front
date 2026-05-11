# Sistema de Gestión de Biblioteca Universitaria

Frontend móvil/web construido con **Ionic 7 + Angular 17** que consume la API REST en Spring Boot.

---

## Requisitos previos

| Herramienta | Versión recomendada |
|-------------|---------------------|
| Node.js     | 18 o superior       |
| npm         | 9 o superior        |
| Ionic CLI   | 7.x                 |
| Angular CLI | 17.x                |

```bash
npm install -g @ionic/cli @angular/cli
```

---

## Instalación

```bash
# Desde la carpeta del proyecto
npm install
```

---

## Ejecutar en modo desarrollo

```bash
ionic serve
```

La app estará disponible en `http://localhost:8100`.

> La API REST de Spring Boot debe estar corriendo en `http://localhost:8080`.

---

## Estructura del proyecto

```
src/app/
├── core/
│   ├── guards/
│   │   └── auth.guard.ts          — Guard funcional por rol
│   ├── interceptors/
│   │   └── jwt.interceptor.ts     — Inyección automática del token JWT
│   ├── models/
│   │   └── index.ts               — Interfaces TypeScript de todas las entidades
│   └── services/
│       ├── auth.service.ts
│       ├── libro.service.ts
│       ├── usuario.service.ts
│       ├── reserva.service.ts
│       ├── prestamo.service.ts
│       └── multa.service.ts
├── pages/
│   ├── login/
│   ├── dashboard-admin/
│   ├── dashboard-bibliotecario/
│   ├── dashboard-estudiante/
│   ├── libros/
│   │   ├── lista-libros/
│   │   ├── detalle-libro/
│   │   └── form-libro/
│   ├── usuarios/
│   │   ├── lista-usuarios/
│   │   └── form-usuario/
│   ├── reservas/
│   │   ├── lista-reservas/
│   │   └── mis-reservas/
│   ├── prestamos/
│   │   ├── lista-prestamos/
│   │   └── mis-prestamos/
│   └── multas/
│       ├── lista-multas/
│       └── mis-multas/
└── shared/
    └── components/
        ├── header/
        └── menu/
```

---

## Roles y acceso

| Rol            | Dashboard              | Módulos disponibles                          |
|----------------|------------------------|----------------------------------------------|
| `admin`        | `/dashboard-admin`     | Libros, Usuarios, Reservas, Préstamos, Multas |
| `bibliotecario`| `/dashboard-bibliotecario` | Libros, Usuarios, Reservas, Préstamos, Multas |
| `estudiante`   | `/dashboard-estudiante`| Catálogo, Mis Reservas, Mis Préstamos, Mis Multas |

---

## Autenticación

- El login consume `POST /auth/login` y recibe un JWT.
- El token se guarda en `localStorage` con la clave `token`.
- El interceptor `jwt.interceptor.ts` inyecta el header `Authorization: Bearer {token}` en todas las peticiones excepto `/auth/login` y `/auth/registro`.
- El guard `auth.guard.ts` protege las rutas por rol.

---

## Configuración de la API

Edita `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'   // ← URL de tu API Spring Boot
};
```

---

## Paleta de colores

| Variable CSS          | Color      | Uso                      |
|-----------------------|------------|--------------------------|
| `--color-primary`     | `#2F5D50`  | Verde oscuro — Primario  |
| `--color-secondary`   | `#7A5C3E`  | Café — Secundario        |
| `--color-accent`      | `#C59B6D`  | Dorado — Acento          |
| `--color-background`  | `#F4EFE6`  | Crema — Fondo global     |
| `--color-dark`        | `#2B2B2B`  | Casi negro — Texto       |

---

## Build para producción

```bash
ionic build --prod
```

## Build para Android (Capacitor)

```bash
ionic build
npx cap sync
npx cap open android
```

## Build para iOS (Capacitor)

```bash
ionic build
npx cap sync
npx cap open ios
```

---

## Endpoints de la API consumidos

| Método | URL                         | Descripción                   |
|--------|-----------------------------|-------------------------------|
| POST   | `/auth/login`               | Iniciar sesión                |
| POST   | `/auth/registro`            | Registrar usuario             |
| GET    | `/libros`                   | Listar libros                 |
| GET    | `/libros/{id}`              | Detalle de libro              |
| POST   | `/libros`                   | Crear libro                   |
| PUT    | `/libros/{id}`              | Actualizar libro              |
| DELETE | `/libros/{id}`              | Eliminar libro                |
| GET    | `/usuarios`                 | Listar usuarios               |
| POST   | `/usuarios`                 | Crear usuario                 |
| PUT    | `/usuarios/{id}`            | Actualizar usuario            |
| GET    | `/reservas`                 | Listar todas las reservas     |
| GET    | `/reservas/mis`             | Mis reservas (estudiante)     |
| POST   | `/reservas`                 | Crear reserva                 |
| PUT    | `/reservas/{id}/aprobar`    | Aprobar reserva               |
| PUT    | `/reservas/{id}/rechazar`   | Rechazar reserva              |
| DELETE | `/reservas/{id}`            | Cancelar reserva              |
| GET    | `/prestamos`                | Listar todos los préstamos    |
| GET    | `/prestamos/mis`            | Mis préstamos (estudiante)    |
| POST   | `/prestamos/{id}/devolver`  | Registrar devolución          |
| GET    | `/multas`                   | Listar todas las multas       |
| GET    | `/multas/mis`               | Mis multas (estudiante)       |
| PUT    | `/multas/{id}/pagar`        | Registrar pago de multa       |
