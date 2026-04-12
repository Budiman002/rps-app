---
trigger: always_on
---

# Backend Development Standard (.NET / C#)

> **Scope**: This is a general-purpose backend development standard for .NET Web API projects. It defines architecture, coding conventions, project structure, and mandatory rules for all contributors (human and AI).

---

## 1. Architecture & Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | .NET 8+ | Runtime & SDK |
| **Language** | C# | Primary language |
| **Database** | PostgreSQL / SQL Server | Relational data store |
| **ORM** | Entity Framework Core | Code-first data access |
| **Pattern** | Clean Architecture + CQRS | Separation of concerns |
| **Mediator** | MediatR | Decouples controllers from business logic |
| **Auth** | OpenIddict / ASP.NET Identity | OAuth 2.0 / OIDC |
| **Validation** | FluentValidation | Request model validation |
| **Background Jobs** | Hangfire / MassTransit | Async & scheduled processing |
| **Logging** | Serilog + Sentry | Structured logging & error tracking |
| **Object Storage** | S3-compatible (MinIO/AWS) | File/blob storage |

---

## 2. Project Structure

A solution MUST follow Clean Architecture with the following projects:

```
Solution.sln
├── [Product].WebAPI/            # Entry point — HTTP API, thin controllers
│   ├── Controllers/             # API controllers (RESTful, thin)
│   ├── AuthorizationPolicies/   # Custom authorization policies
│   ├── Program.cs               # Startup, DI, middleware pipeline
│   └── appsettings.json         # Configuration
├── [Product].Commons/           # Application Layer — core logic
│   ├── Constants/               # Shared constants, enums, magic strings
│   ├── Extensions/              # Service registration extension methods
│   ├── RequestHandlers/         # CQRS command/query handlers (by feature)
│   ├── Services/                # Infrastructure services (email, storage)
│   └── Validators/              # FluentValidation validators (by feature)
├── [Product].Contracts/         # DTOs — zero logic, zero dependencies
│   ├── RequestModels/           # Incoming DTOs (by feature)
│   └── ResponseModels/         # Outgoing DTOs (by feature)
├── [Product].Entities/          # Domain & Data Access Layer
│   ├── ApplicationDbContext.cs  # EF Core DbContext
│   ├── Migrations/              # Auto-generated EF migrations
│   └── [Entity].cs              # Entity classes
├── [Product].Hangfire/          # Background job server (separate host)
│   ├── Program.cs
│   └── Controllers/
└── [Product].Infrastructure/    # Optional: cross-cutting infrastructure
```

### Key Rules
- **Feature folders**: Files in `RequestHandlers`, `Validators`, `RequestModels`, `ResponseModels` MUST be grouped by feature (e.g., `ManageUsers/`, `Inventory/`, `DataDiscovery/`).
- **One class per file**: Strictly enforced.
- Only `WebAPI` and `Hangfire` are runnable. `Commons`, `Contracts`, `Entities` are class libraries.

---

## 3. Design Patterns

### 3.1 CQRS + Mediator
- **Requests** (Commands/Queries): Simple DTOs in `Contracts/RequestModels`. Implement `IRequest<TResponse>`.
- **Handlers**: In `Commons/RequestHandlers`. Implement `IRequestHandler<TRequest, TResponse>`. One handler per request.
- **Controllers** just call `_mediator.Send(request)` — **no business logic**.

### 3.2 Dependency Injection
- Constructor injection **exclusively**.
- Register services in `Commons/Extensions/` or `Program.cs`.
- Use `IOptions<T>` for configuration injection from `appsettings.json`.

### 3.3 Validation
- Every command that accepts user input MUST have a FluentValidation validator.
- Validators may inject `DbContext` or `UserManager` for complex checks (e.g., duplicate email check).
- Naming: `[RequestName]Validator` (e.g., `CreateUserRequestValidator`).

---

## 4. Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Classes / Interfaces / Methods / Properties | PascalCase | `CreateUserRequestHandler`, `FullName` |
| Parameters / Local Variables | camelCase | `userManager`, `newUser` |
| Private Fields | `_camelCase` | `_userManager`, `_mediator` |
| Request Models | `[Action][Resource]Request` | `CreateUserRequest`, `GetRopaListRequest` |
| Response Models | `[Action][Resource]Response` | `CreateUserResponse`, `GetRopaListResponse` |
| Validators | `[RequestName]Validator` | `CreateUserRequestValidator` |
| Handlers | `[RequestName]Handler` | `CreateUserRequestHandler` |
| List Queries | `Get[Entity]ListRequest` | NOT `List[Entity]Request` |

### Async
- All I/O-bound operations MUST use `async/await`.
- Controllers and handlers return `async Task<T>`.

---

