# Plan de Transformación SaaS - Training App

## Resumen Ejecutivo

Transformar la aplicación de entrenamiento "TeamTrainer" de una solución single-tenant para un equipo específico a una plataforma SaaS multi-tenant, multi-deporte, profesional y escalable.

---

## 1. Análisis del Estado Actual

### 1.1 Lo que ya existe (Fortalezas)
- ✅ Sistema de autenticación JWT funcional
- ✅ Panel de administración completo para gestión de contenido
- ✅ Sistema de ejercicios, drills y videos
- ✅ Tracking de workouts con análisis
- ✅ Leaderboard y sistema de puntos configurable
- ✅ Sistema de categorías de edad (parcialmente SaaS-ready)
- ✅ Branding dinámico (colores, logo, favicon)
- ✅ Internacionalización (EN/DE)
- ✅ Integración con AI (OpenAI)
- ✅ Sistema de notificaciones
- ✅ Gestión de equipamiento

### 1.2 Problemas Críticos para SaaS

| Problema | Impacto | Prioridad |
|----------|---------|-----------|
| Sin multi-tenancy | Los datos no están aislados por organización | CRÍTICO |
| Sin sistema de pagos | No hay forma de monetizar | CRÍTICO |
| Valores hardcodeados | "Rhinos", colores, posiciones de fútbol americano | ALTO |
| Sin landing page | No hay punto de entrada público | ALTO |
| Sin roles jerárquicos | Solo player/coach, falta super-admin | ALTO |
| Sin invitaciones | No hay forma de invitar usuarios a una org | MEDIO |
| Sin auditoría | No hay logs de acciones | MEDIO |

### 1.3 Valores Hardcodeados Identificados

```
- "Rhinos" → Nombre del equipo (8+ apariciones)
- "RHINOS2025" → Código de coach
- "#203731", "#FFB612" → Colores del equipo
- "rhinos-training" → Base de datos MongoDB
- "rhinos-training" → Folder de Cloudinary
- Posiciones de fútbol americano (RB, WR, LB, DB, QB)
- Rutas/coverages específicas de football
```

---

## 2. Arquitectura SaaS Propuesta

### 2.1 Jerarquía de Entidades

```
┌─────────────────────────────────────────────────────────────┐
│                     PLATFORM (SaaS Global)                   │
│  - Super Admins                                              │
│  - Global Settings                                           │
│  - Sports Catalog                                            │
│  - Subscription Plans                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ORGANIZATION (Club/Equipo)                │
│  - ID único, slug (para URLs)                               │
│  - Nombre, branding (logo, colores)                         │
│  - Deporte principal                                        │
│  - Plan de suscripción                                      │
│  - Límites (seats, storage)                                 │
│  - Owner + Admins                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         TEAMS                                │
│  - Múltiples equipos por organización                       │
│  - Categoría de edad (U13, U15, Seniors, etc.)              │
│  - Coaches asignados                                         │
│  - Settings específicos                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         MEMBERS                              │
│  - Players & Coaches                                         │
│  - Posición (según deporte)                                  │
│  - Categoría de edad                                         │
│  - Stats, workouts, progress                                 │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Sistema de Deportes Multi-Sport

```typescript
// Estructura de Deporte
interface Sport {
  id: string;
  name: string;                    // "Football Americano", "Baloncesto", etc.
  slug: string;                    // "american-football", "basketball"
  icon: string;                    // Icono del deporte
  positions: SportPosition[];      // Posiciones específicas
  ageCategories: AgeCategory[];    // Categorías de edad
  metrics: SportMetric[];          // Métricas específicas (40yd dash, vertical, etc.)
  trainingTypes: TrainingType[];   // Tipos de entrenamiento
}

interface SportPosition {
  id: string;
  name: string;                    // "Quarterback", "Point Guard"
  abbreviation: string;            // "QB", "PG"
  group?: string;                  // "Offense", "Defense", "Backcourt"
}

interface AgeCategory {
  id: string;
  name: string;                    // "Under 13", "Seniors"
  code: string;                    // "U13", "SEN"
  minAge?: number;
  maxAge?: number;
}
```

### 2.3 Catálogo de Deportes Inicial

#### Fútbol Americano
```yaml
Sport: American Football
Positions:
  Offense:
    - QB (Quarterback)
    - RB (Running Back)
    - FB (Fullback)
    - WR (Wide Receiver)
    - TE (Tight End)
    - OL (Offensive Line)
    - C (Center)
    - OT (Offensive Tackle)
    - OG (Offensive Guard)
  Defense:
    - DL (Defensive Line)
    - DE (Defensive End)
    - DT (Defensive Tackle)
    - LB (Linebacker)
    - MLB (Middle Linebacker)
    - OLB (Outside Linebacker)
    - DB (Defensive Back)
    - CB (Cornerback)
    - S (Safety)
    - FS (Free Safety)
    - SS (Strong Safety)
  Special Teams:
    - K (Kicker)
    - P (Punter)
    - LS (Long Snapper)

