# Backend Guidelines — Resource Planning System (RPS)

## Project Overview
Resource Planning System (RPS) adalah sistem internal perusahaan untuk manajemen sumber daya manusia dan proyek. Backend bertugas menyediakan REST API yang dikonsumsi oleh frontend Next.js/React.

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

## Tech Stack
- ASP.NET Core Web API (.NET 8)
- Entity Framework Core
- PostgreSQL (via Npgsql)
- JWT Authentication

---

## Environment & Credentials
```
Backend URL:   http://localhost:5000
Database:      rps_db
DB Username:   postgres
DB Password:   postgres
DB Host:       localhost
DB Port:       5432
```

---

## Folder Structure
```
RPS.API/
├── Controllers/        # HTTP endpoints — hanya routing & response
├── Models/             # Database entities (EF Core)
├── DTOs/               # Request & Response shapes
│   ├── Request/        # DTO untuk request body
│   └── Response/       # DTO untuk response body
├── Services/           # Business logic — semua logic ada di sini
├── Data/
│   ├── AppDbContext.cs # EF Core DB context
│   └── DbSeeder.cs     # Dummy data seeder
├── Helpers/            # Utility functions (JWT, password hash, dll)
├── Middleware/         # Custom middleware
└── Program.cs          # App entry point & service registration
```

---

## Database Schema (ERD)

### Tabel Users
```
users
├── id                  uuid PK
├── full_name           string
├── email               string UNIQUE
├── password            string (hashed)
├── role                enum: GM, PM, Marketing, HR
├── contract_type       enum: permanent, contract
├── contract_end_date   date? (nullable)
├── years_of_experience int
├── created_at          timestamp
└── updated_at          timestamp
```

### Tabel Projects
```
projects
├── id                    uuid PK
├── name                  string
├── client_name           string
├── description           text
├── notes_from_marketing  text?
├── priority              enum: Low, Medium, High, Critical
├── status                enum: Unassigned, Scheduled, InProgress, Complete
├── expected_start_date   date
├── actual_start_date     date?
├── estimated_end_date    date
├── duration_weeks        int
├── created_by            uuid FK → users.id
├── assigned_pm_id        uuid? FK → users.id
├── created_at            timestamp
└── updated_at            timestamp
```

### Tabel ProjectRoleCompositions
```
project_role_compositions
├── id                uuid PK
├── project_id        uuid FK → projects.id
├── role_title        string
├── seniority_level   enum: Senior, Junior, Intern
├── employment_status enum: Dedicated, Parallel
├── quantity          int
├── created_at        timestamp
└── updated_at        timestamp
```

### Tabel ProjectMembers
```
project_members
├── id                  uuid PK
├── project_id          uuid FK → projects.id
├── user_id             uuid FK → users.id
├── role_composition_id uuid FK → project_role_compositions.id
├── assigned_by         uuid FK → users.id
└── assigned_at         timestamp
```

### Tabel ChangeRequests
```
change_requests
├── id                  uuid PK
├── project_id          uuid FK → projects.id
├── requested_by        uuid FK → users.id
├── change_title        string
├── change_description  text
├── request_type        enum: Timeline, Team, Roles
├── new_start_date      date?
├── new_end_date        date?
├── new_duration_weeks  int?
├── status              enum: Pending, Approved, Rejected
├── created_at          timestamp
└── updated_at          timestamp
```

### Tabel ContractExtendRequests
```
contract_extend_requests
├── id                  uuid PK
├── employee_id         uuid FK → users.id
├── requested_by        uuid FK → users.id
├── reason              text
├── requested_end_date  date
├── status              enum: Pending, Approved, Rejected
├── created_at          timestamp
└── updated_at          timestamp
```

### Tabel Notifications
```
notifications
├── id              uuid PK
├── recipient_id    uuid FK → users.id
├── type            string
├── title           string
├── message         text
├── reference_id    uuid?
├── reference_type  string?
├── is_read         boolean
└── created_at      timestamp
```