## 5. Controller Standards

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExampleController : ControllerBase
{
    private readonly IMediator _mediator;

    public ExampleController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("list")]
    public async Task<ActionResult<GetExampleListResponse>> List(
        [FromQuery] GetExampleListRequest request, 
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(request, cancellationToken);
        return Ok(result);
    }

    [HttpPost("create")]
    public async Task<ActionResult<Guid>> Create(
        [FromBody] CreateExampleRequest request, 
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(request, cancellationToken);
        return Ok(result);
    }
}
```

### Rules
- Inherit from `ControllerBase`.
- Use `[FromQuery]` for GET, `[FromBody]` for POST/PUT/PATCH.
- Always accept `CancellationToken`.
- Apply `[Authorize]` at controller or action level.
- Follow RESTful conventions.
- Use standard HTTP status codes (200, 201, 400, 404, 500).

---

## 6. Entity Standards

```csharp
public class Example : IHaveCreateAndUpdateAudit
{
    [Key]
    public Guid Id { get; set; }

    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [ForeignKey(nameof(Category))]
    public Guid CategoryId { get; set; }

    public virtual Category Category { get; set; } = default!;

    [InverseProperty(nameof(ExampleDetail.Example))]
    public virtual ICollection<ExampleDetail> Details { get; set; } = new List<ExampleDetail>();

    // Audit fields
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
```

### Rules
- Use `[StringLength]` on ALL string properties.
- Use Data Annotations for schema definition (`[ForeignKey]`, `[InverseProperty]`).
- Initialize navigation collections to `new List<T>()`.
- Any entity change requires an EF Core migration.

---

## 7. Database Management

### Strategy
- **Code-first** with Entity Framework Core.
- Automatic migration on startup (via `HostedService`).

### Creating a Migration
```bash
dotnet ef migrations add <DescriptiveName> \
  --project [Product].Entities \
  --startup-project [Product].WebAPI
```

### Applying Migrations
- **Auto**: Run the application — hosted service applies pending migrations.
- **Manual**: `dotnet ef database update --project [Product].Entities --startup-project [Product].WebAPI`

---

## 8. Configuration Management

- Centralize in `appsettings.json`.
- Environment overrides in `appsettings.{Environment}.json`.
- Secrets: Use User Secrets (`dotnet user-secrets`) for local dev; Environment Variables or Key Vault for production.
- **NEVER** hardcode connection strings, API keys, or credentials in source code.
- Access config via `IOptions<T>` pattern.

---

## 9. Error Handling

- Do NOT swallow exceptions. Let the global exception handler manage them unless specific recovery is needed.
- Return `ProblemDetails` for error responses (ASP.NET standard).
- Use standard HTTP status codes consistently.
- Log exceptions with structured context (Serilog).

---

## 10. Logging

- Use `Serilog` for structured logging (JSON format).
- Send errors to Sentry for monitoring.
- **NEVER** log secrets, tokens, passwords, or PII.
- Include correlation IDs for request tracing.
- Use parameterized logging: `_logger.LogInformation("User {UserId} created", userId)`.

---

## 11. Mandatory Rules for AI Agents

> All AI agents contributing to this codebase MUST follow these rules without exception.

### 11.1 No Hardcoding
- Never hardcode string literals, magic numbers, or configuration values.
- Constants → `[Product].Commons/Constants/`.
- Configuration → `appsettings.json` + `IOptions<T>`.
- Enums → defined in `Constants/` for any fixed set of values.

### 11.2 Use Existing Patterns
- Follow Clean Architecture + CQRS/MediatR. Do not invent new patterns.
- Business logic → `RequestHandlers`.
- Validation → `Validators` (FluentValidation).
- DTOs → `Contracts` (NOT in `Commons` or `WebAPI`).
- Always create a validator for new commands.

### 11.3 Respect Project Structure
- Place files in correct feature folders.
- If a feature folder doesn't exist, create one.
- Do NOT dump files in root directories.

### 11.4 Error Handling
- Do not swallow exceptions.
- Use standard HTTP status codes.
- Let the global handler manage unhandled exceptions.

### 11.5 Never Execute Code
- Never run `dotnet build`, `dotnet run`, or execute the application.
- Only write code; the owner runs it on the appropriate server.

---

## 12. Docker & Deployment

### Dockerfile Best Practices
- Multi-stage build: separate build and runtime stages.
- Run as non-root user.
- Use minimal base images.
- Never expose secrets in image layers.
- Include `HEALTHCHECK`.

### Running the Application
Two separate processes are required:
1. **Web API**: Main HTTP server (default: `http://localhost:5052`)
2. **Hangfire Server**: Background job processor (default: `http://localhost:5182`)

---

## 13. Testing Guidelines

- Write unit tests for RequestHandlers and Validators.
- Integration tests for API endpoints via `WebApplicationFactory`.
- Test authorization matrix: verify roles/permissions per endpoint.
- Use `FluentAssertions` for readable assertions.
- Mock external services (email, storage, etc.) in tests.