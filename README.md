# Syloop — Demo pública

**Devolvemos el tiempo a la justicia.**

Syloop es una plataforma legaltech peruana (B2B2C) para procesos de pensión de alimentos en Arequipa. Conecta a madres con abogados verificados del Colegio de Abogados de Arequipa (CAA), usando IA siempre con supervisión humana.

Esta es una **demo pública estática**: no hay backend, todos los datos son ficticios y viven en el navegador (`localStorage`).

> Demo con datos ficticios · no ingreses información real.

## Stack

- React 18 + Vite + TypeScript
- Tailwind CSS 3
- React Router v6 (`HashRouter`, para que funcione en GitHub Pages)
- Zustand (estado + persistencia en `localStorage`)
- `lucide-react` (íconos) · `jspdf` (generación de PDF en el navegador)

## Correr en local

```bash
pnpm install
pnpm dev
```

Abre `http://localhost:5173/syloop/`.

## Build de producción

```bash
pnpm build
pnpm preview
```

## Publicar en GitHub Pages

El repositorio incluye `.github/workflows/deploy.yml`, que en cada push a `main`:

1. Instala dependencias con pnpm y ejecuta `pnpm build`.
2. Sube `dist/` como artefacto de Pages.
3. Publica el sitio con `actions/deploy-pages`.

Para activarlo en un repositorio nuevo:

1. Ve a **Settings → Pages**.
2. En **Source**, elige **GitHub Actions**.
3. Haz push a `main`; el workflow se encarga del resto.

La URL final queda en `https://<usuario>.github.io/<repositorio>/`.

Si cambias el nombre del repositorio, actualiza `base` en `vite.config.ts` para que coincida (`/<repositorio>/`).

## Pantallas

| Ruta | Pantalla |
|---|---|
| `/` | Landing |
| `/ingresar` | Login y registro (madre / abogado) |
| `/madre/panel` | Panel de la madre |
| `/madre/ruta` | Mi ruta judicial |
| `/madre/asistente` | Asistente jurídico IA + simulador de conciliación |
| `/madre/expediente` | Expediente digital |
| `/madre/gastos` | Gastos y pensiones |
| `/abogados` | Marketplace de abogados |
| `/abogado` | Centro de mando del abogado |
| `/abogado/adquisicion` | Adquisición (leads + pizarra pública) |
| `/abogado/validacion` | Validación IA |
| `*` | 404 |

Desde la barra lateral (o el menú inferior en móvil) puedes cambiar entre **Público · Madre · Abogado** sin iniciar sesión, para explorar toda la demo.

## Notas

- No hay claves de API ni llamadas a servicios externos (salvo Google Fonts).
- El asistente IA, el CEJ, los pagos y el lector de PDF están simulados con datos y retardos predefinidos.
- El progreso (documentos, chat, solicitudes, etc.) se guarda en `localStorage` del navegador, por lo que persiste entre recargas pero es local a cada dispositivo.
