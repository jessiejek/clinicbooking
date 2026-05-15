# CLINIC SYSTEM — BACKEND.md
> .NET 8 Clean Architecture. Single source of truth for all backend structure, database schema, business rules, and API contracts.

---

## TECH STACK

| Layer | Technology |
|---|---|
| Runtime | .NET 8 |
| Framework | ASP.NET Core 8 Web API |
| Architecture | Clean Architecture (4 projects + API host) |
| ORM | EF Core 8 (code-first migrations) |
| Database | SQL Server 2022 |
| Auth | JWT access tokens + refresh tokens (hashed) |
| OAuth | Google + Facebook (token verification via their APIs) |
| Email | SMTP (MailKit) |
| Push Notifications | Firebase Admin SDK (FCM) |
| File Storage | Cloudinary (images, PDFs) |
| PDF Generation | QuestPDF |
| Mediator | MediatR 12 |
| Validation | FluentValidation |
| Mapping | Mapster |
| Background Jobs | External cron-job.org hitting `/api/v1/jobs/run-reminders` |
| Password Hashing | BCrypt.Net-Next (work factor 12) |
| Concurrency | EF Core RowVersion tokens |
| Logging | Serilog (structured, file sink) |
| API Docs | Swagger / Scalar |

---

## SOLUTION STRUCTURE

```
ClinicSystem.sln
├── ClinicSystem.Domain/
├── ClinicSystem.Application/
├── ClinicSystem.Infrastructure/
├── ClinicSystem.Persistence/
└── ClinicSystem.API/
```

---

## DOMAIN LAYER (`ClinicSystem.Domain`)

Contains entities, enums, and domain events. No dependencies on other projects.

```
ClinicSystem.Domain/
├── Entities/
│   ├── User.cs
│   ├── Doctor.cs
│   ├── Service.cs
│   ├── DoctorService.cs
│   ├── DoctorSchedule.cs
│   ├── DoctorBlockedDate.cs
│   ├── DoctorDayStatus.cs
│   ├── Patient.cs
│   ├── Booking.cs
│   ├── Payment.cs
│   ├── PaymentSettings.cs
│   ├── Review.cs
│   ├── Consultation.cs
│   ├── ConsultationAmendment.cs
│   ├── FollowUpReminder.cs
│   ├── VitalSigns.cs
│   ├── Diagnosis.cs
│   ├── ICD10Code.cs
│   ├── Prescription.cs
│   ├── PrescriptionItem.cs
│   ├── Allergy.cs
│   ├── PatientAttachment.cs
│   ├── VaccinationRecord.cs
│   ├── GeneratedDocument.cs
│   ├── Announcement.cs
│   ├── Notification.cs
│   ├── StaffAccount.cs
│   ├── ClinicSettings.cs
│   ├── AuditLog.cs
│   └── FollowUpReminder.cs
├── Enums/
│   ├── Role.cs               — Admin, Staff, Doctor, Patient
│   ├── DoctorStatus.cs       — Active, Inactive, OnLeave
│   ├── BookingStatus.cs      — Pending, ProofSubmitted, Confirmed, OnHold, Cancelled, Completed, Expired, NoShow, Rescheduled
│   ├── PaymentStatus.cs      — Unpaid, Paid, Waived, Refunded
│   ├── PaymentMode.cs        — Online, PayAtClinic
│   ├── PaymentMethod.cs      — GCash, Maya, BankTransfer, PayAtClinic
│   ├── ServiceCategory.cs    — Consultation, Procedure, Laboratory, Diagnostic
│   ├── ProofType.cs          — ReferenceNumber, Screenshot
│   ├── PrescriptionStatus.cs — Active, Filled, Expired, Cancelled
│   ├── DiagnosisType.cs      — Primary, Secondary, Comorbidity
│   ├── AllergenType.cs       — Drug, Food, Environmental, Other
│   ├── AllergySeverity.cs    — Mild, Moderate, Severe
│   ├── AuditAction.cs        — Create, Update, Delete, Waive, Refund, Reschedule, Verify, Cancel
│   ├── DocumentType.cs       — Prescription, MedCert, Referral, VisitSummary, LabReport, PaymentReceipt
│   ├── AuthProvider.cs       — Local, Google, Facebook
│   └── AttachmentType.cs     — CBC, Urinalysis, XRay, ECG, Ultrasound, ReferralLetter, MedCert, VisitSummary, PaymentReceipt, Other
└── Common/
    ├── BaseEntity.cs         — Id (Guid), CreatedAt, UpdatedAt, IsDeleted, DeletedAt
    └── Result.cs             — Result<T> pattern for use case responses
```

### Key Entity Definitions

