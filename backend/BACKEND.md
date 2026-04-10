# Backend Guidelines — Resource Planning System (RPS)
> Mengikuti standard Accelist Vibe-Code-Basic: https://github.com/accelist/Vibe-Code-Basic/blob/main/be-standard.md

## Project Overview
Resource Planning System (RPS) adalah sistem internal perusahaan untuk manajemen sumber daya manusia dan proyek. Backend menyediakan REST API yang dikonsumsi oleh frontend React.

### Roles & Permission
| Role | Akses |
|---|---|
| Marketing | Create project, Read all projects |
| GM | Read all projects, Assign team, Edit project, Request extend contract |
| PM | Read assigned projects, Request change |
| HR | Read all employees, Process extend contract |

### Status Project Flow
```
Unassigned → Scheduled → In Progress → Complete
```

---

## 1. Architecture & Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | .NET 10 | Runtime & SDK |
| Language | C# | Primary language |
| Database | PostgreSQL | Relational data store |
| ORM | Entity Framework Core | Code-first data access |
| Pattern | Clean Architecture + CQRS | Separation of concerns |
| Mediator | MediatR | Decouples controllers from business logic |
| Auth | JWT Bearer | Authentication & Authorization |
| Validation | FluentValidation | Request model validation |
| Password | BCrypt.Net-Next | Password hashing |

---

## 2. Project Structure

```
backend/
├── RPS.WebAPI/                  # Entry point — HTTP API, thin controllers
│   ├── Controllers/             # API controllers (RESTful, thin)
│   ├── AuthorizationPolicies/   # Custom authorization policies
│   ├── Program.cs               # Startup, DI, middleware pipeline
│   └── appsettings.json         # Configuration (JANGAN DI-COMMIT)
├── RPS.Commons/                 # Application Layer — core logic
│   ├── Constants/               # Shared constants, enums
│   ├── Extensions/              # Service registration extension methods
│   ├── Helpers/                 # Utility classes (JwtHelper, dll)
│   ├── RequestHandlers/         # CQRS handlers (by feature)
│   │   ├── Auth/
│   │   ├── Project/
│   │   ├── Dashboard/
│   │   └── ...
│   └── Validators/              # FluentValidation validators (by feature)
│       ├── Auth/
│       ├── Project/
│       └── ...
├── RPS.Contracts/               # DTOs — zero logic, zero dependencies
│   ├── RequestModels/           # Incoming DTOs (by feature)
│   │   ├── Auth/
│   │   ├── Project/
│   │   ├── Dashboard/
│   │   └── ...
│   └── ResponseModels/          # Outgoing DTOs (by feature)
│       ├── Auth/
│       ├── Project/
│       ├── Dashboard/
│       └── ...
└── RPS.Entities/                # Domain & Data Access Layer
    ├── Data/
    │   ├── AppDbContext.cs      # EF Core DbContext
    │   └── DbSeeder.cs          # Dummy data seeder
    ├── Migrations/              # Auto-generated EF migrations
    └── [Entity].cs              # Entity classes (satu file per entity)
```

### Key Rules
- **Feature folders**: File di RequestHandlers, Validators, RequestModels, ResponseModels WAJIB dikelompokkan per fitur
- **One class per file**: Satu class per file, tidak boleh digabung
- Hanya `RPS.WebAPI` yang runnable. `RPS.Commons`, `RPS.Contracts`, `RPS.Entities` adalah class libraries

---

## 3. Database Schema (ERD)

### Users
```
id (uuid PK), full_name, email, password (hashed),
role (GM/PM/Marketing/HR), contract_type (permanent/contract),
contract_end_date (nullable), years_of_experience,
created_at, updated_at
```

### Projects
```
id (uuid PK), name, client_name, description, notes_from_marketing,
priority (Low/Medium/High/Critical),
status (Unassigned/Scheduled/InProgress/Complete),
expected_start_date, actual_start_date (nullable), estimated_end_date,
duration_weeks, created_by FK, assigned_pm_id FK (nullable),
created_at, updated_at
```

### ProjectRoleCompositions
```
id (uuid PK), project_id FK, role_title,
seniority_level (Senior/Junior/Intern),
employment_status (Dedicated/Parallel),
quantity, created_at, updated_at
```

### ProjectMembers
```
id (uuid PK), project_id FK, user_id FK,
role_composition_id FK, assigned_by FK, assigned_at
```