---

## Naming Convention
- **Class & Method:** PascalCase → `ProjectService`, `GetAllProjects()`
- **Variable & parameter:** camelCase → `projectId`, `userId`
- **Controller:** suffix `Controller` → `ProjectController`
- **DTO:** suffix `DTO` → `CreateProjectDTO`, `ProjectResponseDTO`
- **Service:** suffix `Service` → `ProjectService`
- **Interface:** prefix `I` → `IProjectService`
- **Enum:** PascalCase → `ProjectStatus.InProgress`

---

## Standard API Response Format
Semua endpoint WAJIB return format ini — tidak boleh return object langsung:

```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string Message { get; set; } = string.Empty;
}
```

### Contoh Response Sukses
```json
{
  "success": true,
  "data": { "id": "uuid", "name": "Project A" },
  "message": "Project berhasil dibuat"
}
```

### Contoh Response Error
```json
{
  "success": false,
  "data": null,
  "message": "Project tidak ditemukan"
}
```

---

## HTTP Status Code Convention
| Kondisi | Status Code |
|---|---|
| Sukses GET/PUT | 200 OK |
| Sukses POST (create) | 201 Created |
| Tidak ada konten | 204 No Content |
| Request tidak valid | 400 Bad Request |
| Tidak terautentikasi | 401 Unauthorized |
| Tidak punya akses | 403 Forbidden |
| Data tidak ditemukan | 404 Not Found |
| Error server | 500 Internal Server Error |

---

## Controller Pattern
Controller hanya boleh berisi routing dan memanggil service. Logic bisnis TIDAK boleh ada di controller.

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize] // Semua endpoint butuh JWT kecuali login/register
public class ProjectController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var projects = await _projectService.GetAllAsync();
            return Ok(new ApiResponse<List<ProjectResponseDTO>>
            {
                Success = true,
                Data = projects,
                Message = "Berhasil"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = ex.Message
            });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Marketing")]
    public async Task<IActionResult> Create([FromBody] CreateProjectDTO dto)
    {
        try
        {
            var project = await _projectService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetAll), new ApiResponse<ProjectResponseDTO>
            {
                Success = true,
                Data = project,
                Message = "Project berhasil dibuat"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = ex.Message
            });
        }
    }
}
```

---

## Service Pattern
Semua business logic ada di Service. Service mengakses database via AppDbContext.

```csharp
public interface IProjectService
{
    Task<List<ProjectResponseDTO>> GetAllAsync();
    Task<ProjectResponseDTO> CreateAsync(CreateProjectDTO dto);
}

public class ProjectService : IProjectService
{
    private readonly AppDbContext _context;