Age Categories:
  - U11 (Flag Football)
  - U13 (Youth)
  - U15 (Junior)
  - U17 (Juvenile)
  - U19 (Junior)
  - Seniors (Adult)
  - Masters (35+)

Metrics:
  - 40 Yard Dash
  - Vertical Jump
  - Broad Jump
  - 3 Cone Drill
  - Pro Agility (5-10-5)
  - Bench Press (225lbs reps)
```

#### Baloncesto
```yaml
Sport: Basketball
Positions:
  - PG (Point Guard)
  - SG (Shooting Guard)
  - SF (Small Forward)
  - PF (Power Forward)
  - C (Center)

Age Categories:
  - Mini (U10)
  - PreMini (U12)
  - Infantil (U14)
  - Cadete (U16)
  - Junior (U18)
  - Sub-22 (U22)
  - Senior
  - +35

Metrics:
  - Lane Agility
  - 3/4 Court Sprint
  - Vertical Jump (No Step)
  - Vertical Jump (Max)
  - Bench Press
  - Standing Reach
```

#### Fútbol
```yaml
Sport: Soccer/Football
Positions:
  Goalkeepers:
    - GK (Goalkeeper)
  Defenders:
    - CB (Center Back)
    - LB (Left Back)
    - RB (Right Back)
    - SW (Sweeper)
  Midfielders:
    - CDM (Defensive Midfielder)
    - CM (Central Midfielder)
    - CAM (Attacking Midfielder)
    - LM (Left Midfielder)
    - RM (Right Midfielder)
  Forwards:
    - ST (Striker)
    - CF (Center Forward)
    - LW (Left Wing)
    - RW (Right Wing)

Age Categories:
  - Prebenjamín (U8)
  - Benjamín (U10)
  - Alevín (U12)
  - Infantil (U14)
  - Cadete (U16)
  - Juvenil (U18)
  - Senior
  - Veterano (+35)

Metrics:
  - 30m Sprint
  - Yo-Yo Intermittent Recovery
  - Vertical Jump
  - Agility T-Test
  - VO2 Max estimate
```

#### Balonmano (Handball)
```yaml
Sport: Handball
Positions:
  - GK (Goalkeeper)
  - LW (Left Wing)
  - RW (Right Wing)
  - LB (Left Back)
  - CB (Center Back)
  - RB (Right Back)
  - P (Pivot/Line Player)

Age Categories:
  - Mini (U10)
  - Benjamín (U12)
  - Alevín (U14)
  - Infantil (U16)
  - Cadete (U18)
  - Juvenil (U20)
  - Senior
  - Veterano (+35)

Metrics:
  - 30m Sprint
  - Throwing Velocity
  - Vertical Jump
  - T-Test
  - Beep Test
```

#### Rugby
```yaml
Sport: Rugby
Positions:
  Forwards:
    - 1 (Loosehead Prop)
    - 2 (Hooker)
    - 3 (Tighthead Prop)
    - 4 (Lock)
    - 5 (Lock)
    - 6 (Blindside Flanker)
    - 7 (Openside Flanker)
    - 8 (Number Eight)
  Backs:
    - 9 (Scrum-half)
    - 10 (Fly-half)
    - 11 (Left Wing)
    - 12 (Inside Centre)
    - 13 (Outside Centre)
    - 14 (Right Wing)
    - 15 (Fullback)

Age Categories:
  - U6 (Tag Rugby)
  - U8
  - U10
  - U12
  - U14
  - U16
  - U18
  - U20 (Colts)
  - Senior
  - Veterans (+35)

Metrics:
  - 40m Sprint
  - Yo-Yo Test
  - Vertical Jump
  - Bench Press
  - Back Squat
  - Prone Row
```

#### Voleibol
```yaml
Sport: Volleyball
Positions:
  - S (Setter)
  - OH (Outside Hitter)
  - OPP (Opposite)
  - MB (Middle Blocker)
  - L (Libero)

Age Categories:
  - Alevín (U12)
  - Infantil (U14)
  - Cadete (U16)
  - Juvenil (U18)
  - Junior (U21)
  - Senior
  - Veterano

Metrics:
  - Vertical Jump (Block)
  - Vertical Jump (Spike)
  - Spike Velocity
  - Agility
  - Reach Height
```

---

## 3. Modelos de Base de Datos (Prisma Schema)

### 3.1 Nuevos Modelos Core

```prisma
// ============================================
// PLATFORM & MULTI-TENANCY
// ============================================