```csharp
// BaseEntity.cs
public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
}

// User.cs
public class User : BaseEntity
{
    public string FullName { get; set; }
    public string Email { get; set; }
    public string? PasswordHash { get; set; }
    public AuthProvider Provider { get; set; } = AuthProvider.Local;
    public string? ProviderId { get; set; }
    public Role Role { get; set; }
    public bool IsPrimaryAdmin { get; set; } = false;     // immutable after seed
    public string? AvatarUrl { get; set; }
    public bool IsEmailVerified { get; set; } = false;
    public string? EmailVerificationToken { get; set; }
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetExpiresAt { get; set; }
    public string? RefreshToken { get; set; }             // BCrypt hashed
    public DateTime? RefreshTokenExpiresAt { get; set; }
    public int FailedLoginAttempts { get; set; } = 0;
    public DateTime? LockoutUntil { get; set; }
    public bool IsFirstLogin { get; set; } = true;
    public string? InviteToken { get; set; }
    public DateTime? InviteTokenExpiresAt { get; set; }
}

// Doctor.cs
public class Doctor : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; }
    public string FullName { get; set; }
    public string Specialization { get; set; }
    public string? Bio { get; set; }
    public string? ProfilePhotoUrl { get; set; }
    public string? LicenseNumber { get; set; }
    public string? PTRNumber { get; set; }
    public string? S2Number { get; set; }
    public decimal ConsultationFee { get; set; }          // set by Doctor
    public int SlotDurationMinutes { get; set; }          // set by Doctor
    public int SlotCapacity { get; set; }                 // set by Doctor
    public int? DailyPatientLimit { get; set; }           // null = no limit, set by Doctor
    public DoctorStatus Status { get; set; } = DoctorStatus.Active;   // set by Admin
    public ICollection<DoctorService> DoctorServices { get; set; }
    public ICollection<DoctorSchedule> Schedules { get; set; }
    public ICollection<DoctorBlockedDate> BlockedDates { get; set; }
}

// Booking.cs
public class Booking : BaseEntity
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; }
    public Guid DoctorId { get; set; }
    public Doctor Doctor { get; set; }
    public Guid ServiceId { get; set; }
    public Service Service { get; set; }
    public DateOnly AppointmentDate { get; set; }
    public TimeOnly SlotStartTime { get; set; }
    public TimeOnly SlotEndTime { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;
    public PaymentMode PaymentMode { get; set; }
    public int? QueueNumber { get; set; }
    public bool IsWalkIn { get; set; } = false;
    public bool ReminderSent24hr { get; set; } = false;
    public bool ReminderSent1hr { get; set; } = false;
    public string? ReceiptUrl { get; set; }
    public decimal TotalFee { get; set; }                 // locked at creation
    public decimal ConsultationFeeSnapshot { get; set; }
    public decimal ServiceFeeSnapshot { get; set; }
    public ProofType? ProofType { get; set; }
    public string? ProofValue { get; set; }
    public DateTime? ProofSubmittedAt { get; set; }
    public string? CancellationReason { get; set; }
    public string? Notes { get; set; }
    public Guid? RescheduledFromBookingId { get; set; }
    public byte[] RowVersion { get; set; }                // concurrency token
}

// Patient.cs
public class Patient : BaseEntity
{
    public string PatientCode { get; set; }               // PT-2025-00001
    public string FirstName { get; set; }
    public string? MiddleName { get; set; }
    public string LastName { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public string Sex { get; set; }
    public string? CivilStatus { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? ZipCode { get; set; }
    public string? ContactNumber { get; set; }
    public string? Email { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactNumber { get; set; }
    public string? EmergencyContactRelationship { get; set; }
    public string? BloodType { get; set; }
    public string? PhilHealthNumber { get; set; }
    public string? HMOProvider { get; set; }
    public string? HMOCardNumber { get; set; }
    public Guid? UserId { get; set; }
    public bool IsGuest { get; set; } = false;
    public DateTime? ConsentedAt { get; set; }
    public string? ConsentVersion { get; set; }
}
```

---

## APPLICATION LAYER (`ClinicSystem.Application`)

Contains use cases (MediatR commands/queries), DTOs, validators, and interfaces.

