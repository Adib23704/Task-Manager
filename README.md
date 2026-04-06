# Task Manager

A task management system with role-based access control (Admin/User) and audit logging, built as a fullstack application.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), Tailwind CSS v4 |
| Backend | NestJS 11, Prisma 7 ORM |
| Database | PostgreSQL 17 |
| Auth | JWT (via Passport.js) |
| Linting/Formatting | Biome |
| Containerization | Docker Compose |

## Quick Start

### Prerequisites

- Docker & Docker Compose

### Run

```bash
docker compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000

### Demo Credentials

| Role  | Email              | Password    |
|-------|--------------------|-------------|
| Admin | admin@example.com  | password123 |
| User  | user@example.com   | password123 |

## Features

**Admin:**
- Full CRUD on tasks (create, edit, delete)
- Assign/unassign tasks to users
- Manage users (create, edit, delete)
- View paginated audit logs

**User:**
- View assigned tasks
- Update task status (Pending / In Progress / Done)

**Audit Logging:**
- Tracks task creation, updates, deletion, assignment changes, and status changes
- Stores actor, action type, target entity, and before/after details (JSONB)
- Logs persist even after the related task is deleted (nullable foreign key with `SET NULL`)

## Architecture Decisions

- **Monorepo without tooling overhead** - Backend and frontend live in separate folders with their own `package.json`. No Turborepo/Nx complexity for a project of this size. Types are kept minimal and duplicated where needed rather than adding a shared package.

- **Prisma 7 with `@prisma/adapter-pg`** - Uses the latest Prisma driver adapter pattern instead of the legacy built-in connection. The database URL is configured via `prisma.config.ts` rather than the deprecated `datasource.url` in the schema.

- **`ConfigModule` (global) for environment variables** - `@nestjs/config` with `isGlobal: true` ensures `ConfigService` is available across all modules, including async factory registrations like `JwtModule.registerAsync()`. This avoids the common NestJS pitfall where `process.env` is read before `.env` is loaded.

- **Audit logs decoupled from tasks** - `targetEntityId` is nullable with `onDelete: SetNull`, so deleting a task doesn't cascade-delete its audit history. The task title is stored in the log's `details` JSON for reference after deletion.

- **Role-based guards via decorators** - A custom `@Roles()` decorator + `RolesGuard` keeps authorization declarative at the controller level rather than scattering role checks through service logic.

## Database Schema

```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│    users      │      │    tasks      │      │  audit_logs   │
├───────────────┤      ├───────────────┤      ├───────────────┤
│ id (PK)       │ <--- │ assignedUser  │      │ id (PK)       │
│ email (unique)│      │ Id (FK,null)  │      │ actorId (FK)  │ --> users
│ password      │      │ id (PK)       │ <--- │ targetEntity  │
│ name          │      │ title         │      │ Id (FK,null)  │
│ role (enum)   │      │ description   │      │ action        │
│ createdAt     │      │ status (enum) │      │ details (JSON)│
│ updatedAt     │      │ createdAt     │      │ createdAt     │
└───────────────┘      │ updatedAt     │      └───────────────┘
                       └───────────────┘
```

**Enums:** `Role` (ADMIN, USER) | `TaskStatus` (PENDING, PROCESSING, DONE)

## API Endpoints

| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| POST | `/api/auth/login` | Login, returns JWT | Public |
| GET | `/api/auth/me` | Current user profile | Authenticated |
| GET | `/api/tasks` | All tasks (admin) or assigned tasks (user) | Authenticated |
| POST | `/api/tasks` | Create task | Admin |
| PATCH | `/api/tasks/:id` | Update task (admin: all fields, user: status only) | Authenticated |
| DELETE | `/api/tasks/:id` | Delete task | Admin |
| PATCH | `/api/tasks/:id/assign` | Assign task | Admin |
| GET | `/api/users` | List users | Admin |
| POST | `/api/users` | Create user | Admin |
| PATCH | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |
| GET | `/api/audit-logs` | Paginated audit logs | Admin |

## Project Structure

```
├── backend/                 NestJS API
│   ├── src/
│   │   ├── auth/            JWT strategy, login, guards, @Roles() decorator
│   │   ├── users/           User CRUD (service, controller, DTOs)
│   │   ├── tasks/           Task CRUD + audit log integration
│   │   ├── audit-logs/      Audit log service (log + paginated list)
│   │   └── prisma/          PrismaService (global module)
│   ├── prisma/
│   │   ├── schema.prisma    Data model (User, Task, AuditLog)
│   │   ├── seed.ts          Seeds demo accounts
│   │   └── migrations/      SQL migrations
│   ├── prisma.config.ts     Prisma 7 config (datasource, seed command)
│   ├── Dockerfile
│   └── entrypoint.sh        Runs migrations + seed + starts server
├── frontend/                Next.js 16 (App Router)
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/       Login page with demo credential buttons
│   │   │   ├── dashboard/   Admin task table / User task list
│   │   │   ├── users/       User management (admin only)
│   │   │   └── audit-logs/  Paginated audit log viewer (admin only)
│   │   ├── components/      Sidebar, TaskTable, TaskModal, StatusBadge, etc.
│   │   ├── lib/             API fetch wrapper, AuthContext + useAuth hook
│   │   └── types/           Shared TypeScript interfaces
│   └── Dockerfile
├── docker-compose.yml       PostgreSQL + Backend + Frontend
└── README.md
```

## Local Development

```bash
# Backend
cd backend
cp .env.example .env    # set DATABASE_URL and JWT_SECRET
npm install
npm run db:generate
npm run db:migrate
npm run dev             # http://localhost:4000

# Frontend (in another terminal)
cd frontend
cp .env.example .env    # set NEXT_PUBLIC_API_URL
npm install
npm run dev             # http://localhost:3000
```