### ChangeRequests
```
id (uuid PK), project_id FK, requested_by FK,
change_title, change_description,
request_type (Timeline/Team/Roles),
new_start_date (nullable), new_end_date (nullable),
new_duration_weeks (nullable),
status (Pending/Approved/Rejected), created_at, updated_at
```

### ContractExtendRequests
```
id (uuid PK), employee_id FK, requested_by FK,
reason, requested_end_date,
status (Pending/Approved/Rejected), created_at, updated_at
```

### Notifications
```
id (uuid PK), recipient_id FK, type, title, message,
reference_id (nullable), reference_type (nullable),
is_read, created_at
```

---

## 4. Design Patterns

### CQRS + MediatR
- **Requests** (Commands/Queries): Simple DTOs di `RPS.Contracts/RequestModels`. Implement `IRequest<TResponse>`
- **Handlers**: Di `RPS.Commons/RequestHandlers`. Implement `IRequestHandler<TRequest, TResponse>`. Satu handler per request
- **Controllers** hanya memanggil `_mediator.Send(request)` — TIDAK ADA business logic di controller

### Contoh Flow
```
Request HTTP → Controller → mediator.Send(request) → Handler → Database → Response
```

---

## 5. Naming Convention

| Element | Convention | Contoh |
|---|---|---|
| Class / Interface / Method / Property | PascalCase | `CreateProjectRequestHandler` |
| Parameter / Local Variable | camelCase | `projectId`, `userId` |
| Private Field | `_camelCase` | `_mediator`, `_context` |
| Request Models | `[Action][Resource]Request` | `CreateProjectRequest` |
| Response Models | `[Action][Resource]Response` | `ProjectResponse` |
| Validators | `[RequestName]Validator` | `CreateProjectRequestValidator` |
| Handlers | `[RequestName]Handler` | `CreateProjectRequestHandler` |
| List Queries | `Get[Entity]ListRequest` | `GetProjectListRequest` |

---

## 6. Controller Standards

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProjectController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] GetProjectListRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(request, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Marketing")]
    public async Task<IActionResult> Create(
        [FromBody] CreateProjectRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(request, cancellationToken);
        return Ok(result);
    }
}
```

### Rules
- Inherit dari `ControllerBase`
- Gunakan `[FromQuery]` untuk GET, `[FromBody]` untuk POST/PUT
- Selalu terima `CancellationToken`
- Apply `[Authorize]` di controller atau action level
- Gunakan HTTP status code yang benar (200, 201, 400, 401, 403, 404, 500)

---

## 7. Handler Standards

```csharp
public class CreateProjectRequestHandler : IRequestHandler<CreateProjectRequest, ProjectResponse>
{
    private readonly AppDbContext _context;
    private readonly ILogger<CreateProjectRequestHandler> _logger;

    public CreateProjectRequestHandler(AppDbContext context, ILogger<CreateProjectRequestHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ProjectResponse> Handle(CreateProjectRequest request, CancellationToken cancellationToken)
    {
        // Business logic di sini
        var project = new Project
        {
            Name = request.Name,
            // ...
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync(cancellationToken);

        return new ProjectResponse
        {
            Id = project.Id,
            // ...
        };
    }
}
```

---

## 8. Validator Standards

```csharp
public class CreateProjectRequestValidator : AbstractValidator<CreateProjectRequest>
{
    public CreateProjectRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nama project tidak boleh kosong");

        RuleFor(x => x.ClientName)
            .NotEmpty().WithMessage("Nama client tidak boleh kosong");

        RuleFor(x => x.DurationWeeks)
            .GreaterThan(0).WithMessage("Durasi harus lebih dari 0 minggu");
    }
}
```

---

## 9. Entity Standards

```csharp
public class Project
{
    [Key]
    public Guid Id { get; set; }

    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [ForeignKey(nameof(CreatedByUser))]
    public Guid CreatedBy { get; set; }

    public virtual User CreatedByUser { get; set; } = default!;