```
ClinicSystem.Application/
├── Common/
│   ├── Interfaces/
│   │   ├── IApplicationDbContext.cs
│   │   ├── IEmailService.cs
│   │   ├── IPushNotificationService.cs
│   │   ├── IFileStorageService.cs
│   │   ├── IPdfGeneratorService.cs
│   │   ├── IJwtService.cs
│   │   ├── ICurrentUserService.cs
│   │   └── IAuditService.cs
│   └── Behaviors/
│       ├── ValidationBehavior.cs     — Auto-validates all commands via FluentValidation
│       └── LoggingBehavior.cs
│
├── Auth/
│   ├── Commands/
│   │   ├── RegisterCommand.cs + Handler + Validator
│   │   ├── LoginCommand.cs + Handler + Validator
│   │   ├── GoogleLoginCommand.cs + Handler
│   │   ├── FacebookLoginCommand.cs + Handler
│   │   ├── RefreshTokenCommand.cs + Handler
│   │   ├── LogoutCommand.cs + Handler
│   │   ├── ForgotPasswordCommand.cs + Handler + Validator
│   │   ├── ResetPasswordCommand.cs + Handler + Validator
│   │   ├── SetPasswordCommand.cs + Handler + Validator      — invite token flow
│   │   └── ResendInviteCommand.cs + Handler
│   └── DTOs/
│       ├── LoginResponseDto.cs       — { accessToken, user: { id, role, name, isFirstLogin } }
│       └── AuthUserDto.cs
│
├── Doctors/
│   ├── Commands/
│   │   ├── CreateDoctorCommand.cs + Handler + Validator
│   │   ├── UpdateDoctorProfileCommand.cs + Handler + Validator
│   │   ├── UpdateDoctorStatusCommand.cs + Handler        — Admin only
│   │   ├── UpdateConsultationSettingsCommand.cs + Handler — Doctor (own) | Admin
│   │   ├── CreateDoctorScheduleCommand.cs + Handler
│   │   ├── UpdateDoctorScheduleCommand.cs + Handler
│   │   ├── DeleteDoctorScheduleCommand.cs + Handler
│   │   ├── AddBlockedDateCommand.cs + Handler
│   │   ├── DeleteBlockedDateCommand.cs + Handler
│   │   ├── BlockClinicHolidayCommand.cs + Handler        — Admin only
│   │   └── UpdateDayStatusCommand.cs + Handler           — Admin | Staff | Doctor (own)
│   ├── Queries/
│   │   ├── GetDoctorsQuery.cs + Handler
│   │   ├── GetDoctorByIdQuery.cs + Handler
│   │   ├── GetDoctorAvailabilityQuery.cs + Handler       — returns slot grid data
│   │   └── GetDayStatusQuery.cs + Handler
│   └── DTOs/
│       ├── DoctorDto.cs
│       ├── DoctorAvailabilityDto.cs  — { date, slots: [{ startTime, endTime, status, count }] }
│       └── DoctorDayStatusDto.cs
│
├── Bookings/
│   ├── Commands/
│   │   ├── CreateBookingCommand.cs + Handler + Validator       — Patient
│   │   ├── CreateWalkInBookingCommand.cs + Handler + Validator — Admin | Staff
│   │   ├── SubmitProofCommand.cs + Handler + Validator         — Patient
│   │   ├── ConfirmBookingCommand.cs + Handler                  — Admin | Staff
│   │   ├── RejectBookingCommand.cs + Handler                   — Admin | Staff
│   │   ├── CancelBookingCommand.cs + Handler                   — Patient | Admin | Staff
│   │   ├── RescheduleBookingCommand.cs + Handler + Validator   — Admin | Staff
│   │   ├── CompleteBookingCommand.cs + Handler                 — Admin | Staff | Doctor
│   │   ├── NoShowBookingCommand.cs + Handler                   — Admin | Staff
│   │   ├── ResolveHoldCommand.cs + Handler                     — Admin | Staff
│   │   ├── RefundBookingCommand.cs + Handler + Validator       — Admin
│   │   ├── WaiveBookingCommand.cs + Handler + Validator        — Admin
│   │   └── MarkPaidCommand.cs + Handler                        — Admin | Staff
│   ├── Queries/
│   │   ├── GetBookingsQuery.cs + Handler
│   │   ├── GetBookingByIdQuery.cs + Handler
│   │   ├── GetUnpaidReportQuery.cs + Handler
│   │   └── GetBookingReceiptQuery.cs + Handler
│   └── DTOs/
│       ├── BookingDto.cs
│       ├── BookingSummaryDto.cs
│       └── SlotAvailabilityDto.cs
│
├── Patients/
│   ├── Commands/
│   │   ├── CreatePatientCommand.cs + Handler + Validator
│   │   ├── CreateGuestPatientCommand.cs + Handler
│   │   ├── UpdatePatientCommand.cs + Handler
│   │   ├── UpdatePatientProfileCommand.cs + Handler      — Patient (own)
│   │   ├── DeletePatientCommand.cs + Handler             — Admin
│   │   └── MergePatientsCommand.cs + Handler             — Admin
│   ├── Queries/
│   │   ├── GetPatientsQuery.cs + Handler
│   │   ├── GetPatientByIdQuery.cs + Handler
│   │   ├── SearchPatientsQuery.cs + Handler
│   │   └── GetPatientTimelineQuery.cs + Handler
│   └── DTOs/
│       ├── PatientDto.cs
│       └── PatientSummaryDto.cs
│
├── Consultations/
│   ├── Commands/
│   │   ├── CreateConsultationCommand.cs + Handler + Validator
│   │   ├── UpdateConsultationCommand.cs + Handler        — within 24 hrs
│   │   ├── AmendConsultationCommand.cs + Handler         — after 24 hrs, logged
│   │   └── DeleteConsultationCommand.cs + Handler        — Admin
│   ├── Queries/
│   │   ├── GetConsultationsQuery.cs + Handler
│   │   └── GetConsultationByIdQuery.cs + Handler
│   └── DTOs/
│       └── ConsultationDto.cs
│
├── Prescriptions/
│   ├── Commands/
│   │   ├── CreatePrescriptionCommand.cs + Handler + Validator
│   │   └── CancelPrescriptionCommand.cs + Handler
│   ├── Queries/
│   │   ├── GetPrescriptionsQuery.cs + Handler
│   │   └── GetPrescriptionByIdQuery.cs + Handler
│   └── DTOs/
│       └── PrescriptionDto.cs
│
├── VitalSigns/
│   ├── Commands/
│   │   └── LogVitalSignsCommand.cs + Handler + Validator
│   ├── Queries/
│   │   └── GetVitalSignsQuery.cs + Handler
│   └── DTOs/
│       └── VitalSignsDto.cs
│
├── Diagnoses/
│   ├── Commands/
│   │   ├── AddDiagnosisCommand.cs + Handler
│   │   ├── UpdateDiagnosisCommand.cs + Handler
│   │   └── DeleteDiagnosisCommand.cs + Handler
│   ├── Queries/
│   │   ├── GetDiagnosesQuery.cs + Handler
│   │   └── SearchICD10Query.cs + Handler
│   └── DTOs/
│       └── DiagnosisDto.cs
│
├── Allergies/
│   ├── Commands/ (Add, Update, Delete)
│   ├── Queries/ (GetAllergies)
│   └── DTOs/
│       └── AllergyDto.cs
│
├── Attachments/
│   ├── Commands/ (Add, Update, Delete)
│   ├── Queries/ (GetAttachments)
│   └── DTOs/
│       └── AttachmentDto.cs
│
├── Vaccinations/
│   ├── Commands/ (Log, Delete)
│   ├── Queries/ (GetVaccinations)
│   └── DTOs/
│       └── VaccinationDto.cs
│
├── Reviews/
│   ├── Commands/ (Create, Update, Delete)
│   ├── Queries/ (GetReviews)
│   └── DTOs/
│       └── ReviewDto.cs
│
├── Services/
│   ├── Commands/ (Create, Update, Delete)
│   ├── Queries/ (GetServices)
│   └── DTOs/
│       └── ServiceDto.cs
│
├── Notifications/
│   ├── Queries/ (GetNotifications)
│   ├── Commands/ (MarkRead, MarkAllRead)
│   └── DTOs/
│       └── NotificationDto.cs
│
├── Staff/
│   ├── Commands/ (Create, Update, Delete, UpdateOwnProfile, ResendInvite)
│   ├── Queries/ (GetStaff)
│   └── DTOs/
│       └── StaffDto.cs
│
├── AdminAccounts/
│   ├── Commands/ (Create, Deactivate, UpdateOwnProfile)
│   ├── Queries/ (GetAdmins)
│   └── DTOs/
│       └── AdminDto.cs
│
├── Announcements/
│   ├── Commands/ (Create, Update, Delete)
│   ├── Queries/ (GetAnnouncements)
│   └── DTOs/
│       └── AnnouncementDto.cs
│
├── AuditLogs/
│   ├── Queries/ (GetAuditLogs)
│   └── DTOs/
│       └── AuditLogDto.cs
│
├── Documents/
│   ├── Commands/
│   │   ├── GeneratePrescriptionPdfCommand.cs + Handler
│   │   ├── GenerateMedCertCommand.cs + Handler
│   │   ├── GenerateReferralLetterCommand.cs + Handler
│   │   ├── GenerateVisitSummaryCommand.cs + Handler
│   │   └── GenerateReceiptCommand.cs + Handler
│   └── DTOs/
│       └── GeneratedDocumentDto.cs
│
├── Dashboards/
│   ├── Queries/
│   │   ├── GetAdminDashboardQuery.cs + Handler
│   │   ├── GetBookingCalendarQuery.cs + Handler
│   │   ├── GetFollowUpsPendingQuery.cs + Handler
│   │   └── GetDoctorDashboardQuery.cs + Handler
│   └── DTOs/
│       ├── AdminDashboardDto.cs
│       └── DoctorDashboardDto.cs
│
├── Settings/
│   ├── Commands/ (UpdateSettings, UpdatePrivacyPolicy)
│   ├── Queries/ (GetSettings)
│   └── DTOs/
│       └── ClinicSettingsDto.cs
│
└── Jobs/
    └── Commands/
        └── RunRemindersCommand.cs + Handler
```