model Organization {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  name              String
  slug              String   @unique  // URL-friendly: "real-madrid-cf"
  sportId           String   @db.ObjectId

  // Subscription & Billing
  plan              String   @default("free") // free, starter, pro, enterprise
  stripeCustomerId  String?  @unique
  subscriptionStatus String  @default("trialing") // trialing, active, past_due, canceled
  trialEndsAt       DateTime?

  // Limits based on plan
  maxMembers        Int      @default(15)  // Free: 15, Starter: 50, Pro: 200, Enterprise: unlimited
  maxCoaches        Int      @default(2)   // Free: 2, Starter: 5, Pro: 20, Enterprise: unlimited
  maxTeams          Int      @default(1)   // Free: 1, Starter: 3, Pro: 10, Enterprise: unlimited
  maxStorageGB      Int      @default(1)   // Free: 1GB, Starter: 10GB, Pro: 50GB, Enterprise: 500GB

  // Branding
  logoUrl           String?
  faviconUrl        String?
  primaryColor      String   @default("#1976d2")
  secondaryColor    String   @default("#dc004e")
  customDomain      String?  @unique  // Pro+: "training.realmadrid.com"

  // Settings
  timezone          String   @default("Europe/Madrid")
  language          String   @default("es")
  allowedFeatures   Json     @default("[]")  // Feature flags

  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  createdBy         String   @db.ObjectId

  // Relations
  sport             Sport    @relation(fields: [sportId], references: [id])
  teams             Team[]
  members           OrganizationMember[]
  invitations       Invitation[]
  subscription      Subscription?
  auditLogs         AuditLog[]

  @@index([slug])
  @@index([stripeCustomerId])
}

