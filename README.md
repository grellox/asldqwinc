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

## Imágenes y vídeo

Los archivos viven en `public/images/` y se enchufan desde `src/data/media.ts`. Cada ranura es independiente, así que un archivo suelto ya sirve. `asset()` resuelve la ruta contra la base del despliegue, de modo que funciona igual en local y en GitHub Pages.

| Ranura en `media.ts` | Archivo | Dónde aparece |
|---|---|---|
| `heroPhoto` | `collage-madre.webp` | Fondo del hero, a sangre y espejado, bajo un degradado de tinta |
| `cityPhoto` | `hero-arequipa.webp` | Lámina ancha que cierra la landing |
| `loginPhoto` | `login-arequipa.webp` | Tras el panel oscuro de `/ingresar` |
| `bandTexture` | `sillar-texture.webp` | Losa de sillar de la banda «¿Eres abogado colegiado?» |
| — | `abogados/<id>.webp` | Retrato del abogado en tarjeta y perfil |

El hero estira su foto a todo el ancho, así que conviene que `heroPhoto` tenga 1600 px de ancho o más; por debajo de eso se nota blanda en pantallas grandes.

Los retratos son opcionales: el campo `photo` del abogado en `src/data/lawyers.ts` apunta al archivo, y quien no lo tenga cae en el mosaico de iniciales.

La ranura `walkthroughVideo` sigue vacía. Si le pones un MP4, la sección «Así se ve por dentro» cambia el recorrido interactivo por un reproductor de vídeo.

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
| `/madre/abogados` | Marketplace de abogados (vista de la madre) |
| `/madre/abogados/:id` | Perfil del abogado desde la vista de la madre |
| `/directorio` | Marketplace público (`/abogados` redirige aquí) |
| `/directorio/:id` | Perfil público del abogado (reseñas, hitos, trayectoria) |
| `/abogado` | Centro de mando del abogado |
| `/abogado/adquisicion` | Adquisición (leads + pizarra pública) |
| `/abogado/validacion` | Validación IA |
| `*` | 404 |

Desde la barra lateral (o el menú inferior en móvil) puedes cambiar entre **Público · Madre · Abogado** sin iniciar sesión, para explorar toda la demo.

## Notas

- No hay claves de API ni llamadas a servicios externos (salvo Google Fonts).
- El asistente IA, el CEJ, los pagos y el lector de PDF están simulados con datos y retardos predefinidos.
- **Flujo de contratación**: la madre solicita asesoría desde el marketplace → el abogado envía un presupuesto (precio por hito, número de hitos, mensaje y vigencia) → la madre lo acepta o lo rechaza → al aceptar se crea el caso y el primer hito queda en custodia.
  - Si la solicitud va a **Dra. Carmen Valdivia** (la abogada con la que se inicia sesión en el rol *abogado*), entra como lead en `/abogado/adquisicion` y el presupuesto se envía a mano desde ahí.
  - Los demás abogados no tienen bandeja en la demo, así que su presupuesto llega solo, unos segundos después de la solicitud.
  - El caso contratado aparece en «Mis solicitudes» de la madre y, si es de Carmen Valdivia, también en sus casos activos, hitos y custodia del centro de mando.
- Si pulsas «Solicitar asesoría» sin sesión iniciada, la demo recuerda a qué abogado querías escribir y, tras ingresar como madre, vuelve a su perfil con el formulario abierto.
- El progreso (documentos, chat, solicitudes, etc.) se guarda en `localStorage` del navegador, por lo que persiste entre recargas pero es local a cada dispositivo.