---

## INFRASTRUCTURE LAYER (`ClinicSystem.Infrastructure`)

Implements interfaces defined in Application. No EF Core here.

```
ClinicSystem.Infrastructure/
├── Email/
│   └── SmtpEmailService.cs           — MailKit, templates per notification type
├── Push/
│   └── FcmPushNotificationService.cs — Firebase Admin SDK
├── FileStorage/
│   └── CloudinaryFileStorageService.cs — Upload, delete; validates MIME + size
├── PdfGeneration/
│   ├── QuestPdfGeneratorService.cs
│   ├── Templates/
│   │   ├── PrescriptionTemplate.cs
│   │   ├── MedCertTemplate.cs
│   │   ├── ReferralLetterTemplate.cs
│   │   ├── VisitSummaryTemplate.cs
│   │   └── ReceiptTemplate.cs
│   └── PdfTemplateHelper.cs          — Injects clinic logo, header, footer from ClinicSettings
├── Auth/
│   ├── JwtService.cs                 — Generate + validate access tokens
│   ├── GoogleAuthService.cs          — Verify Google ID token
│   └── FacebookAuthService.cs        — Verify Facebook access token
└── Audit/
    └── AuditService.cs               — Builds + writes AuditLog entries
```

---

## PERSISTENCE LAYER (`ClinicSystem.Persistence`)

EF Core DbContext, configurations, repositories, migrations, seeders.

```
ClinicSystem.Persistence/
├── AppDbContext.cs
├── Configurations/                   — IEntityTypeConfiguration<T> per entity
│   ├── UserConfiguration.cs
│   ├── DoctorConfiguration.cs
│   ├── ServiceConfiguration.cs
│   ├── DoctorServiceConfiguration.cs
│   ├── DoctorScheduleConfiguration.cs
│   ├── DoctorBlockedDateConfiguration.cs
│   ├── DoctorDayStatusConfiguration.cs
│   ├── PatientConfiguration.cs
│   ├── BookingConfiguration.cs       — RowVersion concurrency token configured here
│   ├── PaymentConfiguration.cs
│   ├── PaymentSettingsConfiguration.cs
│   ├── ReviewConfiguration.cs        — Unique index on BookingId
│   ├── ConsultationConfiguration.cs
│   ├── ConsultationAmendmentConfiguration.cs
│   ├── FollowUpReminderConfiguration.cs
│   ├── VitalSignsConfiguration.cs
│   ├── DiagnosisConfiguration.cs
│   ├── ICD10CodeConfiguration.cs
│   ├── PrescriptionConfiguration.cs
│   ├── PrescriptionItemConfiguration.cs
│   ├── AllergyConfiguration.cs
│   ├── PatientAttachmentConfiguration.cs
│   ├── VaccinationRecordConfiguration.cs
│   ├── GeneratedDocumentConfiguration.cs
│   ├── AnnouncementConfiguration.cs
│   ├── NotificationConfiguration.cs
│   ├── StaffAccountConfiguration.cs
│   ├── ClinicSettingsConfiguration.cs
│   └── AuditLogConfiguration.cs
├── Repositories/
│   └── (optional) — most queries are done via IApplicationDbContext directly in handlers
├── Migrations/
│   └── (EF Core generated)
└── Seeders/
    ├── AdminSeeder.cs                — Primary Admin + Admin2 + Staff
    ├── DoctorSeeder.cs               — 3 sample doctors with schedules + settings
    ├── ServiceSeeder.cs              — 10 sample services across all categories
    ├── PatientSeeder.cs              — 5 patients with full records
    ├── BookingSeeder.cs              — 2 completed + 1 walk-in + 1 rescheduled + 1 waived per patient
    ├── ICD10Seeder.cs                — 500 common codes (GP, Pediatrics, OB-Gyn)
    └── ClinicSettingsSeeder.cs       — Operating hours, consent version, flags
```

### AppDbContext key configuration
```csharp
// BookingConfiguration.cs — RowVersion concurrency token
builder.Property(b => b.RowVersion)
       .IsRowVersion()
       .IsConcurrencyToken();

// ReviewConfiguration.cs — one review per booking
builder.HasIndex(r => r.BookingId).IsUnique();

// DoctorDayStatusConfiguration.cs — one record per doctor per date
builder.HasIndex(d => new { d.DoctorId, d.StatusDate }).IsUnique();

// PatientConfiguration.cs — unique PatientCode
builder.HasIndex(p => p.PatientCode).IsUnique();
```

---

## API LAYER (`ClinicSystem.API`)

