# NestJS Challenge

Suite de ejemplos con NestJS + TypeScript + Prisma enfocada en autenticación JWT (con refresh), CRUD de entidades relacionadas, validación robusta, manejo de errores estructurado y documentación con Swagger.

Guía rápida (Windows)
- Requisitos: Node 20+ y npm
- Instalar dependencias:
  - npm install
- Variables de entorno:
  - Copia .env.example o crea .env con las variables listadas abajo
- Migraciones de base de datos (Prisma):
  - npx prisma migrate dev
  - npx prisma generate
- Desarrollo :
  - npm run start:dev
- Documentación Swagger (según configuración):
  - http://localhost:3000/api/docs

Variables de entorno
- DATABASE_URL=postgresql://user:pass@localhost:5432/dbname?schema=public
- API_STAGE=development
- API_HOST=localhost
- API_PORT=3000
- CORS_ORIGIN=http://localhost:3000
- ENABLE_SWAGGER=true
- JWT_SECRET=your-strong-secret
- JWT_EXPIRES_IN=3600s             # acepta número (segundos) o formato con unidad ("1h", "3600s")
- JWT_REFRESH_EXPIRES_IN=604800    # segundos (ej. 7 días) o "7d"

Tecnologías principales
- NestJS (Fastify adapter)
- TypeScript
- Prisma (ORM) + PostgreSQL
- Passport JWT (@nestjs/jwt, passport-jwt)
- class-validator / class-transformer
- Swagger (OpenAPI) para documentación

Características implementadas

1) Autenticación y autorización (JWT + Refresh)
- Registro y login con hashing de contraseñas (bcrypt)
- Access token (Bearer) y refresh token con rotación (jti)
- Revocación de refresh tokens y auditoría (IP / User-Agent)
- Guard/Strategy JWT para proteger rutas (users, articles)

Endpoints Auth
- POST /auth/register → { token, tokenType: 'bearer', expiresIn, refreshToken }
- POST /auth/login → { token, tokenType: 'bearer', expiresIn, refreshToken }
- POST /auth/refresh → rota refresh y devuelve nuevos tokens
- POST /auth/logout → revoca el refresh provisto (204 No Content)

2) CRUD completo de 2 entidades relacionadas
- User (soft delete con deletedAt)
- Article (relación con User como author)
- Listados con filtros y paginación
- Paginado Condicional en GET de Article
- Ownership en actualización/eliminación de Article (403 Forbidden si no es el autor)

3) Validación de datos
- DTOs con class-validator
- ValidationPipe global (whitelist, transform, forbidNonWhitelisted)

4) Manejo de errores estructurado
- Filtro global AllExceptionsFilter
- Respuestas uniformes con statusCode, message, error, path, method, timestamp
- Mapeo de errores de Prisma (P2002=409, P2025=404, etc.)

5) Documentación con Swagger
- Esquema Bearer Auth para probar endpoints protegidos
- Decoradores por endpoint (errores comunes y específicos)
- Decorador custom para paginación
- DTOs inferidos con ayuda del plugin de Swagger en Nest


Soft delete:
- Users marcados con deletedAt no aparecen en listados por defecto
- Unicidad de email recomendada con índice parcial (email único solo cuando deletedAt IS NULL)

Estructura del proyecto

```text
/nest-challenge
├── prisma
│  ├── schema.prisma
│  └── migrations
├── src
│  ├── app.module.ts
│  ├── main.ts
│  ├── common
│  │  ├── decorators
│  │  │  └── api-error-responses.decorator.ts
│  │  ├── dto
│  │  │  ├── paginated-result.dto.ts
│  │  │  └── pagination-options.dto.ts
│  │  ├── filters
│  │  │  └── all-exceptions.filter.ts
│  │  └── utils
│  │     └── calculate-pagination.ts
│  ├── database
│  │  ├── prisma.module.ts
│  │  └── prisma.service.ts
│  ├── auth
│  │  ├── auth.controller.ts
│  │  ├── auth.module.ts
│  │  ├── auth.service.ts
│  │  ├── dto
│  │  │  ├── request
│  │  │  │  ├── login.dto.ts
│  │  │  │  └── refresh-token.dto.ts
│  │  │  └── response
│  │  │     └── token-response.dto.ts
│  │  ├── guards
│  │  │  └── jwt-auth.guard.ts
│  │  └── strategies
│  │     └── jwt.strategy.ts
│  ├── user
│  │  ├── user.controller.ts
│  │  ├── user.module.ts
│  │  ├── user.service.ts
│  │  └── dto
│  │     ├── request
│  │     │  ├── create-user.dto.ts
│  │     │  ├── update-user.dto.ts
│  │     │  └── user-filter-options.dto.ts
│  │     └── response
│  │        └── user.dto.ts
│  └── article
│     ├── article.controller.ts
│     ├── article.module.ts
│     ├── article.service.ts
│     └── dto
│        ├── request
│        │  ├── create-article.dto.ts
│        │  ├── update-article.dto.ts
│        │  └── article-filter-options.dto.ts
│        └── response
│           └── article.dto.ts
├── .env
├── package.json
└── tsconfig.json
```

Notas de seguridad
- JWT_SECRET deberia ser una clave segura
- Asegura una correcta conexión de tu base de datos con DATABASE_URL
- Usa variables de entorno distintas por entorno (dev/test/prod)

Licencia
- Uso educativo/demostrativo.
