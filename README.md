# En mi casa se cocina así

Recetario familiar. Panel de administración con [Payload CMS](https://payloadcms.com) y frontend con [Next.js](https://nextjs.org) (App Router), en un único proyecto.

## Stack

- **Backend/admin**: Payload CMS 3.x (panel en español)
- **Frontend**: Next.js App Router + React + Tailwind CSS v4
- **Base de datos**: PostgreSQL, alojada en [Neon](https://neon.tech)
- **Imágenes**: object storage compatible con S3, en [Cloudflare R2](https://developers.cloudflare.com/r2/)
- **Despliegue**: Docker (imagen `standalone` de Next.js)

## Estructura del proyecto

```
src/
├── collections/          # Recipes, Categories, Media, Users
├── fields/                # slugField (slug único autogenerado)
├── hooks/                 # generateUniqueSlug
├── lib/                   # cliente de Payload y queries del frontend
├── mcp/                   # servidor MCP: plugin y tools personalizadas
├── components/            # componentes del frontend
├── payload.config.ts
└── app/
    ├── (payload)/          # admin + API de Payload (generado por Payload)
    └── (frontend)/         # home, /categoria/[slug], /buscar, /receta/[slug]

scripts/
└── migrate.ts             # script de migración/seed (ver más abajo)

migration-data/             # datos de origen para la migración (no versionado, ver más abajo)
```

## Requisitos previos

- Node.js 20 o superior
- Una base de datos Postgres (recomendado: un proyecto en [Neon.tech](https://neon.tech), tiene capa gratuita)
- Un bucket de [Cloudflare R2](https://dash.cloudflare.com) con un token de API (Object Read & Write) y acceso público (dominio propio o `*.r2.dev`)

## Puesta en marcha local

```bash
npm install
cp .env.example .env
```

Rellena `.env` con tus credenciales reales (ver [Variables de entorno](#variables-de-entorno)).

```bash
npm run dev
```

Abre `http://localhost:3000`. La primera vez, entra en `http://localhost:3000/admin` y crea tu usuario administrador desde el propio navegador (Payload lo pide automáticamente cuando la colección de usuarios está vacía).

## Variables de entorno

| Variable | Descripción |
|---|---|
| `PAYLOAD_SECRET` | Clave secreta de Payload (cualquier cadena aleatoria larga) |
| `DATABASE_URL` | Cadena de conexión de Postgres (Neon) |
| `S3_BUCKET` | Nombre del bucket de R2 |
| `S3_ENDPOINT` | Endpoint de R2, `https://<account_id>.r2.cloudflarestorage.com` |
| `S3_REGION` | `auto` para R2 |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Credenciales del token de API de R2 |
| `S3_PUBLIC_HOSTNAME` | Dominio público del bucket (propio o `*.r2.dev`) |
| `NEXT_PUBLIC_SERVER_URL` | URL pública del sitio (`http://localhost:3000` en local) |

Ver [.env.example](.env.example) para la plantilla completa.

## Scripts disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run devsafe` | Igual que `dev`, pero borrando antes la caché `.next` |
| `npm run build` | Build de producción (necesita `DATABASE_URL` accesible: genera las páginas de recetas/categorías de forma estática) |
| `npm run start` | Sirve el build de producción |
| `npm run generate:types` | Regenera `src/payload-types.ts` a partir de las colecciones |
| `npm run generate:importmap` | Regenera el *import map* del admin (necesario tras añadir/quitar colecciones o componentes custom) |
| `npm run migrate:seed` | Ejecuta el script de migración de datos (ver abajo) |
| `npm run lint` | ESLint |

## Migración de datos de origen

El contenido original (JSON + fotos de la web estática previa) vive en `migration-data/` (`data/*.json` + `images/*`), una carpeta **no versionada** en git — se conserva solo en local por si hace falta re-ejecutar la migración.

`scripts/migrate.ts` lee esos ficheros, crea las categorías, sube las imágenes a R2 y crea las recetas en Postgres. Es idempotente (se puede volver a ejecutar sin duplicar nada) y soporta modo simulación:

```bash
DRY_RUN=true npm run migrate:seed   # solo informa, no escribe nada
npm run migrate:seed                # migración real
```

## Colecciones del admin

- **Recetas** — título, categoría, ingredientes, pasos, foto, nota de la cocina, y un checkbox "Destacada" para la sección "Para hoy mismo" de la home.
- **Categorías** — nombre, icono, orden de aparición. Se pueden añadir/editar sin tocar código.
- **Imágenes** — fotos de las recetas (alojadas en R2, con tamaños derivados: thumbnail/card/hero).
- **Usuarios** — acceso al panel de admin. El primer usuario se crea desde `/admin` la primera vez; a partir de ahí, solo un usuario ya registrado puede dar de alta a los demás.
- **API Keys (grupo MCP)** — claves para que un agente de IA use el [servidor MCP](#servidor-mcp-agentes-de-ia). Cada clave va ligada a un usuario y tiene un checkbox por operación y por tool.

## Servidor MCP (agentes de IA)

El proyecto expone un servidor [MCP](https://modelcontextprotocol.io) (Streamable HTTP) en `POST /api/mcp`, montado con el plugin oficial [`@payloadcms/plugin-mcp`](https://payloadcms.com/docs/plugins/mcp), para que un agente (Claude Code, Codex, Hermes…) pueda consultar el recetario y dar de alta o corregir recetas. La configuración vive en `src/mcp/plugin.ts` y las tools propias en `src/mcp/tools.ts`.

### Herramientas disponibles

| Tool | Qué hace |
|---|---|
| `searchRecipes` | Busca por título o ingrediente (la misma búsqueda que `/buscar`) y devuelve un resumen de cada receta |
| `findRecipes` | Consulta recetas con `where`/`sort`/`limit` (sintaxis de Payload) o una receta completa por `id` |
| `createRecipes` / `updateRecipes` | Crea o edita recetas. El slug se genera solo; la categoría va por `id` y la foto por `id` de media |
| `findCategories` | Lista las categorías (para obtener el `id` que necesita una receta) |
| `findMedia` | Lista las fotos ya subidas |
| `uploadRecipePhoto` | Descarga una imagen desde una URL pública, la sube a R2 como media y, si se indica `recipeId`, la asigna a esa receta |

Borrar recetas queda fuera del servidor MCP a propósito: solo se puede hacer desde el admin.

### Crear una API key

1. En el admin, **MCP → API Keys → Crear nuevo**.
2. Elige el usuario al que se asocia (las operaciones se ejecutan como ese usuario), ponle una etiqueta y marca qué operaciones y tools puede usar esa clave. Se pueden cambiar en cualquier momento; el servidor lo aplica en la siguiente petición.
3. Pulsa **Generar nueva clave API** en la barra lateral, guarda y copia la clave. Solo se ve desde el admin.

Toda petición sin cabecera `Authorization: Bearer <clave>` válida recibe un `401`.

### Conectar un cliente

Guarda la clave en una variable de entorno (por ejemplo `RECETAS_MCP_KEY`) y sustituye `http://localhost:3000` por el dominio real si conectas con producción.

**Claude Code**

```bash
claude mcp add --transport http recetas http://localhost:3000/api/mcp --header "Authorization: Bearer $RECETAS_MCP_KEY"
```

**Codex** (`~/.codex/config.toml`)

```toml
[mcp_servers.recetas]
url = "http://localhost:3000/api/mcp"
bearer_token_env_var = "RECETAS_MCP_KEY"
```

**Hermes** (`~/.hermes/config.yaml`, con `RECETAS_MCP_KEY` definida en `~/.hermes/.env`)

```yaml
mcp_servers:
  recetas:
    url: "http://localhost:3000/api/mcp"
    headers:
      Authorization: "Bearer ${RECETAS_MCP_KEY}"
```

### Base de datos

El plugin añade la tabla `payload_mcp_api_keys`. En desarrollo se crea sola al arrancar `npm run dev` (el adaptador de Postgres sincroniza el esquema); en producción no hay sincronización automática, así que si la base de datos de producción no es la misma que la de desarrollo hay que crearla antes de desplegar (arrancando `dev` contra ella una vez o generando una migración con `npm run payload -- migrate:create`).

## Despliegue con Docker

El build de Next.js genera las páginas de recetas de forma estática, así que necesita conectividad real a Postgres (y a R2) **en tiempo de build**, no solo en runtime:

```bash
docker build \
  --build-arg DATABASE_URL="postgresql://..." \
  --build-arg PAYLOAD_SECRET="..." \
  --build-arg S3_BUCKET="..." \
  --build-arg S3_ENDPOINT="..." \
  --build-arg S3_REGION="auto" \
  --build-arg S3_ACCESS_KEY_ID="..." \
  --build-arg S3_SECRET_ACCESS_KEY="..." \
  --build-arg S3_PUBLIC_HOSTNAME="..." \
  -t mis-recetas-payload .

docker run -d -p 3000:3000 --env-file .env mis-recetas-payload
```

`docker-compose.yml` hace lo mismo leyendo las variables de un `.env` en la raíz (`docker compose up -d --build`).