```
ClinicSystem.API/
├── Controllers/
│   ├── AuthController.cs
│   ├── DoctorsController.cs
│   ├── ServicesController.cs
│   ├── BookingsController.cs
│   ├── PatientsController.cs
│   ├── ConsultationsController.cs
│   ├── VitalSignsController.cs
│   ├── DiagnosesController.cs
│   ├── PrescriptionsController.cs
│   ├── AllergiesController.cs
│   ├── AttachmentsController.cs
│   ├── VaccinationsController.cs
│   ├── ReviewsController.cs
│   ├── AnnouncementsController.cs
│   ├── NotificationsController.cs
│   ├── StaffController.cs
│   ├── AdminsController.cs
│   ├── AuditLogsController.cs
│   ├── DocumentsController.cs
│   ├── PaymentsController.cs
│   ├── DashboardController.cs
│   ├── SettingsController.cs
│   └── JobsController.cs
├── Middleware/
│   ├── GlobalExceptionMiddleware.cs  — Never expose stack traces; structured error responses
│   └── CurrentUserMiddleware.cs      — Sets ICurrentUserService from JWT claims
├── Extensions/
│   ├── ServiceCollectionExtensions.cs
│   └── ApplicationBuilderExtensions.cs
└── Program.cs
```

### Controller Pattern (example)
```csharp
[ApiController]
[Route("api/v1/bookings")]
public class BookingsController : ControllerBase
{
    private readonly ISender _mediator;

    [HttpPost]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingCommand command)
    {
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblemResult();
    }

    [HttpPut("{id}/confirm")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> ConfirmBooking(Guid id)
    {
        var result = await _mediator.Send(new ConfirmBookingCommand { BookingId = id });
        return result.IsSuccess ? Ok() : result.ToProblemResult();
    }
}
```

---

## DATABASE TABLES (Full Schema)

### Users
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| FullName | nvarchar(200) | |
| Email | nvarchar(256) UNIQUE | |
| PasswordHash | nvarchar(max) NULL | null for OAuth users |
| Provider | nvarchar(20) | Local / Google / Facebook |
| ProviderId | nvarchar(256) NULL | |
| Role | nvarchar(20) | Admin / Staff / Doctor / Patient |
| IsPrimaryAdmin | bit | default 0; immutable after seed |
| AvatarUrl | nvarchar(500) NULL | |
| IsEmailVerified | bit | default 0 |
| EmailVerificationToken | nvarchar(500) NULL | |
| PasswordResetToken | nvarchar(500) NULL | |
| PasswordResetExpiresAt | datetime2 NULL | |
| RefreshToken | nvarchar(max) NULL | BCrypt hashed |
| RefreshTokenExpiresAt | datetime2 NULL | |
| FailedLoginAttempts | int | default 0 |
| LockoutUntil | datetime2 NULL | |
| IsFirstLogin | bit | default 1 |
| InviteToken | nvarchar(500) NULL | |
| InviteTokenExpiresAt | datetime2 NULL | |
| CreatedAt | datetime2 | |
| UpdatedAt | datetime2 | |
| IsDeleted | bit | default 0 |
| DeletedAt | datetime2 NULL | |

### Doctors
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| UserId | uniqueidentifier FK → Users | |
| FullName | nvarchar(200) | |
| Specialization | nvarchar(200) | |
| Bio | nvarchar(max) NULL | |
| ProfilePhotoUrl | nvarchar(500) NULL | |
| LicenseNumber | nvarchar(100) NULL | |
| PTRNumber | nvarchar(100) NULL | |
| S2Number | nvarchar(100) NULL | |
| ConsultationFee | decimal(10,2) | set by Doctor |
| SlotDurationMinutes | int | set by Doctor |
| SlotCapacity | int | set by Doctor |
| DailyPatientLimit | int NULL | null = no limit; set by Doctor |
| Status | nvarchar(20) | Active / Inactive / OnLeave; set by Admin |
| CreatedAt | datetime2 | |
| UpdatedAt | datetime2 | |
| IsDeleted | bit | |
| DeletedAt | datetime2 NULL | |

### Services
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| Name | nvarchar(200) | |
| Description | nvarchar(max) NULL | |
| EstimatedDurationMinutes | int | |
| Price | decimal(10,2) | |
| Category | nvarchar(20) | Consultation / Procedure / Laboratory / Diagnostic |
| CreatedAt | datetime2 | |
| UpdatedAt | datetime2 | |
| IsDeleted | bit | |
| DeletedAt | datetime2 NULL | |

### DoctorServices
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| DoctorId | uniqueidentifier FK → Doctors | |
| ServiceId | uniqueidentifier FK → Services | |
| CreatedAt | datetime2 | |

### DoctorSchedules
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| DoctorId | uniqueidentifier FK → Doctors | |
| DayOfWeek | int | 0=Sun … 6=Sat |
| StartTime | time | |
| EndTime | time | |
| IsActive | bit | default 1 |
| SetByUserId | uniqueidentifier FK → Users | tracks Admin vs Doctor |
| CreatedAt | datetime2 | |
| UpdatedAt | datetime2 | |

### DoctorBlockedDates
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| DoctorId | uniqueidentifier FK → Doctors | |
| BlockedDate | date | |
| Reason | nvarchar(500) NULL | |
| BlockedByUserId | uniqueidentifier FK → Users | |
| IsClinicHoliday | bit | default 0 |
| CreatedAt | datetime2 | |

### DoctorDayStatuses
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| DoctorId | uniqueidentifier FK → Doctors | |
| StatusDate | date | UNIQUE with DoctorId |
| RunningLate | bit | default 0 |
| EstimatedDelayMinutes | int NULL | |
| UnavailableToday | bit | default 0 |
| SetByUserId | uniqueidentifier FK → Users | |
| CreatedAt | datetime2 | |
| UpdatedAt | datetime2 | |