    public ProjectService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProjectResponseDTO>> GetAllAsync()
    {
        return await _context.Projects
            .Include(p => p.ProjectMembers)
            .Include(p => p.RoleCompositions)
            .Select(p => new ProjectResponseDTO
            {
                Id = p.Id,
                Name = p.Name,
                Status = p.Status.ToString(),
                Priority = p.Priority.ToString(),
            })
            .ToListAsync();
    }
}
```

---

## DTO Rules
- Jangan pernah expose Model (entity) langsung ke response
- Selalu buat DTO terpisah untuk Request dan Response
- Taruh di folder `DTOs/Request/` dan `DTOs/Response/`

```csharp
// DTOs/Request/CreateProjectDTO.cs
public class CreateProjectDTO
{
    public string Name { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? NotesFromMarketing { get; set; }
    public string Priority { get; set; } = string.Empty;
    public DateTime ExpectedStartDate { get; set; }
    public int DurationWeeks { get; set; }
    public List<CreateRoleCompositionDTO> RoleCompositions { get; set; } = new();
}

// DTOs/Response/ProjectResponseDTO.cs
public class ProjectResponseDTO
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime ExpectedStartDate { get; set; }
    public DateTime EstimatedEndDate { get; set; }
    public int DurationWeeks { get; set; }
}
```

---

## Business Rules yang Harus Diimplementasi di BE

### Project
- `estimated_end_date` = `expected_start_date + duration_weeks`
- Saat GM assign tim → status otomatis berubah:
  - `actual_start_date` = hari ini → status = `InProgress`
  - `actual_start_date` di masa depan → status = `Scheduled`
- Hanya Marketing yang bisa create project
- GM dan Marketing bisa read semua project
- PM hanya bisa read project yang di-assign ke dia

### Resource Assignment (GM)
- Cek availability employee: tidak sedang assigned di project lain pada periode yang sama
- Cek kontrak cukup: `contract_end_date >= project.estimated_end_date`
- Jika kontrak tidak cukup → kirim notifikasi ke HR
- Sort rekomendasi berdasarkan: availability dulu, lalu years_of_experience

### Contract Extend
- Tombol extend hanya muncul jika:
  - `contract_type = contract` (bukan permanent)
  - Ada request dari GM
- HR yang eksekusi perpanjangan kontrak

### Notifications
- Trigger notifikasi ke PM saat project di-assign
- Trigger notifikasi ke GM saat PM submit change request
- Trigger notifikasi ke HR saat GM request extend contract
- Trigger notifikasi ke PM saat GM update project

---

## Migration Rules
- Jangan pernah edit migration yang sudah ada
- Selalu buat migration baru untuk setiap perubahan schema
- Naming migration harus deskriptif:

```bash
# Benar ✅
dotnet ef migrations add AddActualStartDateToProjects
dotnet ef migrations add CreateNotificationsTable

# Salah ❌
dotnet ef migrations add Update
dotnet ef migrations add Fix
```

---

## API Endpoints Reference

### Auth
```
POST /api/auth/register
POST /api/auth/login
```

### Projects
```
GET    /api/projects              # Get all (filter by role)
GET    /api/projects/:id          # Get detail
POST   /api/projects              # Create (Marketing only)
PUT    /api/projects/:id          # Update (GM only)
POST   /api/projects/:id/assign   # Assign team (GM only)
```

### Dashboard
```
GET /api/dashboard/stats          # Stats cards (total, per status)
```

### Change Requests
```
GET  /api/change-requests         # Get all
POST /api/change-requests         # Create (PM only)
PUT  /api/change-requests/:id     # Approve/Reject (GM only)
```

### Users / Employees
```
GET /api/users                    # Get all employees (HR, GM)
GET /api/users/available          # Get available employees
```

### Contract
```
GET  /api/contract-requests       # Get all requests
POST /api/contract-requests       # Create request (GM only)
PUT  /api/contract-requests/:id   # Process extend (HR only)
```

### Notifications
```
GET /api/notifications            # Get my notifications
PUT /api/notifications/:id/read   # Mark as read
```

---

## Do's & Don'ts

### DO ✅
- Selalu pakai DTO untuk request dan response
- Selalu pakai try-catch di semua controller method
- Selalu return ApiResponse format yang sudah ditentukan
- Selalu validasi role di endpoint yang butuh permission khusus
- Hash password sebelum disimpan ke database
- Pakai async/await untuk semua database operation

### DON'T ❌
- Jangan expose entity/model langsung ke response
- Jangan tulis business logic di controller
- Jangan edit migration yang sudah ada
- Jangan simpan password plain text
- Jangan hardcode credentials di code — pakai appsettings.json
- Jangan lupa CORS config saat test dari frontend

---

## Git Commit Convention
```
feat: menambahkan endpoint create project
fix: memperbaiki validasi contract end date
refactor: memindahkan logic ke ProjectService
chore: menambahkan migration untuk tabel notifications
docs: update API endpoints di BACKEND.md
```

Format: `<type>: <deskripsi singkat dalam bahasa indonesia>`

Types: `feat`, `fix`, `refactor`, `chore`, `docs`