model Team {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  organizationId    String   @db.ObjectId
  name              String
  ageCategoryId     String   @db.ObjectId

  // Settings
  isActive          Boolean  @default(true)
  seasonPhase       String   @default("off-season")

  // Relations
  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  ageCategory       AgeCategory  @relation(fields: [ageCategoryId], references: [id])
  members           TeamMember[]
  trainingSessions  TrainingSession[]
  templates         TrainingTemplate[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([organizationId])
  @@unique([organizationId, name])
}

model OrganizationMember {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  organizationId    String   @db.ObjectId
  userId            String   @db.ObjectId
  role              String   // owner, admin, coach, player

  // Permissions
  canManageMembers  Boolean  @default(false)
  canManageContent  Boolean  @default(false)
  canManageBilling  Boolean  @default(false)
  canManageSettings Boolean  @default(false)

  joinedAt          DateTime @default(now())
  invitedBy         String?  @db.ObjectId

  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user              User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([organizationId, userId])
  @@index([userId])
}

model TeamMember {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  teamId            String   @db.ObjectId
  userId            String   @db.ObjectId
  role              String   // head_coach, assistant_coach, player
  positionId        String?  @db.ObjectId
  jerseyNumber      Int?

  joinedAt          DateTime @default(now())
  leftAt            DateTime?
  isActive          Boolean  @default(true)

  team              Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  position          Position? @relation(fields: [positionId], references: [id])

  @@unique([teamId, userId])
  @@index([userId])
}

// ============================================
// SPORTS CATALOG (Platform-level)
// ============================================

model Sport {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  name              String   // "American Football"
  slug              String   @unique // "american-football"
  icon              String?  // Material UI icon name or URL
  isActive          Boolean  @default(true)
  displayOrder      Int      @default(0)

  // Translations
  nameTranslations  Json     @default("{}")  // { "es": "Fútbol Americano", "de": "American Football" }

  // Relations
  positions         Position[]
  ageCategories     AgeCategory[]
  metrics           SportMetric[]
  organizations     Organization[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Position {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  sportId           String   @db.ObjectId
  name              String   // "Quarterback"
  abbreviation      String   // "QB"
  group             String?  // "Offense", "Defense"
  displayOrder      Int      @default(0)

  nameTranslations  Json     @default("{}")
  groupTranslations Json     @default("{}")

  sport             Sport    @relation(fields: [sportId], references: [id], onDelete: Cascade)
  teamMembers       TeamMember[]

  @@unique([sportId, abbreviation])
  @@index([sportId])
}

model AgeCategory {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  sportId           String   @db.ObjectId
  name              String   // "Under 15"
  code              String   // "U15"
  minAge            Int?
  maxAge            Int?
  displayOrder      Int      @default(0)

  nameTranslations  Json     @default("{}")

  sport             Sport    @relation(fields: [sportId], references: [id], onDelete: Cascade)
  teams             Team[]

  @@unique([sportId, code])
  @@index([sportId])
}

model SportMetric {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  sportId           String   @db.ObjectId
  name              String   // "40 Yard Dash"
  unit              String   // "seconds", "inches", "reps"
  type              String   // "time", "distance", "weight", "reps"
  isLowerBetter     Boolean  @default(false)  // For time-based metrics
  displayOrder      Int      @default(0)

  nameTranslations  Json     @default("{}")

  sport             Sport    @relation(fields: [sportId], references: [id], onDelete: Cascade)

  @@unique([sportId, name])
  @@index([sportId])
}

// ============================================
// SUBSCRIPTIONS & BILLING
// ============================================

model Subscription {
  id                    String   @id @default(auto()) @map("_id") @db.ObjectId
  organizationId        String   @unique @db.ObjectId

  // Stripe IDs
  stripeSubscriptionId  String   @unique
  stripePriceId         String
  stripeProductId       String

  // Status
  status                String   // active, past_due, canceled, incomplete

  // Billing cycle
  currentPeriodStart    DateTime
  currentPeriodEnd      DateTime
  cancelAtPeriodEnd     Boolean  @default(false)
  canceledAt            DateTime?

  // Plan details
  plan                  String   // starter, pro, enterprise
  interval              String   // month, year
  amount                Int      // in cents
  currency              String   @default("eur")

  organization          Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  invoices              Invoice[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model Invoice {
  id                    String   @id @default(auto()) @map("_id") @db.ObjectId
  subscriptionId        String   @db.ObjectId
  stripeInvoiceId       String   @unique

  amount                Int
  currency              String
  status                String   // paid, open, void, uncollectible
  invoiceUrl            String?
  invoicePdf            String?

  periodStart           DateTime
  periodEnd             DateTime
  paidAt                DateTime?

  subscription          Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)

  createdAt             DateTime @default(now())
}

model Invitation {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  organizationId    String   @db.ObjectId
  email             String
  role              String   // admin, coach, player
  teamIds           String[] @db.ObjectId  // Teams to join

  token             String   @unique
  expiresAt         DateTime
  acceptedAt        DateTime?

  invitedBy         String   @db.ObjectId

  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  createdAt         DateTime @default(now())

  @@unique([organizationId, email])
  @@index([token])
}

// ============================================
// AUDIT & ANALYTICS
// ============================================

model AuditLog {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  organizationId    String   @db.ObjectId
  userId            String?  @db.ObjectId

  action            String   // create, update, delete, login, invite, etc.
  resource          String   // user, team, template, workout, etc.
  resourceId        String?

  details           Json?    // Additional context
  ipAddress         String?
  userAgent         String?

  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  createdAt         DateTime @default(now())

  @@index([organizationId, createdAt])
  @@index([userId])
}

model UsageMetrics {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  organizationId    String   @db.ObjectId
  month             String   // "2025-01"

  // Counts
  activeMembers     Int      @default(0)
  workoutsLogged    Int      @default(0)
  trainingSessions  Int      @default(0)
  videosWatched     Int      @default(0)
  drillsCompleted   Int      @default(0)

  // Storage
  storageUsedBytes  BigInt   @default(0)

  // API
  apiCalls          Int      @default(0)

  updatedAt         DateTime @updatedAt

  @@unique([organizationId, month])
}
```

### 3.2 Modificaciones a Modelos Existentes

```prisma
// User - Actualizado
model User {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId

  // Authentication
  email             String   @unique
  password          String

  // Profile
  firstName         String
  lastName          String
  avatarUrl         String?
  phone             String?
  birthDate         DateTime?

  // Platform role (for super-admins)
  platformRole      String   @default("user")  // user, support, admin, super_admin

  // Settings
  language          String   @default("en")
  timezone          String?

  // Status
  isActive          Boolean  @default(true)
  emailVerified     Boolean  @default(false)
  emailVerifiedAt   DateTime?

  // Relations (multi-tenant)
  organizationMemberships OrganizationMember[]
  teamMemberships         TeamMember[]

  // Existing relations (scoped to org)
  workoutLogs       WorkoutLog[]
  testResults       TestResult[]
  notifications     Notification[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  lastLoginAt       DateTime?

  @@index([email])
}

// WorkoutLog - Actualizado con tenant
model WorkoutLog {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  userId            String   @db.ObjectId
  organizationId    String   @db.ObjectId  // NEW: Tenant isolation
  teamId            String?  @db.ObjectId  // NEW: Team context

  // ... existing fields ...

  @@index([organizationId, userId])
  @@index([organizationId, createdAt])
}

// TrainingSession - Actualizado con tenant
model TrainingSession {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  organizationId    String   @db.ObjectId  // NEW
  teamId            String?  @db.ObjectId  // NEW
  createdBy         String   @db.ObjectId

  // ... existing fields ...

  @@index([organizationId])
  @@index([teamId])
}

// Exercise - Con soporte para global + org-specific
model Exercise {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  organizationId    String?  @db.ObjectId  // NULL = global exercise
  sportId           String?  @db.ObjectId  // Sport-specific exercises

  isGlobal          Boolean  @default(false)  // Platform-wide exercise

  // ... existing fields ...

  @@index([organizationId])
  @@index([sportId])
}
```

---

## 4. Flujo de Usuario Completo

### 4.1 Landing Page → Registro → Uso

```
┌─────────────────────────────────────────────────────────────┐
│                    1. LANDING PAGE                          │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Hero      │  │  Features   │  │  Pricing    │         │
│  │   Section   │  │  Section    │  │  Section    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Testimonials│  │    FAQ      │  │   Footer    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  CTA: "Empieza Gratis" / "Ver Demo"                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    2. SIGNUP FLOW                           │
│                                                             │
│  Step 1: Account                                            │
│  ┌────────────────────────────────────┐                    │
│  │ Email: _______________             │                    │
│  │ Password: _______________          │                    │
│  │ Nombre: _______________            │                    │
│  │                                    │                    │
│  │ [Google] [Microsoft] [Apple]       │                    │
│  └────────────────────────────────────┘                    │
│                                                             │
│  Step 2: Organization                                       │
│  ┌────────────────────────────────────┐                    │
│  │ Nombre del Club: _______________   │                    │
│  │ Deporte:  [▼ Fútbol Americano   ]  │                    │
│  │ País:     [▼ España             ]  │                    │
│  │ Timezone: [▼ Europe/Madrid      ]  │                    │
│  └────────────────────────────────────┘                    │
│                                                             │
│  Step 3: First Team                                         │
│  ┌────────────────────────────────────┐                    │
│  │ Nombre del Equipo: _______________  │                    │
│  │ Categoría: [▼ Seniors           ]  │                    │
│  │ Tu rol:    [▼ Head Coach        ]  │                    │
│  └────────────────────────────────────┘                    │
│                                                             │
│  Step 4: Invite Team (Optional)                             │
│  ┌────────────────────────────────────┐                    │
│  │ Invitar coaches: _______________   │                    │
│  │ Invitar jugadores: _______________  │                    │
│  │                                    │                    │
│  │ [Saltar] [Enviar Invitaciones]     │                    │
│  └────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    3. ONBOARDING                            │
│                                                             │
│  ┌────────────────────────────────────┐                    │
│  │ Welcome Tour (Interactive)         │                    │
│  │                                    │                    │
│  │ 1. Dashboard overview              │                    │
│  │ 2. Create first workout            │                    │
│  │ 3. Add exercises                   │                    │
│  │ 4. Assign to players               │                    │
│  │ 5. View reports                    │                    │
│  └────────────────────────────────────┘                    │
│                                                             │
│  Checklist:                                                 │
│  ☐ Personalizar branding                                    │
│  ☐ Añadir primer ejercicio                                  │
│  ☐ Crear primer template                                    │
│  ☐ Invitar primer jugador                                   │
│  ☐ Completar perfil del club                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    4. DASHBOARD                             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [Logo] ClubName        [Team: Seniors ▼]  [👤 Profile]│  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────┐  ┌──────────────────────────────────────────┐ │
│  │ Sidebar │  │  Main Content Area                       │ │
│  │         │  │                                          │ │
│  │ Home    │  │  Stats Cards | Recent Activity          │ │
│  │ Training│  │  Quick Actions | Notifications          │ │
│  │ Players │  │                                          │ │
│  │ Videos  │  │                                          │ │
│  │ Drills  │  │                                          │ │
│  │ Reports │  │                                          │ │
│  │ ─────── │  │                                          │ │
│  │ Admin   │  │                                          │ │
│  │ Settings│  │                                          │ │
│  │ Billing │  │                                          │ │
│  └─────────┘  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Flujo de Invitación de Jugadores

```
Coach sends invitation
        │
        ▼
┌─────────────────────┐
│ Email to Player     │
│                     │
│ "Has sido invitado  │
│  a [ClubName]"      │
│                     │
│ [Unirse al Equipo]  │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Player clicks link  │
│ /invite/[token]     │
└─────────────────────┘
        │
        ├──── Has account? ────┐
        │                      │
        ▼ No                   ▼ Yes
┌─────────────────┐    ┌─────────────────┐
│ Create Account  │    │ Login           │
│ - Email (pre)   │    │                 │
│ - Password      │    │                 │
│ - Name          │    │                 │
└─────────────────┘    └─────────────────┘
        │                      │
        └──────────┬───────────┘
                   ▼
        ┌─────────────────────┐
        │ Complete Profile    │
        │ - Position          │
        │ - Jersey Number     │
        │ - Birth Date        │
        └─────────────────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ Welcome to Team!    │
        │ Quick tour...       │
        └─────────────────────┘
```

### 4.3 Flujo de Pago

```
┌─────────────────────────────────────────────────────────────┐
│                    PRICING PAGE                             │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   FREE      │  │   STARTER   │  │     PRO     │         │
│  │             │  │             │  │             │         │
│  │  €0/mes     │  │  €29/mes    │  │  €79/mes    │         │
│  │             │  │             │  │             │         │
│  │ • 15 users  │  │ • 50 users  │  │ • 200 users │         │
│  │ • 2 coaches │  │ • 5 coaches │  │ • 20 coaches│         │
│  │ • 1 team    │  │ • 3 teams   │  │ • 10 teams  │         │
│  │ • 1GB       │  │ • 10GB      │  │ • 50GB      │         │
│  │             │  │             │  │             │         │
│  │ [Empezar]   │  │ [Probar 14d]│  │ [Probar 14d]│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│                  ┌─────────────┐                            │
│                  │ ENTERPRISE  │                            │
│                  │             │                            │
│                  │ Contactar   │                            │
│                  │             │                            │
│                  │ • Unlimited │                            │
│                  │ • Custom    │                            │
│                  │ • SSO       │                            │
│                  │ • API       │                            │
│                  │             │                            │
│                  │ [Contactar] │                            │
│                  └─────────────┘                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 STRIPE CHECKOUT                             │
│                                                             │
│  ┌────────────────────────────────────┐                    │
│  │ Plan: Pro (€79/mes)                │                    │
│  │                                    │                    │
│  │ Card: ____ ____ ____ ____         │                    │
│  │ Exp:  __/__  CVC: ___             │                    │
│  │                                    │                    │
│  │ [💳 Pagar €79.00]                  │                    │
│  └────────────────────────────────────┘                    │
│                                                             │
│  ✓ Cancelar cuando quieras                                  │
│  ✓ Facturación mensual                                      │
│  ✓ Soporte prioritario incluido                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               BILLING DASHBOARD                             │
│                                                             │
│  Plan actual: Pro                    [Cambiar Plan]         │
│  Próxima factura: 15 Feb 2025        €79.00                │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Uso actual                                          │    │
│  │                                                     │    │
│  │ Miembros: ████████░░ 156/200                       │    │
│  │ Equipos:  ███░░░░░░░ 3/10                          │    │
│  │ Storage:  █████░░░░░ 23GB/50GB                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  Historial de Facturas                                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 15 Jan 2025 | €79.00 | Pagada | [Descargar PDF]   │    │
│  │ 15 Dec 2024 | €79.00 | Pagada | [Descargar PDF]   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  Método de pago: •••• 4242        [Actualizar]              │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Estructura de Carpetas Propuesta

```
training-app/
├── apps/
│   ├── web/                      # Main SaaS Application (React)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── common/       # Shared UI components
│   │   │   │   ├── admin/        # Admin panel components
│   │   │   │   ├── billing/      # Billing components
│   │   │   │   ├── onboarding/   # Onboarding wizard
│   │   │   │   └── dashboard/    # Dashboard widgets
│   │   │   ├── contexts/
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   ├── OrganizationContext.tsx
│   │   │   │   ├── TeamContext.tsx
│   │   │   │   └── ThemeContext.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useOrganization.ts
│   │   │   │   ├── useTeam.ts
│   │   │   │   ├── useSubscription.ts
│   │   │   │   └── usePermissions.ts
│   │   │   ├── pages/
│   │   │   │   ├── public/       # Landing, pricing, etc.
│   │   │   │   ├── auth/         # Login, signup, invite
│   │   │   │   ├── onboarding/   # Setup wizard
│   │   │   │   ├── dashboard/    # Main app
│   │   │   │   ├── admin/        # Org admin
│   │   │   │   └── billing/      # Subscription management
│   │   │   ├── services/
│   │   │   │   ├── api/          # API clients
│   │   │   │   ├── auth/         # Auth services
│   │   │   │   └── stripe/       # Stripe client
│   │   │   └── types/
│   │   └── public/
│   │
│   ├── landing/                  # Marketing site (optional: Next.js)
│   │   ├── pages/
│   │   │   ├── index.tsx         # Home
│   │   │   ├── pricing.tsx       # Pricing
│   │   │   ├── features.tsx      # Features
│   │   │   └── blog/             # Blog posts
│   │   └── components/
│   │
│   └── api/                      # Backend (Express)
│       ├── src/
│       │   ├── routes/
│       │   │   ├── v1/           # API v1
│       │   │   │   ├── auth/
│       │   │   │   ├── organizations/
│       │   │   │   ├── teams/
│       │   │   │   ├── users/
│       │   │   │   ├── billing/
│       │   │   │   ├── sports/
│       │   │   │   └── ...
│       │   │   └── webhooks/     # Stripe webhooks
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   ├── tenant.ts     # Multi-tenant middleware
│       │   │   ├── rateLimit.ts
│       │   │   └── permissions.ts
│       │   ├── services/
│       │   │   ├── billing/      # Stripe service
│       │   │   ├── email/        # Email service
│       │   │   └── storage/      # File storage
│       │   └── utils/
│       └── prisma/
│           ├── schema.prisma
│           └── seeds/
│               ├── sports.ts     # Seed sports catalog
│               └── plans.ts      # Seed subscription plans
│
├── packages/
│   ├── types/                    # Shared TypeScript types
│   ├── utils/                    # Shared utilities
│   └── ui/                       # Shared UI components
│
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   └── docker-compose.yml
│
└── docs/
    ├── api/                      # API documentation
    ├── architecture/             # Architecture docs
    └── deployment/               # Deployment guides
```

---

## 6. Plan de Implementación por Fases

### Fase 1: Fundamentos Multi-Tenant ✅ COMPLETADO

#### 1.1 Schema & Models ✅
- [x] Crear modelos: Organization, OrganizationMember, Team, TeamMember
- [x] Crear modelos: Sport, Position, AgeCategory, SportMetric
- [x] Añadir `organizationId` a todos los modelos existentes
- [x] Crear migrations y seeds para deportes

#### 1.2 Middleware & Context ✅
- [x] Crear tenant middleware (extraer org del JWT/header)
- [x] Crear OrganizationContext en frontend
- [x] Crear TeamContext en frontend
- [x] Modificar todas las queries para filtrar por `organizationId`

#### 1.3 Auth Updates (Parcial)
- [ ] Actualizar signup para crear Organization
- [x] Actualizar login para incluir org info en JWT
- [x] Crear sistema de roles jerárquicos
- [ ] Crear invitation system

#### 1.4 Demo Organization Seed ✅
- [x] Crear seed script para organización demo
- [x] 8 usuarios demo (2 coaches, 6 players)
- [x] 2 equipos (Seniors, U15 Juniors)
- [x] Training types, exercise categories, exercises
- [x] Points config por organización

### Fase 2: Sports Catalog & Configuration (1-2 semanas)

#### 2.1 Sports Data ✅
- [x] Seed data para: Football, Basketball, Soccer, Handball, Rugby, Volleyball, Ice Hockey, Baseball, Lacrosse (9 deportes)
- [ ] UI para selección de deporte en signup
- [ ] Posiciones dinámicas según deporte
- [ ] Categorías de edad dinámicas según deporte

#### 2.2 Organization Settings
- [ ] Settings page completa
- [ ] Branding customization
- [ ] Sport-specific configuration
- [ ] Team management UI

### Fase 3: Landing & Onboarding (1-2 semanas)

#### 3.1 Public Pages
- [ ] Landing page con hero, features, testimonials
- [ ] Pricing page con comparación de planes
- [ ] Feature pages individuales
- [ ] Footer con links legales

#### 3.2 Signup & Onboarding
- [ ] Multi-step signup wizard
- [ ] Organization creation flow
- [ ] First team creation
- [ ] Interactive onboarding tour
- [ ] Onboarding checklist

### Fase 4: Billing & Subscriptions (2-3 semanas)

#### 4.1 Stripe Integration
- [ ] Setup Stripe account & products
- [ ] Implement Stripe Checkout
- [ ] Create subscription models
- [ ] Webhook handlers (subscription.created, updated, deleted, etc.)

#### 4.2 Plan Enforcement
- [ ] Feature flags per plan
- [ ] Usage limits enforcement
- [ ] Upgrade/downgrade flows
- [ ] Billing dashboard

#### 4.3 Invoicing
- [ ] Invoice history
- [ ] PDF download
- [ ] Payment method management

### Fase 5: Admin & Analytics (1-2 semanas)

#### 5.1 Organization Admin
- [ ] Member management (invite, remove, change role)
- [ ] Team management
- [ ] Usage dashboard
- [ ] Audit logs viewer

#### 5.2 Platform Admin (Super Admin)
- [ ] Organizations list & management
- [ ] Revenue dashboard
- [ ] User analytics
- [ ] Support tools

### Fase 6: Polish & Launch Prep (1-2 semanas)

#### 6.1 Testing
- [ ] Unit tests for critical paths
- [ ] E2E tests for main flows
- [ ] Load testing
- [ ] Security audit

#### 6.2 Documentation
- [ ] API documentation
- [ ] User guides
- [ ] Admin documentation

#### 6.3 Launch
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Error tracking (Sentry)
- [ ] Analytics (Mixpanel/Amplitude)

---

## 7. Planes de Suscripción Propuestos

### Tabla de Características

| Feature | Free | Starter | Pro | Enterprise |
|---------|------|---------|-----|------------|
| **Precio** | €0/mes | €29/mes | €79/mes | Custom |
| **Miembros** | 15 | 50 | 200 | Unlimited |
| **Coaches** | 2 | 5 | 20 | Unlimited |
| **Equipos** | 1 | 3 | 10 | Unlimited |
| **Storage** | 1 GB | 10 GB | 50 GB | 500 GB |
| **Ejercicios Custom** | 20 | 100 | Unlimited | Unlimited |
| **Videos** | 10 | 50 | Unlimited | Unlimited |
| **Drills** | 10 | 50 | Unlimited | Unlimited |
| **Workout Templates** | 5 | 25 | Unlimited | Unlimited |
| **AI Insights** | ❌ | Basic | Advanced | Custom |
| **Branding** | ❌ | Logo only | Full | White-label |
| **Custom Domain** | ❌ | ❌ | ✅ | ✅ |
| **API Access** | ❌ | ❌ | ✅ | ✅ |
| **SSO/SAML** | ❌ | ❌ | ❌ | ✅ |
| **Support** | Community | Email | Priority | Dedicated |
| **Analytics** | Basic | Standard | Advanced | Custom |
| **Data Export** | ❌ | CSV | CSV + API | Full |

### Pricing Psychology
- **Free**: Suficiente para equipos pequeños/amateurs, genera word-of-mouth
- **Starter**: Sweet spot para clubs medianos, precio accesible
- **Pro**: Para clubs serios con múltiples categorías
- **Enterprise**: Federaciones, academias profesionales

---

## 8. API Endpoints Nuevos

### Organizations
```
POST   /api/v1/organizations              # Create organization
GET    /api/v1/organizations/:id          # Get organization
PATCH  /api/v1/organizations/:id          # Update organization
DELETE /api/v1/organizations/:id          # Delete organization
GET    /api/v1/organizations/:id/members  # List members
POST   /api/v1/organizations/:id/invite   # Invite member
```

### Teams
```
POST   /api/v1/teams                      # Create team
GET    /api/v1/teams                      # List teams (org scoped)
GET    /api/v1/teams/:id                  # Get team
PATCH  /api/v1/teams/:id                  # Update team
DELETE /api/v1/teams/:id                  # Delete team
GET    /api/v1/teams/:id/members          # List team members
POST   /api/v1/teams/:id/members          # Add member to team
```

### Sports (Platform level)
```
GET    /api/v1/sports                     # List all sports
GET    /api/v1/sports/:id                 # Get sport details
GET    /api/v1/sports/:id/positions       # Get positions for sport
GET    /api/v1/sports/:id/age-categories  # Get age categories
GET    /api/v1/sports/:id/metrics         # Get metrics for sport
```

### Billing
```
POST   /api/v1/billing/checkout           # Create checkout session
POST   /api/v1/billing/portal             # Create billing portal session
GET    /api/v1/billing/subscription       # Get current subscription
GET    /api/v1/billing/invoices           # List invoices
GET    /api/v1/billing/usage              # Get usage metrics
POST   /api/v1/webhooks/stripe            # Stripe webhook handler
```

### Invitations
```
POST   /api/v1/invitations                # Send invitation
GET    /api/v1/invitations/:token         # Validate invitation token
POST   /api/v1/invitations/:token/accept  # Accept invitation
DELETE /api/v1/invitations/:id            # Cancel invitation
```

---

## 9. Consideraciones de Seguridad

### 9.1 Multi-Tenant Isolation
- Todas las queries DEBEN incluir `organizationId`
- Middleware verifica que el usuario pertenece a la org
- Índices compuestos: `[organizationId, ...]`
- Row-level security en todas las tablas

### 9.2 Authentication
- JWT con refresh tokens
- Rate limiting por IP y por usuario
- Password requirements (min 8 chars, complexity)
- 2FA opcional (TOTP)

### 9.3 Data Protection
- Encryption at rest (MongoDB Atlas)
- Encryption in transit (HTTPS everywhere)
- PII handling compliance (GDPR)
- Audit logs para acciones sensibles

### 9.4 API Security
- API keys para integraciones
- Rate limiting por plan
- Request signing para webhooks
- CORS configurado por organización

---

## 10. Métricas de Éxito

### 10.1 Business Metrics
- MRR (Monthly Recurring Revenue)
- Churn rate
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Conversion rate (Free → Paid)

### 10.2 Product Metrics
- DAU/MAU
- Feature adoption rates
- Workouts logged per user
- Time to first workout
- Onboarding completion rate

### 10.3 Technical Metrics
- API response time (p50, p95, p99)
- Error rate
- Uptime (target: 99.9%)
- Database query performance

---

## 11. Próximos Pasos Inmediatos

1. **Revisar y aprobar este plan**
2. **Definir prioridades exactas**
3. **Crear issues/tasks en sistema de tracking**
4. **Comenzar con Fase 1: Multi-tenancy**

---

## Apéndice A: Seed Data para Deportes

Ver archivo separado: `prisma/seeds/sports.ts`

## Apéndice B: Migrations

Ver archivo separado: `prisma/migrations/`

## Apéndice C: Checklist Pre-Launch

- [ ] Legal: Terms of Service
- [ ] Legal: Privacy Policy
- [ ] Legal: Cookie Policy
- [ ] Legal: DPA (Data Processing Agreement)
- [ ] Stripe: Test mode → Production
- [ ] Domain: SSL certificates
- [ ] Monitoring: Uptime checks
- [ ] Monitoring: Error tracking
- [ ] Backup: Database backup strategy
- [ ] Support: Help desk setup