### Patients
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| PatientCode | nvarchar(20) UNIQUE | PT-2025-00001 |
| FirstName | nvarchar(100) | |
| MiddleName | nvarchar(100) NULL | |
| LastName | nvarchar(100) | |
| DateOfBirth | date | |
| Sex | nvarchar(20) | |
| CivilStatus | nvarchar(50) NULL | |
| Address | nvarchar(500) NULL | |
| City | nvarchar(200) NULL | |
| ZipCode | nvarchar(20) NULL | |
| ContactNumber | nvarchar(50) NULL | |
| Email | nvarchar(256) NULL | |
| EmergencyContactName | nvarchar(200) NULL | |
| EmergencyContactNumber | nvarchar(50) NULL | |
| EmergencyContactRelationship | nvarchar(100) NULL | |
| BloodType | nvarchar(10) NULL | |
| PhilHealthNumber | nvarchar(100) NULL | |
| HMOProvider | nvarchar(200) NULL | |
| HMOCardNumber | nvarchar(100) NULL | |
| UserId | uniqueidentifier NULL FK → Users | |
| IsGuest | bit | default 0 |
| ConsentedAt | datetime2 NULL | |
| ConsentVersion | nvarchar(20) NULL | |
| CreatedAt | datetime2 | |
| UpdatedAt | datetime2 | |
| IsDeleted | bit | |
| DeletedAt | datetime2 NULL | |

### Bookings
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| PatientId | uniqueidentifier FK → Patients | |
| DoctorId | uniqueidentifier FK → Doctors | |
| ServiceId | uniqueidentifier FK → Services | |
| AppointmentDate | date | |
| SlotStartTime | time | |
| SlotEndTime | time | |
| Status | nvarchar(30) | see BookingStatus enum |
| PaymentStatus | nvarchar(20) | Unpaid / Paid / Waived / Refunded |
| PaymentMode | nvarchar(20) | Online / PayAtClinic |
| QueueNumber | int NULL | assigned on Confirmed |
| IsWalkIn | bit | default 0 |
| ReminderSent24hr | bit | default 0 |
| ReminderSent1hr | bit | default 0 |
| ReceiptUrl | nvarchar(500) NULL | |
| TotalFee | decimal(10,2) | locked at creation |
| ConsultationFeeSnapshot | decimal(10,2) | |
| ServiceFeeSnapshot | decimal(10,2) | |
| ProofType | nvarchar(20) NULL | |
| ProofValue | nvarchar(max) NULL | |
| ProofSubmittedAt | datetime2 NULL | |
| CancellationReason | nvarchar(max) NULL | |
| Notes | nvarchar(max) NULL | |
| RescheduledFromBookingId | uniqueidentifier NULL FK → Bookings | |
| RowVersion | rowversion | concurrency token |
| CreatedAt | datetime2 | |
| UpdatedAt | datetime2 | |
| IsDeleted | bit | |
| DeletedAt | datetime2 NULL | |

### Payments
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| BookingId | uniqueidentifier FK → Bookings | |
| Amount | decimal(10,2) | |
| PaymentMethod | nvarchar(30) | |
| ReferenceNumber | nvarchar(200) NULL | |
| ProofImageUrl | nvarchar(500) NULL | |
| Status | nvarchar(20) | Pending / Verified / Rejected / Refunded / Waived |
| ORNumber | nvarchar(50) NULL | OR-2025-00001 |
| ORSequence | int | auto-increment per clinic |
| VerifiedByUserId | uniqueidentifier NULL FK → Users | |
| VerifiedAt | datetime2 NULL | |
| WaivedByUserId | uniqueidentifier NULL FK → Users | |
| WaivedAt | datetime2 NULL | |
| WaivedReason | nvarchar(max) NULL | required when Waived |
| RefundedByUserId | uniqueidentifier NULL FK → Users | |
| RefundedAt | datetime2 NULL | |
| RefundReason | nvarchar(max) NULL | required when Refunded |
| CreatedAt | datetime2 | |
| UpdatedAt | datetime2 | |

### Reviews
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| PatientId | uniqueidentifier FK → Patients | |
| DoctorId | uniqueidentifier FK → Doctors | |
| BookingId | uniqueidentifier FK → Bookings UNIQUE | one review per booking |
| Rating | int | 1–5 |
| Comment | nvarchar(max) NULL | |
| CreatedAt | datetime2 | |
| UpdatedAt | datetime2 | |
| IsDeleted | bit | |
| DeletedAt | datetime2 NULL | |

### Consultations
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| PatientId | uniqueidentifier FK → Patients | |
| DoctorId | uniqueidentifier FK → Doctors | |
| BookingId | uniqueidentifier NULL FK → Bookings | |
| ConsultationDate | date | |
| ConsultationTime | time | |
| ChiefComplaint | nvarchar(max) | |
| HistoryOfPresentIllness | nvarchar(max) NULL | |
| PEGeneralFindings | nvarchar(max) NULL | |
| PEHEENTFindings | nvarchar(max) NULL | |
| PEChestFindings | nvarchar(max) NULL | |
| PEAbdomenFindings | nvarchar(max) NULL | |
| PEExtremitiesFindings | nvarchar(max) NULL | |
| PENeurologicalFindings | nvarchar(max) NULL | |
| Assessment | nvarchar(max) NULL | |
| Plan | nvarchar(max) NULL | |
| FollowUpDate | date NULL | triggers FollowUpReminder |
| IsLocked | bit | true after 24 hours |
| VisitSummaryUrl | nvarchar(500) NULL | |
| CreatedAt | datetime2 | |
| UpdatedAt | datetime2 | |
| IsDeleted | bit | |
| DeletedAt | datetime2 NULL | |

### ConsultationAmendments
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| ConsultationId | uniqueidentifier FK → Consultations | |
| FieldName | nvarchar(100) | |
| OldValue | nvarchar(max) NULL | |
| NewValue | nvarchar(max) NULL | |
| AmendedByUserId | uniqueidentifier FK → Users | |
| AmendedAt | datetime2 | |
| Reason | nvarchar(max) | required |

### FollowUpReminders
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| ConsultationId | uniqueidentifier FK → Consultations | |
| PatientId | uniqueidentifier FK → Patients | |
| DoctorId | uniqueidentifier FK → Doctors | |
| FollowUpDate | date | |
| ReminderSent3Day | bit | default 0 |
| ReminderSent1Day | bit | default 0 |
| IsBookedByPatient | bit | default 0 |
| CreatedAt | datetime2 | |

