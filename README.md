# Complaint Management System

A backend-focused business management system for collecting, tracking, responding to, and analyzing customer complaints and feedback. It is designed for small businesses where complaints arrive through WhatsApp, phone, social media, in-person communication, or paper and become difficult to track.

## Features

- Customers register, submit complaints, and check the status of their own complaints
- Employees see the complaints assigned to them, update status, and reply in a message thread
- Managers create employees, assign complaints, reset passwords, and view reports
- Reports show complaint counts by status and by type, to spot repeated problems
- JWT login with three roles: `CUSTOMER`, `EMPLOYEE`, `MANAGER`

## Tech stack

NestJS 12, TypeScript, PostgreSQL, Prisma 8 (release candidate, contract client), JWT (`@nestjs/jwt`), bcrypt, class-validator, Vitest.

## Getting started

Requires Node.js 24 and a PostgreSQL database.

```bash
cd backend
npm install
```

Create `backend/.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/complaint_management"
JWT_SECRET="a-long-random-string"
MANAGER_EMAIL="owner@yourbusiness.com"
MANAGER_PASSWORD="a-strong-password"
# optional
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

Database: create a PostgreSQL database named `complaint_management` with the tables described in `backend/prisma/contract.prisma` (`users`, `customers`, `employees`, `complaint_types`, `complaints`, `complaint_employees`, `messages`).

Create the first manager, then start the server:

```bash
npm run seed
npm run start:dev
```

The API runs on `http://localhost:3000`.

## Roles

| Role | How an account is created | Can do |
|---|---|---|
| CUSTOMER | Self-registration (`POST /auth/register`) | Submit and view their own complaints, message on them |
| EMPLOYEE | Created by a manager (`POST /employees`) | Work on assigned complaints, update status, reply |
| MANAGER | Created only by the seed script | Everything, plus reports and user management |

No API route can create a manager. If the manager forgets their password, set `MANAGER_RESET_PASSWORD=true` in `.env` and run `npm run seed` once, then remove the setting.

## API

Send the token from login as `Authorization: Bearer <token>`. Request bodies are validated, and bad input returns `400`.

### Auth

| Method | Route | Who | Body |
|---|---|---|---|
| POST | `/auth/register` | Anyone | `name`, `contact`, `email`, `password` (min 8) |
| POST | `/auth/login` | Anyone | `email`, `password` |
| POST | `/auth/change-password` | Any logged-in user | `currentPassword`, `newPassword` (min 8) |

### Complaints

| Method | Route | Who |
|---|---|---|
| POST | `/complaints` | Customer (`typeId`, `complaintDetail`) |
| GET | `/complaints/mine` | Customer: own complaints |
| GET | `/complaints/assigned` | Employee: complaints assigned to them |
| GET | `/complaints` | Employee, Manager |
| GET | `/complaints/:id` | Employee, Manager |
| PATCH | `/complaints/:id/status` | Employee, Manager (`OPEN`, `IN_PROGRESS`, `RESOLVED`) |
| POST | `/complaints/:id/assign` | Manager (`employeeId`) |
| DELETE | `/complaints/:id/assign/:employeeId` | Manager |
| DELETE | `/complaints/:id` | Manager |

### Messages

| Method | Route | Who |
|---|---|---|
| POST | `/complaints/:id/messages` | The owning customer, or an employee (`messageText`) |
| GET | `/complaints/:id/messages` | The owning customer, employees, managers |

A customer can only access their own complaints. The sender of a message is taken from the login token, never from the request body.

### People and reports (Manager only)

| Method | Route | Description |
|---|---|---|
| POST | `/employees` | Create an employee (`name`, `phone`, `title`, `email`, `password`) |
| GET | `/employees` | List employees |
| GET | `/customers` | List customers |
| GET | `/users` | List accounts (no password data) |
| POST | `/users/:id/reset-password` | Set a new password (`newPassword`) |
| GET | `/reports/summary` | Totals and counts per status |
| GET | `/reports/by-type` | Complaints per type, most frequent first |

## Tests

```bash
npm test          # unit tests
npm run test:e2e  # end-to-end smoke test
```

Unit tests cover the role guard, login, report calculations, and message ownership rules.