    public virtual ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();
}
```

### Rules
- Gunakan `[StringLength]` pada SEMUA string property
- Gunakan Data Annotations (`[ForeignKey]`, `[InverseProperty]`)
- Initialize navigation collections ke `new List<T>()`
- Setiap perubahan entity WAJIB membuat EF Core migration baru

---

## 10. Migration Rules
- JANGAN pernah edit migration yang sudah ada
- Selalu buat migration baru untuk setiap perubahan schema
- Naming migration harus deskriptif:

```bash
# Benar ✅
dotnet ef migrations add AddActualStartDateToProjects --project ../RPS.Entities --startup-project .
dotnet ef migrations add CreateNotificationsTable --project ../RPS.Entities --startup-project .

# Salah ❌
dotnet ef migrations add Update
dotnet ef migrations add Fix
```

---

## 11. Business Rules

### Project
- `estimated_end_date` = `expected_start_date + duration_weeks * 7`
- Status default saat create: `Unassigned`
- Saat GM assign tim:
  - `actual_start_date` = hari ini → status = `InProgress`
  - `actual_start_date` di masa depan → status = `Scheduled`
- Marketing dan GM bisa read semua project
- PM hanya bisa read project yang `assigned_pm_id` = userId-nya

### Resource Assignment (GM)
- Cek availability employee: tidak sedang assigned di project lain di periode yang sama
- Cek kontrak cukup: `contract_end_date >= project.estimated_end_date`
- Jika kontrak tidak cukup → kirim notifikasi ke HR
- Sort rekomendasi: availability dulu, lalu `years_of_experience`

### Contract Extend
- Tombol extend hanya muncul jika `contract_type = contract`
- HR yang eksekusi setelah GM request

---

## 12. Environment & Credentials
```
Backend URL:   http://localhost:5052 (atau port yang di-assign)
Database:      rps_db
DB Username:   postgres
DB Password:   (isi sendiri di appsettings.json lokal — JANGAN DI-COMMIT)
```

---

## 13. API Endpoints Reference

### Auth
```
POST /api/Auth/register   [AllowAnonymous]
POST /api/Auth/login      [AllowAnonymous]
```

### Project
```
POST /api/Project         [Authorize(Roles = "Marketing")]
GET  /api/Project         [Authorize]
GET  /api/Project/{id}    [Authorize]
PUT  /api/Project/{id}    [Authorize(Roles = "GM")]
POST /api/Project/{id}/assign [Authorize(Roles = "GM")]
```

### Dashboard
```
GET /api/Dashboard/stats  [Authorize]
```

### Change Requests
```
GET  /api/ChangeRequest         [Authorize]
POST /api/ChangeRequest         [Authorize(Roles = "PM")]
PUT  /api/ChangeRequest/{id}    [Authorize(Roles = "GM")]
```

### Users / Employees
```
GET /api/User                   [Authorize(Roles = "HR,GM")]
GET /api/User/available         [Authorize(Roles = "GM")]
```

### Contract
```
GET  /api/ContractRequest       [Authorize]
POST /api/ContractRequest       [Authorize(Roles = "GM")]
PUT  /api/ContractRequest/{id}  [Authorize(Roles = "HR")]
```

### Notifications
```
GET /api/Notification           [Authorize]
PUT /api/Notification/{id}/read [Authorize]
```

---

## 14. Configuration Management
- Centralize di `appsettings.json`
- **JANGAN** hardcode connection string, API key, atau credentials di source code
- `appsettings.json` sudah di-gitignore — setiap dev isi sendiri di lokal
- Lihat contoh di `appsettings.example.json`

---

## 15. Do's & Don'ts

### DO ✅
- Satu class per file
- Kelompokkan file per feature folder
- Pakai async/await untuk semua database operation
- Selalu buat validator untuk setiap command baru
- Pakai DTO — jangan expose entity langsung ke response
- Buat migration baru untuk setiap perubahan schema

### DON'T ❌
- Jangan tulis business logic di controller
- Jangan expose entity langsung ke response
- Jangan edit migration yang sudah ada
- Jangan hardcode credentials
- Jangan push `appsettings.json` ke repo
- Jangan push langsung ke `main`

---

## 16. Git Commit Convention
```
feat: menambahkan endpoint create project
fix: memperbaiki validasi contract end date
refactor: memindahkan logic ke RequestHandler
chore: menambahkan migration untuk tabel notifications
docs: update API endpoints di BACKEND.md
```

Format: `<type>: <deskripsi singkat dalam bahasa indonesia>`

Types: `feat`, `fix`, `refactor`, `chore`, `docs`
