# AI Usage

Used Claude Code (AI coding assistant) throughout the project.

## What I used AI for

1. **Scaffolding assistance** - Generated boilerplate files (NestJS module/controller/service skeletons, Prisma schema, Docker setup). I reviewed and adjusted the output.

2. **Debugging** - JWT secret mismatch between `JwtModule.register()` and `JwtStrategy`, Prisma 7 migration from the deprecated `@prisma/client` pattern to `@prisma/adapter-pg`, audit log cascade deletion issue.

## What I decided and built myself

- Tech stack choices (Prisma over TypeORM, Tailwind, Biome over ESLint)
- Monorepo structure (separate folders, no Turborepo/Nx overhead)
- Database schema design (nullable audit log FK so logs persist after task deletion)
- DTOs, guards, CRUD service logic, and React components
- Role-based guard pattern using decorators
- Audit log granularity (separate actions for status vs. assignment vs. content changes)
- Single PATCH endpoint approach for task updates