### VitalSigns
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| ConsultationId | uniqueidentifier FK → Consultations | |
| PatientId | uniqueidentifier FK → Patients | |
| BloodPressureSystolic | int NULL | |
| BloodPressureDiastolic | int NULL | |
| HeartRate | int NULL | |
| RespiratoryRate | int NULL | |
| Temperature | decimal(5,2) NULL | Celsius |
| OxygenSaturation | decimal(5,2) NULL | |
| Weight | decimal(6,2) NULL | kg |
| Height | decimal(6,2) NULL | cm |
| BMI | decimal(5,2) NULL | computed |
| CreatedAt | datetime2 | |

### Diagnoses
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| ConsultationId | uniqueidentifier FK → Consultations | |
| PatientId | uniqueidentifier FK → Patients | |
| ICD10Code | nvarchar(20) | |
| ICD10Description | nvarchar(500) | |
| DiagnosisType | nvarchar(20) | Primary / Secondary / Comorbidity |
| IsActive | bit | default 1 |
| ResolvedDate | date NULL | |
| CreatedAt | datetime2 | |
| UpdatedAt | datetime2 | |

### ICD10Codes
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| Code | nvarchar(20) UNIQUE | |
| Description | nvarchar(500) | |
| Category | nvarchar(100) NULL | |

### Prescriptions
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| ConsultationId | uniqueidentifier NULL FK → Consultations | |
| PatientId | uniqueidentifier FK → Patients | |
| DoctorId | uniqueidentifier FK → Doctors | |
| PrescriptionDate | date | |
| Status | nvarchar(20) | Active / Filled / Expired / Cancelled |
| Notes | nvarchar(max) NULL | |
| CreatedAt | datetime2 | |
| UpdatedAt | datetime2 | |
| IsDeleted | bit | |
| DeletedAt | datetime2 NULL | |

### PrescriptionItems
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| PrescriptionId | uniqueidentifier FK → Prescriptions | |
| GenericName | nvarchar(200) | |
| BrandName | nvarchar(200) NULL | |
| DosageForm | nvarchar(100) | |
| Strength | nvarchar(100) | |
| Quantity | int | |
| Sig | nvarchar(500) | dosing instructions |
| IsControlledSubstance | bit | default 0 |

### Allergies
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| PatientId | uniqueidentifier FK → Patients | |
| AllergenName | nvarchar(200) | |
| AllergenType | nvarchar(30) | Drug / Food / Environmental / Other |
| Severity | nvarchar(20) | Mild / Moderate / Severe |
| ReactionDescription | nvarchar(max) NULL | |
| CreatedAt | datetime2 | |
| UpdatedAt | datetime2 | |
| IsDeleted | bit | |
| DeletedAt | datetime2 NULL | |

### PatientAttachments
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| PatientId | uniqueidentifier FK → Patients | |
| ConsultationId | uniqueidentifier NULL FK → Consultations | |
| AttachmentType | nvarchar(30) | see AttachmentType enum |
| FileName | nvarchar(500) | |
| FileUrl | nvarchar(500) | Cloudinary URL |
| MimeType | nvarchar(100) | |
| FileSizeBytes | bigint | |
| DateTaken | date NULL | |
| Remarks | nvarchar(max) NULL | |
| InterpretationNotes | nvarchar(max) NULL | |
| UploadedByUserId | uniqueidentifier FK → Users | |
| CreatedAt | datetime2 | |
| UpdatedAt | datetime2 | |
| IsDeleted | bit | |
| DeletedAt | datetime2 NULL | |

### VaccinationRecords
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| PatientId | uniqueidentifier FK → Patients | |
| VaccineName | nvarchar(200) | |
| BrandName | nvarchar(200) NULL | |
| DoseNumber | int NULL | |
| LotNumber | nvarchar(100) NULL | |
| DateAdministered | date | |
| AdministeredByUserId | uniqueidentifier FK → Users | |
| NextDoseDate | date NULL | |
| NextDoseReminderSent | bit | default 0 |
| CreatedAt | datetime2 | |
| UpdatedAt | datetime2 | |
| IsDeleted | bit | |
| DeletedAt | datetime2 NULL | |

### GeneratedDocuments
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| PatientId | uniqueidentifier FK → Patients | |
| ConsultationId | uniqueidentifier NULL FK → Consultations | |
| BookingId | uniqueidentifier NULL FK → Bookings | |
| DocumentType | nvarchar(30) | see DocumentType enum |
| FileUrl | nvarchar(500) | Cloudinary URL |
| GeneratedByUserId | uniqueidentifier FK → Users | |
| CreatedAt | datetime2 | |

### AuditLogs
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| EntityType | nvarchar(100) | e.g. Booking, Consultation, Payment |
| EntityId | nvarchar(100) | |
| Action | nvarchar(30) | see AuditAction enum |
| OldValues | nvarchar(max) NULL | JSON |
| NewValues | nvarchar(max) NULL | JSON |
| PerformedByUserId | uniqueidentifier NULL FK → Users | |
| PerformedByName | nvarchar(200) | snapshot |
| PerformedByRole | nvarchar(20) | snapshot |
| PerformedAt | datetime2 | |
| IPAddress | nvarchar(50) NULL | |

### Notifications
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| UserId | uniqueidentifier FK → Users | |
| Title | nvarchar(200) | |
| Message | nvarchar(max) | |
| IsRead | bit | default 0 |
| CreatedAt | datetime2 | |

### StaffAccounts
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| UserId | uniqueidentifier FK → Users | |
| AddedByAdminId | uniqueidentifier FK → Users | |
| IsActive | bit | default 1 |
| CreatedAt | datetime2 | |

