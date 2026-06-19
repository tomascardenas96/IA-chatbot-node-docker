# Chatbot Node

Backend para un chatbot construido con **Node.js**, **Express 5**, **TypeScript** y
**Prisma 7** sobre **PostgreSQL**.

> ⚠️ **Estado del proyecto:** en etapa inicial. Por ahora el servidor expone una
> ruta `/health` y el esquema de base de datos (`User`, `Conversation`, `Message`)
> está definido y migrado. La lógica del chatbot todavía no está implementada.

---

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Requisitos previos](#requisitos-previos)
- [Instalación y puesta en marcha](#instalación-y-puesta-en-marcha)
- [Scripts disponibles](#scripts-disponibles)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Convenciones de código](#convenciones-de-código)

---

## Stack tecnológico

| Categoría        | Tecnología                          |
| ---------------- | ----------------------------------- |
| Runtime          | Node.js (ESM, módulos `NodeNext`)   |
| Lenguaje         | TypeScript (modo `strict`)          |
| Framework HTTP   | Express 5                           |
| ORM              | Prisma 7 (con driver adapter `pg`)  |
| Base de datos    | PostgreSQL 16                       |
| Gestor de paquetes | pnpm                              |
| Calidad de código | ESLint + Prettier                  |
| Dev runtime      | tsx (ejecución/recarga de TS)       |

---

## Requisitos previos

- **Node.js** (versión compatible con ESM `NodeNext`)
- **pnpm** — gestor de paquetes obligatorio (declarado en `devEngines`)
- **Docker** y **Docker Compose** — para levantar PostgreSQL localmente

---

## Instalación y puesta en marcha

```bash
# 1. Instalar dependencias
pnpm install

# 2. Crear el archivo de entorno a partir del ejemplo
cp .env.example .env

# 3. Levantar la base de datos PostgreSQL (Docker)
docker compose up -d

# 4. Generar el cliente de Prisma (¡imprescindible tras cada checkout!)
pnpm prisma generate

# 5. Aplicar las migraciones a la base de datos
pnpm prisma migrate dev

# 6. Arrancar el servidor en modo desarrollo
pnpm dev
```

El servidor queda disponible en **http://localhost:3000**. Podés comprobar que
está vivo con:

```bash
curl http://localhost:3000/health
# { "status": "ok" }
```

> 💡 **Importante:** el cliente de Prisma se genera en `src/generated/prisma`, que
> está en `.gitignore`. Por eso el paso `pnpm prisma generate` es **obligatorio**
> tras clonar el repo: sin él, el código no compila ni arranca.

---

## Scripts disponibles

| Comando        | Descripción                                                     |
| -------------- | --------------------------------------------------------------- |
| `pnpm dev`     | Levanta el servidor con recarga en caliente (`tsx watch`)       |
| `pnpm build`   | Verifica tipos y compila TypeScript a `dist/` con `tsc`         |
| `pnpm lint`    | Ejecuta ESLint sobre `src`                                      |
| `pnpm format`  | Formatea `src` con Prettier                                     |

> Aún no hay suite de tests configurada; el script `test` es un placeholder.

---

## Variables de entorno

Definidas en `.env` (ver `.env.example`):

| Variable       | Descripción                                  |
| -------------- | -------------------------------------------- |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL              |

Valor por defecto para desarrollo (coincide con las credenciales de
`docker-compose.yaml`):

```
DATABASE_URL=postgresql://chatbot:chatbot_dev_password@localhost:5432/chatbot?schema=public
```

---

## Base de datos

PostgreSQL 16 se levanta mediante `docker-compose.yaml` (servicio `db`, puerto
`5432`, con volumen persistente `chatbot-db-data`).

### Modelos

El esquema (`prisma/schema.prisma`) define tres modelos con IDs de tipo UUID:

- **`User`** — usuario con `email` único, `password` y un campo `role`
  (enum `Role`: `user` | `admin`).
- **`Conversation`** — una conversación que agrupa mensajes.
- **`Message`** — mensaje individual (`role`, `content`) asociado a una
  `Conversation`. Al borrar una conversación se eliminan sus mensajes en cascada.

### Notas sobre Prisma 7

- La conexión está **dividida**: el bloque `datasource` de `schema.prisma` no
  contiene `url`. La CLI la lee desde `prisma.config.ts` (variable `DATABASE_URL`),
  y en tiempo de ejecución el cliente la recibe a través del driver adapter
  `@prisma/adapter-pg` (ver `src/database/client.ts`).
- Las migraciones se guardan en `prisma/migrations/`.

Comandos útiles de Prisma:

```bash
pnpm prisma generate          # Regenerar el cliente
pnpm prisma migrate dev       # Crear/aplicar migraciones en desarrollo
pnpm prisma studio            # Explorar los datos en el navegador
```

---

## Estructura del proyecto

```
.
├── src/
│   ├── server.ts             # Punto de entrada: app Express + ruta /health
│   ├── app.ts                # (placeholder)
│   ├── config/               # (placeholders: env, ai.config, database, prisma)
│   ├── database/
│   │   └── client.ts         # Instancia compartida de PrismaClient
│   └── generated/prisma/     # Cliente Prisma generado (ignorado por git)
├── prisma/
│   ├── schema.prisma         # Definición de modelos
│   └── migrations/           # Historial de migraciones
├── prisma.config.ts          # Configuración de Prisma 7 (datasource/migraciones)
├── docker-compose.yaml       # PostgreSQL 16 para desarrollo
├── eslint.config.mjs         # Configuración de ESLint
└── tsconfig.json             # Configuración de TypeScript
```

> El punto de entrada real es `src/server.ts`. Los archivos de `src/config/` y
> `src/app.ts` son placeholders que marcan la estructura prevista.

---

## Convenciones de código

- **ESM en todo el proyecto** (`"type": "module"`, `NodeNext`): los imports
  relativos deben incluir la extensión `.js` aunque el archivo fuente sea `.ts`.
- El cliente de Prisma se importa siempre desde `src/database/client.ts`
  (export `prisma`); no instanciar `PrismaClient` en otros sitios.
- ESLint marca `console` como *warning* y los `no-unused-vars` como *error*,
  salvo que el nombre empiece con `_` (convención para argumentos no usados, p. ej.
  `_req`, `_res`).
