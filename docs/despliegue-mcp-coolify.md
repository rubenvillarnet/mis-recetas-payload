# Desplegar el servidor MCP en Coolify

Checklist para poner en producción el servidor MCP (`@payloadcms/plugin-mcp`) cuando la base de datos de producción es un PostgreSQL alojado en Coolify, distinto del de desarrollo.

## Por qué hace falta hacer algo a mano

El plugin cambia el esquema de la base de datos:

- Tabla nueva `payload_mcp_api_keys`.
- Columna nueva `payload_mcp_api_keys_id` en `payload_locked_documents_rels` y en `payload_preferences_rels` (tablas internas de Payload).

`@payloadcms/db-postgres` sincroniza el esquema (*push*) al arrancar **solo cuando `NODE_ENV !== 'production'`**: lo hace `npm run dev` y cualquier `payload run script`. En el contenedor de Coolify `NODE_ENV=production`, así que el despliegue no crea nada por sí solo.

## Hazlo antes de desplegar, no después

No es solo que `/api/mcp` fallaría. La app nueva incluye la columna `payload_mcp_api_keys_id` en sus consultas a `payload_locked_documents_rels`, así que **el admin dejaría de poder abrir o editar recetas** (`column "payload_mcp_api_keys_id" does not exist`) hasta que el esquema estuviera al día.

Aplicar el esquema antes es inocuo para la app que está desplegada: los cambios son puramente aditivos.

## Pasos

### 1. Aplicar el esquema a la base de datos de producción

La forma más directa, y la que no expone la base de datos a Internet: ejecutar [mcp-schema.sql](mcp-schema.sql) con `psql` desde dentro del propio contenedor.

En Coolify, en el recurso de PostgreSQL, abre **Terminal** (panel lateral, sección *Observe & troubleshoot*) y lanza `psql` con los datos de la sección **Credentials** (usuario, base de datos y contraseña):

```bash
psql -U <usuario> -d <basededatos>
```

Pega dentro el contenido de `mcp-schema.sql`. El script es idempotente: crea la tabla `payload_mcp_api_keys`, añade la columna `payload_mcp_api_keys_id` a `payload_locked_documents_rels` y `payload_preferences_rels`, y se puede ejecutar varias veces sin efectos adicionales. Termina en `COMMIT`.

### 2. Alternativa: sincronizar el esquema desde local

Si prefieres que sea Payload quien genere el esquema, necesitas acceso a la base de datos desde tu máquina:

- En Coolify, en **Public access**, pon `Public through TCP proxy` y guarda. Si el ajuste vuelve a `Private` al recargar, el puerto elegido está ocupado en el host: prueba con otro (5433, por ejemplo).
- O abre un túnel SSH al servidor.

Con acceso, arranca el proyecto en local apuntando a esa base (solo se sobreescribe `DATABASE_URL`; el resto de variables sale de tu `.env`):

```bash
DATABASE_URL="postgresql://usuario:pass@127.0.0.1:5433/nombre_bd" npm run dev
```

Espera a ver `✓ Pulling schema from database...`, corta con `Ctrl+C` y **vuelve a dejar el acceso en `Private`**. Mientras esté público, la base está escuchando en Internet y solo la protege la contraseña.

### 3. Desplegar

```bash
git push origin main
```

Coolify construye y despliega como siempre. Si no se dispara solo, revisa en la aplicación la sección **Deployments** y la configuración de *Automatic Deployment* / el webhook de GitHub, o lanza un **Redeploy** manual. No hacen falta variables de entorno nuevas (el servidor MCP no usa Redis: SSE está desactivado por defecto).

### 4. Comprobar

Una llamada con una clave inventada distingue si el esquema está aplicado:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://tu-dominio/api/mcp -H "Authorization: Bearer loquesea"
```

- `500` → falta el esquema.
- `401` → el esquema está aplicado y el servidor rechaza la clave inválida, que es lo correcto.

### 5. Crear la API key

1. Entra en `https://tu-dominio/admin` → **MCP → API Keys** y crea la clave real: usuario asociado, permisos y **Generar nueva clave API**. Las claves creadas en local no sirven: viven en la otra base de datos.
   Al guardar, vuelve a abrir la clave y confirma que los checkboxes siguen marcados: a veces no se guardan a la primera.

2. Conecta el cliente apuntando a `https://tu-dominio/api/mcp` con la clave nueva (ver la sección "Servidor MCP" del [README](../README.md#servidor-mcp-agentes-de-ia)).

## Para el futuro

Esto mismo volverá a pasar con cualquier cambio de colecciones. La solución "de libro" es pasar a migraciones: `payload migrate:create` en local y `payload migrate` al arrancar el contenedor, con `prodMigrations` en `payload.config.ts`.

Pega inicial: ambas bases de datos están marcadas como "creadas por push" (fila `dev`, batch `-1`, en `payload_migrations`), así que primero habría que sentar una migración base sin ejecutarla. Hasta entonces, el paso 1 de esta guía es suficiente.