### ClinicSettings (single-row table)
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| ClinicName | nvarchar(200) | |
| LogoUrl | nvarchar(500) NULL | |
| PrimaryColor | nvarchar(10) | hex |
| SecondaryColor | nvarchar(10) | hex |
| Address | nvarchar(500) NULL | |
| Phone | nvarchar(50) NULL | |
| Email | nvarchar(256) NULL | |
| FacebookUrl | nvarchar(500) NULL | |
| InstagramUrl | nvarchar(500) NULL | |
| LicenseNumber | nvarchar(100) NULL | |
| OperatingHours | nvarchar(max) | JSON object |
| CancellationDeadlineHours | int | default 24 |
| PatientPortalEnabled | bit | default 1 |
| VaccinationReminderEnabled | bit | default 1 |
| FollowUpReminderEnabled | bit | default 1 |
| IsPayAtClinicMode | bit | default 0 |
| PayAtClinicNoShowWindowMinutes | int | default 60 |
| DocumentHeaderHtml | nvarchar(max) NULL | |
| DocumentFooterHtml | nvarchar(max) NULL | |
| PrivacyPolicyText | nvarchar(max) NULL | |
| ConsentVersion | nvarchar(20) | default "v1.0" |
| UpdatedAt | datetime2 | |

### PaymentSettings (single-row table)
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| GCashQrImageUrl | nvarchar(500) NULL | |
| GCashAccountName | nvarchar(200) NULL | |
| GCashNumber | nvarchar(50) NULL | |
| MayaQrImageUrl | nvarchar(500) NULL | |
| MayaAccountName | nvarchar(200) NULL | |
| MayaNumber | nvarchar(50) NULL | |
| BankName | nvarchar(200) NULL | |
| BankAccountName | nvarchar(200) NULL | |
| BankAccountNumber | nvarchar(100) NULL | |
| IsPayAtClinicMode | bit | default 0 |
| UpdatedAt | datetime2 | |

### Announcements
| Column | Type | Notes |
|---|---|---|
| Id | uniqueidentifier PK | |
| Title | nvarchar(200) | |
| Body | nvarchar(max) | |
| ImageUrl | nvarchar(500) NULL | |
| IsActive | bit | default 1 |
| CreatedAt | datetime2 | |
| UpdatedAt | datetime2 | |

---

## BUSINESS RULES (key)

### TotalFee Computation
```csharp
booking.ConsultationFeeSnapshot = doctor.ConsultationFee;
booking.ServiceFeeSnapshot = service.Category == ServiceCategory.Consultation
    ? 0
    : service.Price;
booking.TotalFee = booking.ConsultationFeeSnapshot + booking.ServiceFeeSnapshot;
```

### Booking Concurrency (Serializable transaction)
```csharp
// Inside CreateBookingHandler
await using var transaction = await _context.Database.BeginTransactionAsync(
    IsolationLevel.Serializable, cancellationToken);

// 1. ResolveStaleBookings(doctorId, date) — expire old Pending slots
// 2. Count active bookings for this slot
// 3. Check slot count >= SlotCapacity → 409
// 4. Check daily count >= DailyPatientLimit (if not null) → 409
// 5. Check DoctorDayStatuses.UnavailableToday → 409
// 6. Set status = Pending, CreatedAt = now (10-min expiry)
// 7. Commit
```

### Doctor Ownership Enforcement
```csharp
// In UpdateConsultationSettingsHandler
var doctorUserId = await _context.Doctors
    .Where(d => d.Id == command.DoctorId)
    .Select(d => d.UserId)
    .FirstOrDefaultAsync();

if (_currentUser.Role == Role.Doctor && _currentUser.UserId != doctorUserId)
    return Result.Failure("Access denied: doctors can only modify their own settings.");
```

### Consultation Lock (Lazy)
```csharp
// In ResolveStaleBookings or on consultation read
if (!consultation.IsLocked && consultation.CreatedAt < DateTime.UtcNow.AddHours(-24))
    consultation.IsLocked = true;
```

### Doctor Cross-Access
```csharp
// Triggered when CreateConsultation is called for a patient
// NOT on booking creation
// In GetPatientsQuery (Doctor role):
.Where(p => _context.Consultations
    .Any(c => c.PatientId == p.Id && c.DoctorId == currentDoctorId))
```

---

## BACKGROUND JOBS

### Lazy Expiry — `ResolveStaleBookings(Guid doctorId, DateOnly date)`
Called at the top of any handler returning booking/slot data.

| Condition | Action |
|---|---|
| Pending + CreatedAt > 10 min old | → Expired, slot released |
| ProofSubmitted + ProofSubmittedAt > 1 hr old | → OnHold |
| Confirmed + PayAtClinic + Unpaid + SlotStartTime past window | → NoShow |

### Cron Job Endpoint
```
POST /api/v1/jobs/run-reminders
Header: X-Cron-Secret: {secret}
Schedule: every 30 minutes
```
Sends: 24hr reminders, 1hr reminders, follow-up 3-day reminders, follow-up 1-day reminders, vaccination reminders, daily unpaid summary.

### Fire-and-Forget
```csharp
_ = _notificationService.SendAsync(notification)
      .ContinueWith(t => _logger.LogError(t.Exception, "Notification failed"),
                    TaskContinuationOptions.OnlyOnFaulted);
```

---

## SECURITY

- JWT access tokens: 15-minute expiry, signed with HMAC-SHA256
- Refresh tokens: 7-day expiry, stored BCrypt-hashed in DB, rotated on each use
- BCrypt password hashing: work factor 12
- Account lockout: 5 failed attempts → 5-minute lockout (`LockoutUntil`)
- Rate limiting on auth endpoints (ASP.NET Core built-in)
- FluentValidation on all commands
- `IsPrimaryAdmin` flag: never settable via API (seeded only)
- Doctor ownership: validated by JWT claim inside handler, not just route param
- File uploads: MIME type + size validation before Cloudinary
- Global exception middleware: never exposes stack traces
- Sensitive fields (tokens, hashes): never returned in any DTO
- EF Core parameterized queries only
- All medical record access + booking/payment actions logged to AuditLogs
