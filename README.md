# Resource Planning System (RPS)

> **PT. Accelist** - Internal Application untuk Manajemen Sumber Daya Manusia dan Proyek

---

## 📋 Daftar Isi

1. [Apa itu RPS?](#apa-itu-rps)
2. [Tech Stack](#tech-stack)
3. [Fitur Utama per Role](#fitur-utama-per-role)
4. [Persyaratan Sistem](#persyaratan-sistem)
5. [Setup Cepat](#setup-cepat)
6. [Struktur Project](#struktur-project)
7. [Arsitektur Sistem](#arsitektur-sistem)
8. [Panduan Kontribusi](#panduan-kontribusi)
9. [Referensi Dokumentasi](#referensi-dokumentasi)

---

## Apa itu RPS?

**Resource Planning System (RPS)** adalah sistem manajemen internal PT Accelist yang didesain untuk:

- 📊 **Manajemen Proyek** — Buat, kelola, dan track status proyek dari awal hingga selesai
- 👥 **Manajemen Tim** — Assign tim dengan komposisi role yang tepat sesuai kebutuhan proyek
- 📈 **Planning Sumber Daya** — Rekomendasi employee berdasarkan availability dan pengalaman
- 📋 **Tracking Kontrak** — Monitor kontrak karyawan dan request perpanjangan otomatis
- 🔔 **Notifikasi Real-time** — Alert untuk perubahan project, assignment, dan approvals

Sistem ini membantu PM, GM, Marketing, dan HR untuk berkolaborasi dengan lebih efisien dalam mengelola sumber daya manusia dan proyek yang kompleks.

---

## Tech Stack

### Backend

| Component         | Technology            | Alasan                                            |
| ----------------- | --------------------- | ------------------------------------------------- |
| **Framework**     | .NET 10               | Performance tinggi, type safety, enterprise-ready |
| **Language**      | C#                    | Strongly-typed, modern async/await support        |
| **Database**      | PostgreSQL            | Reliable, powerful, open-source relational DB     |
| **ORM**           | Entity Framework Core | Code-first migrations, async support              |
| **Architecture**  | CQRS + Clean Arch     | Separation of concerns, scalable, maintainable    |
| **Mediator**      | MediatR               | Decouple controllers dari business logic          |
| **Validation**    | FluentValidation      | Type-safe, reusable validation rules              |
| **Auth**          | JWT Bearer Token      | Stateless, microservice-friendly                  |
| **Password Hash** | BCrypt.Net-Next       | Secure password hashing dengan salt               |

### Frontend

| Component      | Technology   | Alasan                                         |
| -------------- | ------------ | ---------------------------------------------- |
| **Framework**  | React 18+    | Component-based, large ecosystem, popular      |
| **Language**   | TypeScript   | Type safety, better DX, catch errors early     |
| **Build**      | Vite         | Fast bundling, hot reload, modern tooling      |
| **Styling**    | Tailwind CSS | Utility-first, responsive, highly customizable |
| **Components** | shadcn/ui    | Pre-built accessible components                |
| **State**      | Context API  | Built-in Redux-like state management           |
| **HTTP**       | Fetch API    | Modern, no dependencies needed                 |
| **Toasts**     | Sonner       | Beautiful non-intrusive notifications          |

---

## Fitur Utama per Role

### 🎨 Marketing

- ✅ Buat project baru
- ✅ Lihat semua project (filter, pagination)
- ✅ Lihat detail project, progress, timeline
- ⚫ Tidak bisa assign tim (ada GM)
- ⚫ Tidak bisa approve extension

### 👨‍💼 General Manager (GM)

- ✅ Lihat semua project
- ✅ Assign tim ke project dengan komposisi role
- ✅ Monitor availability employee sebelum assign
- ✅ Edit project (rescheduled, timeline adjustment)
- ✅ Request contract extension untuk karyawan
- ⚫ Tidak bisa process extension (ada HR)

### 👨‍💻 Project Manager (PM)

- ✅ Lihat project yang di-assign
- ✅ Submit change request (timeline, team, roles)
- ✅ View team members di project
- ⚫ Tidak bisa buat/edit project
- ⚫ Tidak bisa assign tim

### 👥 Human Resources (HR)

- ✅ Lihat semua employee
- ✅ Filter employee by availability, seniority, contract status
- ✅ Lihat contract end date
- ✅ **Approve / Reject contract extension request**
- ✅ Lihat history extension (approved/rejected only)
- ✅ Auto-reject jika pending lebih dari 2 hari

---

## Persyaratan Sistem

### Backend

```
OS:         Windows 10+, macOS 10.14+, Linux (Ubuntu 18.04+)
.NET:       .NET 10 SDK
Database:   PostgreSQL 12+
Node.js:    Optional (for tooling)
Port:       5052 (configurable)
```

### Frontend

```
Node.js:    16+ LTS
npm:        8+
Browser:    Chrome 90+, Safari 14+, Firefox 88+
Port:       5173 (default Vite)
```

---

## Setup Cepat

### 1️⃣ Prerequisites

Pastikan sudah install:

```bash
# Backend
dotnet --version          # Should be 10.0+

# Frontend
node --version            # Should be 16+
npm --version             # Should be 8+

# Database
psql --version            # Should be 12+
```

### 2️⃣ Clone Repository

```bash
git clone https://github.com/Budiman002/rps-app
cd rps-app
```

### 3️⃣ Setup Database (PostgreSQL)

```bash
# Create database
createdb rps_db

# Optional: With password
createdb -U postgres -W rps_db
```

### 4️⃣ Setup Backend

```bash
cd backend/RPS.WebAPI

# Restore dependencies
dotnet restore

# Create appsettings.json (copy from appsettings.example.json)
cp appsettings.example.json appsettings.json

# Edit appsettings.json dengan local credentials
# - Database connection string
# - JWT secret key
# - Allowed origins (CORS)

# Apply migrations
dotnet ef database update --project ../RPS.Entities --startup-project .

# Run backend
dotnet run

# Endpoint: http://localhost:5052
```

### 5️⃣ Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
echo "VITE_API_URL=http://localhost:5052" > .env

# Start dev server
npm run dev

# URL: http://localhost:5173
```

### 6️⃣ Verify Setup

```bash
# Backend health check
curl http://localhost:5052/api/health

# Frontend loads at
http://localhost:5173

# Login with test account (check DbSeeder.cs for Seeds)
```

---

## Struktur Project

```
rps-app/
├── backend/                       # .NET 10 API
│   ├── RPS.WebAPI/                # Entry point, controllers, middleware
│   │   ├── Controllers/           # API endpoints
│   │   ├── AuthorizationPolicies/ # Role-based policies
│   │   ├── Program.cs             # Startup configuration
│   │   ├── appsettings.json       # Configuration (gitignored)
│   │   └── Dockerfile             # Container image
│   │
│   ├── RPS.Commons/               # Business logic, handlers, validators
│   │   ├── RequestHandlers/       # CQRS handlers
│   │   ├── Validators/            # FluentValidation rules
│   │   ├── Extensions/            # DI setup
│   │   └── Helpers/               # Utility functions
│   │
│   ├── RPS.Contracts/             # DTOs only (no logic)
│   │   ├── RequestModels/         # Incoming DTOs
│   │   └── ResponseModels/        # Outgoing DTOs
│   │
│   ├── RPS.Entities/              # Domain models & data access
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs    # EF Core DbContext
│   │   │   └── DbSeeder.cs        # Test data
│   │   ├── Migrations/            # EF migrations
│   │   └── *.cs                   # Entity models
│   │
│   ├── BACKEND.md                 # Backend guidelines & standards
│   └── rps-app.sln                # Solution file
│
├── frontend/                      # React + TypeScript
│   ├── src/
│   │   ├── components/            # UI components
│   │   ├── pages/                 # Page-level components
│   │   ├── contexts/              # React Context (global state)
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── types/                 # TypeScript interfaces
│   │   ├── functions/             # Utilities & API URLs
│   │   ├── styles/                # Global CSS
│   │   ├── routes.tsx             # Route definitions
│   │   ├── App.tsx                # Root component
│   │   └── main.tsx               # Entry point
│   │
│   ├── public/                    # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── frontend.md                # Frontend guidelines & standards
│   └── README.md                  # Frontend quick start
│
├── docs/                          # Shared documentation
│   ├── be-standard.md             # Accelist backend standard
│   ├── fe-standard.md             # Accelist frontend standard
│   └── security-standard.md       # Security best practices
│
├── .gitignore                     # Git ignore rules
├── rps-app.sln                    # Root solution file (optional)
└── README.md                      # This file
```

---

## Arsitektur Sistem

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TS)                    │
│              Built with Vite, shadcn/ui, Tailwind           │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/REST
                  ↓
┌─────────────────────────────────────────────────────────────┐
│                  Backend (.NET 10 API)                       │
│              CQRS Pattern, MediatR, EF Core                  │
│                                                              │
│  ┌─────────────┐  ┌───────────────┐  ┌──────────────┐      │
│  │ Controllers │→ │ MediatR Req   │→ │   Handlers   │      │
│  │   (HTTP)    │  │ + Request     │  │  + Context   │      │
│  └─────────────┘  │   Models      │  │  + Business  │      │
│                   └───────────────┘  │    Logic     │      │
│                                      └──────────────┘      │
│  ┌─────────────┐  ┌───────────────┐  ┌──────────────┐      │
│  │ Validators  │→ │ FluentValidate│→ │  Database    │      │
│  │   Rules     │  │                │  │   Models     │      │
│  └─────────────┘  └───────────────┘  └──────────────┘      │
└─────────────────┬───────────────────────────────────────────┘
                  │ SQL
                  ↓
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (rps_db)                    │
│           Users, Projects, Employees, Roles, etc             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Example: Contract Extension

```
1. [Frontend] HR clicks "Extend" button for employee
                ↓
2. [Frontend] Dialog opens, HR inputs reason & new end date
                ↓
3. [Frontend] POST /api/ContractExtendRequest with {employeeId, reason, endDate}
                ↓
4. [Backend] ContractExtendRequestController.Create()
                ↓
5. [Backend] mediator.Send(CreateExtendContractRequest)
                ↓
6. [Backend] CreateExtendContractRequestHandler
             - Validate employee exists
             - Check request count (max 2 per 30 days)
             - Create ContractExtendRequest (Status=Pending)
             - Send notification to HR users
             - Save to database
                ↓
7. [Backend] Return CreateExtendContractResponse {id, status, createdAt}
                ↓
8. [Frontend] Toast: "Extension request created successfully"
                ↓
9. [Frontend] Refresh employee list to show pending request
                ↓
10. [Later] HR views pending requests in Employee Management
            → Click "Extend" or "Reject"
            → Form submits with approval decision + end date
            → UpdateExtendContractRequestHandler processes
            → Status changes to Approved/Rejected
            → Employee.ContractEndDate updated (if approved)
            → Notification sent to GM who requested
```

### Key Business Rules

| Rule                              | Owner   | Trigger                          |
| --------------------------------- | ------- | -------------------------------- |
| Max 2 requests per 30 days        | Backend | On new extension request         |
| Auto-reject after 2 days          | Backend | On GetEmployeeList (every fetch) |
| HR can only see Approved/Rejected | Backend | History endpoint filter          |
| Contract must extend into future  | Backend | Validation on create             |
| Available employees sorted by xp  | Backend | GetAvailableEmployees response   |
| Notifications sent to HR + GM     | Backend | After request/decision created   |

---

## Panduan Kontribusi

### Branching Strategy

```
main (production)
  ↑
dev (integration)
  ↑
feature/xxx (from dev)
```

**Warning:** Never commit directly to `main` atau `dev`. Always create feature branch.

### Git Workflow

```bash
# 1. Update local dev
git checkout dev
git pull origin dev

# 2. Create feature branch
git checkout -b feature/xxxxx

# 3. Make changes, test locally

# 4. Commit (follow convention below)
git add .
git commit -m "feat: deskripsi perubahan"
# atau: fix:, refactor:, docs:, chore:, test:

# 5. Push & create PR
git push origin feature/xxxxx
# Create PR on GitHub against `dev`, not `main`

# 6. After review & approval, merge to dev
# CI/CD pipeline runs tests

# 7. Deploy to production from main (by admin)
```

### Commit Convention

```
feat:   new feature               (feat: add contract extension history)
fix:    bug fix                   (fix: fix date comparison bug)
refactor: code refactor           (refactor: extract employee filtering)
docs:   documentation             (docs: update README)
test:   add/update tests          (test: add handler unit tests)
chore:  dependencies, config      (chore: update dotnet packages)
style:  code formatting           (style: format code)
perf:   performance improvement   (perf: optimize employee list query)
ci:     CI/CD configuration       (ci: add GitHub Actions workflow)
```

### Code Review Checklist

**Backend**

- [ ] Follows Clean Architecture (thin controllers, CQRS handlers)
- [ ] Includes validation (FluentValidation)
- [ ] Proper error handling with meaningful messages
- [ ] Uses async/await patterns
- [ ] No hardcoded values (use constants)
- [ ] Unit tests for complex logic
- [ ] SQL migrations properly named

**Frontend**

- [ ] TypeScript types complete (no `any`)
- [ ] Components follow React hooks pattern
- [ ] Proper error & loading states
- [ ] User feedback with toast notifications
- [ ] Accessible HTML structure
- [ ] Responsive design (mobile-first)
- [ ] No console errors/warnings

### Testing

```bash
# Backend - Run tests
dotnet test

# Frontend - Run tests (if configured)
npm run test

# Both - Format & lint before commit
npm run lint
npm run format
```

---

## Referensi Dokumentasi

### Dokumentasi Teknis

- **[BACKEND.md](./backend/BACKEND.md)** — Panduan lengkap backend: architecture, patterns, coding standards, database schema, business rules, dan API reference
- **[frontend.md](./frontend/frontend.md)** — Panduan lengkap frontend: component patterns, state management, hooks, styling, TypeScript standards, dan best practices
- **[BACKEND Standard](./docs/be-standard.md)** — Accelist standard untuk backend development
- **[FRONTEND Standard](./docs/fe-standard.md)** — Accelist standard untuk frontend development
- **[Security Standard](./docs/security-standard.md)** — Security best practices untuk aplikasi

### External References

- ✅ **.NET 10 Documentation**: https://learn.microsoft.com/en-us/dotnet/
- ✅ **Entity Framework Core**: https://learn.microsoft.com/en-us/ef/core/
- ✅ **MediatR**: https://github.com/jbogard/MediatR
- ✅ **React Hooks**: https://react.dev/reference/react/hooks
- ✅ **TypeScript**: https://www.typescriptlang.org/docs/
- ✅ **Tailwind CSS**: https://tailwindcss.com/docs
- ✅ **shadcn/ui**: https://ui.shadcn.com/
- ✅ **PostgreSQL**: https://www.postgresql.org/docs/

### Quick Command Reference

```bash
# Backend
dotnet new webapi -n RPS.WebAPI
dotnet add package MediatR
dotnet restore
dotnet build
dotnet run
dotnet ef migrations add [name]
dotnet ef database update

# Frontend
npm create vite@latest rps-frontend -- --template react-ts
npm install react-router-dom zustand sonner shadcn-ui
npm run dev
npm run build
npm run preview
```

---

## Troubleshooting

### Backend Issues

**Issue:** Database connection failed

```
Solution: Check appsettings.json connection string, verify PostgreSQL is running
psql -U postgres -d rps_db -c "SELECT 1"
```

**Issue:** Migration error

```
Solution: Remove last migration if not deployed
dotnet ef migrations remove --project ../RPS.Entities
```

**Issue:** Port 5052 already in use

```
Solution: Change port in Properties/launchSettings.json or kill process
```

### Frontend Issues

**Issue:** API calls failing with CORS errors

```
Solution: Check CORS configuration in backend Program.cs
Verify frontend URL is in AllowedOrigins
```

**Issue:** TypeScript compilation errors

```
Solution: Run npm run build to see all errors
Check tsconfig.json strictNullChecks setting
```

**Issue:** Vite dev server not starting

```
Solution: Check if port 5173 is available
npm run dev -- --host 0.0.0.0 --port 3000 (change port)
```

---

## Lisensi & Kontak

- **Perusahaan:** PT. Accelist
- **Project Manager:** [TBD]
- **Backend Lead:** [TBD]
- **Frontend Lead:** [TBD]

---

## Catatan Penting

⚠️ **JANGAN COMMIT:**

- `appsettings.json` (gitignored, local config dengan credentials)
- `.env` files
- `node_modules/`, `bin/`, `obj/`
- IDE local settings (`.idea/`, `.vscode/` personal settings)

✅ **HARUS COMMIT:**

- Semua source code di `backend/` dan `frontend/`
- Migrations di `backend/RPS.Entities/Migrations/`
- Dokumentasi

---

**Last Updated:** April 2026 | Maintained by Development Team
