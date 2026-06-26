# Migraciones con Prisma

Guía práctica para manejar el schema y las migraciones en este proyecto
(**Prisma 7 + pnpm + Postgres en Docker**).

> **Regla de oro:** para cualquier cambio de schema que vaya al repo, usá
> **siempre `migrate dev`**. Nunca mezcles `db push` con migraciones (ver
> [Zona peligrosa](#zona-peligrosa-solo-dev)).

## Antes de empezar

```bash
docker compose up -d        # levanta Postgres (contenedor chatbot-db)
pnpm prisma generate        # regenera el cliente
```

`generate` es **obligatorio tras cada checkout fresco**: el cliente se genera en
`src/generated/prisma`, que está gitignored. Sin esto, nada compila ni corre.

## Día a día (desarrollo)

```bash
# 1. Editás prisma/schema.prisma
# 2. Creás + aplicás la migración (también regenera el cliente):
pnpm prisma migrate dev --name descripcion_corta
```

Es el comando central. El `--name` es solo una etiqueta descriptiva; Prisma le
antepone el timestamp en el nombre de la carpeta.

Para regenerar solo el cliente, sin tocar migraciones:

```bash
pnpm prisma generate
```

## Producción / CI / otra máquina

```bash
pnpm prisma migrate deploy   # aplica las migraciones pendientes
```

`deploy` **no** crea migraciones nuevas, **no** genera SQL y **no** borra datos:
solo corre lo que ya existe en `prisma/migrations/`. Es lo que va en el pipeline.

> `deploy` **no** ejecuta `generate`. En CI tenés que llamar a `pnpm prisma generate`
> por separado.

## Inspeccionar el estado

```bash
pnpm prisma migrate status   # aplicadas / pendientes / drift
pnpm prisma studio           # GUI para ver y editar datos
```

## Arreglar la historia sin borrar datos

Si la base ya tiene un cambio pero falta el registro de la migración, en vez de
resetear:

```bash
pnpm prisma migrate resolve --applied    <nombre_migracion>   # marcar como aplicada
pnpm prisma migrate resolve --rolled-back <nombre_migracion>  # marcar una fallida como revertida
```

Esto solo modifica la tabla `_prisma_migrations`; no toca los datos.

## Zona peligrosa (solo dev)

```bash
pnpm prisma migrate reset    # DROP de todo + re-aplica migraciones desde cero
```

**Borra TODOS los datos de la base.** Úsalo únicamente en desarrollo.

- Prisma **bloquea este comando cuando lo ejecuta un agente** (Claude Code) y exige
  consentimiento explícito vía la variable `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION`.
  Si lo corrés **vos** en tu terminal, no hay bloqueo.

## El comando que NO conviene usar acá

```bash
pnpm prisma db push          # aplica el schema directo a la base SIN crear migración
```

Mezclar `db push` con `migrate dev` **desincroniza la historia de migraciones**: la
base queda con cambios que ningún archivo de migración registra, y un
`migrate deploy` en limpio produce un schema distinto. Reservalo solo para
prototipado en una base descartable; nunca para algo que vaya al repo.

## Resumen

| Querés…                              | Comando                          |
| ------------------------------------ | -------------------------------- |
| Cambiar el schema en dev             | `migrate dev --name x`           |
| Aplicar migraciones en prod/CI       | `migrate deploy` (+ `generate`)  |
| Regenerar el cliente                 | `generate`                       |
| Ver el estado                        | `migrate status`                 |
| Arreglar historia sin perder datos   | `migrate resolve`                |
| Empezar de cero (dev)                | `migrate reset` ⚠️               |
| Prototipar en base descartable       | `db push` (evitar acá)           |

## Nota sobre Prisma 7

Varios flags viejos cambiaron o desaparecieron (`--skip-seed` en `reset` ya no
existe; `migrate diff` cambió de flags y exige `datasource.shadowDatabaseUrl` en
`prisma.config.ts`). Si un comando tira `unknown option`, consultá los flags
actuales con:

```bash
pnpm prisma <comando> --help
```
