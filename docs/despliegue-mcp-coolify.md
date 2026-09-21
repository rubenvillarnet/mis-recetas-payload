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

### 1. Acceso a la base de datos de Coolify desde tu máquina

Una de estas dos opciones:

- En Coolify, en el recurso de PostgreSQL, activa temporalmente **Make it publicly available** (publica un puerto en la IP del servidor).
- Túnel SSH al servidor, si el puerto de Postgres ya está publicado solo en `localhost` del host:

  ```bash
  ssh -N -L 5433:127.0.0.1:<puerto_postgres_en_el_servidor> usuario@tu-servidor
  ```

### 2. Aplicar el esquema arrancando el proyecto en local contra esa base de datos

Solo se sobreescribe `DATABASE_URL`; el resto de variables sigue saliendo de tu `.env`:

```bash
DATABASE_URL="postgresql://usuario:pass@127.0.0.1:5433/nombre_bd" npm run dev
```

Espera a ver `✓ Pulling schema from database...` en la consola y a que cargue la home; luego `Ctrl+C`.

Comprobación opcional: con el servidor arrancado, abre `http://localhost:3000/admin`. En la barra lateral debe aparecer el grupo **MCP → API Keys**, leyendo ya de la base de datos de producción.

Como el cambio es solo aditivo, drizzle no pide confirmación de pérdida de datos.

### 3. Cerrar el acceso

Desactiva **Make it publicly available** o cierra el túnel SSH.

### 4. Desplegar

```bash
git push origin main
```

Coolify construye y despliega como siempre. No hacen falta variables de entorno nuevas (el servidor MCP no usa Redis: SSE está desactivado por defecto).

### 5. En producción

1. Entra en `https://tu-dominio/admin` → **MCP → API Keys** y crea la clave real: usuario asociado, permisos y **Generar nueva clave API**. Las claves creadas en local no sirven: viven en la otra base de datos.
2. Comprueba que el endpoint responde:

   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" -X POST https://tu-dominio/api/mcp
   ```

   Debe devolver `401` (el servidor está vivo, pero falta la clave).

3. Conecta el cliente apuntando a `https://tu-dominio/api/mcp` con la clave nueva (ver la sección "Servidor MCP" del [README](../README.md#servidor-mcp-agentes-de-ia)).

## Para el futuro

Esto mismo volverá a pasar con cualquier cambio de colecciones. La solución "de libro" es pasar a migraciones: `payload migrate:create` en local y `payload migrate` al arrancar el contenedor, con `prodMigrations` en `payload.config.ts`.

Pega inicial: ambas bases de datos están marcadas como "creadas por push" (fila `dev`, batch `-1`, en `payload_migrations`), así que primero habría que sentar una migración base sin ejecutarla. Hasta entonces, el paso 2 de esta guía es suficiente.
