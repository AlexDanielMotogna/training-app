# SaaS Implementation Log

Este documento registra todos los pasos ejecutados durante la transformación a SaaS.

---

## Fase 1: Multi-Tenancy - Schema de Base de Datos

**Estado:** ✅ COMPLETADO
**Fecha:** 2025-11-30

### 1.1 Nuevos Modelos Creados

| Modelo | Archivo | Descripción |
|--------|---------|-------------|
| `Sport` | `schema.prisma:14-33` | Catálogo de deportes (Football, Basketball, etc.) |
| `Position` | `schema.prisma:35-50` | Posiciones por deporte (QB, PG, GK) |
| `AgeCategory` | `schema.prisma:52-68` | Categorías de edad (U15, Seniors) |
| `SportMetric` | `schema.prisma:70-85` | Métricas de rendimiento (40yd dash) |
| `Organization` | `schema.prisma:91-159` | Tenant principal - clubs/equipos |
| `Team` | `schema.prisma:161-181` | Equipos dentro de una organización |
| `OrganizationMember` | `schema.prisma:183-204` | Membresía usuario ↔ organización |
| `TeamMember` | `schema.prisma:206-224` | Membresía usuario ↔ equipo |
| `Subscription` | `schema.prisma:230-259` | Suscripciones Stripe |
| `Invoice` | `schema.prisma:261-279` | Facturas |
| `Invitation` | `schema.prisma:281-299` | Invitaciones por email |
| `AuditLog` | `schema.prisma:305-324` | Logs de auditoría |
| `UsageMetrics` | `schema.prisma:326-348` | Métricas de uso |

### 1.2 Modelos Actualizados con `organizationId`

| Modelo | Cambios |
|--------|---------|
| `User` | + `organizationId`, `platformRole`, `emailVerified`, `lastLoginAt`, relaciones a `OrganizationMember[]`, `TeamMember[]` |
| `TrainingSession` | + `organizationId`, `teamId` |
| `Video` | + `organizationId` |
| `VideoTag` | + `organizationId`, unique constraint actualizado |
| `Exercise` | + `organizationId` (nullable para global) |
| `ExerciseCategory` | + `organizationId` (nullable para global) |
| `TrainingTemplate` | + `organizationId`, `teamId` |
| `WorkoutLog` | + `organizationId`, `teamId` |
| `UserPlan` | + `organizationId` |
| `WorkoutReport` | + `organizationId` |
| `TrainingType` | + `organizationId` (nullable para global) |
| `BlockInfo` | + `organizationId` |
| `Notification` | + `organizationId` |
| `TestResult` | + `organizationId` |
| `Drill` | + `organizationId` |
| `Equipment` | + `organizationId` |
| `DrillCategory` | + `organizationId` |
| `DrillTrainingSession` | + `organizationId`, `teamId` |
| `Match` | + `organizationId`, `teamId` |
| `PointsConfig` | + `organizationId` |
| `PlayerWeeklyPoints` | + `organizationId`, `teamId` |

### 1.3 Índices Creados para Tenant Isolation

Todos los modelos con `organizationId` tienen:
- `@@index([organizationId])` - Para filtrar por tenant
- `@@index([organizationId, ...])` - Índices compuestos para queries comunes

### 1.4 Modelo Deprecado

- `TeamSettings` - Marcado como DEPRECATED, funcionalidad movida a `Organization`

### 1.5 Archivos Modificados

```
backend/prisma/schema.prisma  - Schema completo actualizado
```

### 1.6 Validación

```bash
npx prisma@6.19.0 generate  # ✅ Exitoso
```

---

## Fase 1.5: Sports Catalog Seed Data

**Estado:** ✅ COMPLETADO
**Fecha:** 2025-11-30

### Archivo Creado

```
backend/prisma/seeds/sports-catalog.ts
```

### Deportes Incluidos (9 Total)

| Deporte | Posiciones | Categorías | Métricas |
|---------|------------|------------|----------|
| American Football | 25 | 7 | 8 |
| Basketball | 5 | 8 | 7 |
| Soccer | 15 | 9 | 6 |
| Handball | 7 | 8 | 6 |
| Rugby | 15 | 10 | 7 |
| Volleyball | 5 | 7 | 7 |
| Ice Hockey | 6 | 9 | 6 |
| Baseball | 10 | 9 | 6 |
| Lacrosse | 7 | 9 | 6 |

### Deportes Añadidos (2025-11-30)

- **Ice Hockey**: Goaltender, Defensemen (L/R), Center, Wingers (L/R)
- **Baseball**: Pitcher, Catcher, Infielders (1B-SS), Outfielders (LF/CF/RF), DH
- **Lacrosse**: Goalkeeper, Defenders, Midfielders (L/C/R), Attackers

### Comando para Ejecutar

```bash
cd backend
npx tsx prisma/seeds/sports-catalog.ts
```

---

## Fase 2: Tenant Middleware & Auth

**Estado:** ✅ COMPLETADO
**Fecha:** 2025-11-30

### 2.1 Backend - JWT Payload Actualizado

Archivo: `backend/src/utils/jwt.ts`

```typescript
export interface JWTPayload {
  userId: string;
  email: string;
  role: string; // Legacy: 'player' | 'coach'

  // Multi-tenancy fields
  organizationId?: string;
  organizationRole?: string; // 'owner' | 'admin' | 'coach' | 'player'
  teamIds?: string[]; // Teams the user belongs to
  activeTeamId?: string; // Currently selected team
  platformRole?: string; // 'user' | 'support' | 'admin' | 'super_admin'
}
```

### 2.2 Backend - Tenant Middleware

Archivo: `backend/src/middleware/tenant.ts`

Funciones exportadas:
- `requireTenant` - Middleware que requiere membership de organización
- `requireOrgCoach` - Requiere rol coach o superior
- `requireOrgAdmin` - Requiere rol admin o superior
- `requireOrgOwner` - Requiere rol owner
- `optionalTenant` - Contexto opcional (para rutas públicas/mixtas)
- `canAccessTeam(req, teamId)` - Helper para verificar acceso a equipo
- `getTeamFilter(req)` - Helper para queries de equipo
- `buildScopedFilter(req, options)` - Builder para queries con visibilidad híbrida

### 2.3 Backend - Login Actualizado

Archivo: `backend/src/routes/auth.ts`

El endpoint `/api/auth/login` ahora:
- Carga `organizationMemberships` con datos de organización
- Carga `teamMemberships` activas
- Actualiza `lastLoginAt`
- Incluye en respuesta:
  - `organization`: datos de la org principal + role
  - `teamIds`: IDs de equipos del usuario

### 2.4 Frontend - Contexts Creados

Archivos:
- `src/contexts/OrganizationContext.tsx`
- `src/contexts/TeamContext.tsx`
- `src/contexts/index.ts`

**OrganizationContext:**
- `useOrganization()` - Hook principal
- `useOrgPermission(permission)` - Verificar permisos específicos
- `useRequireOrganization()` - Requerir membresía (throws si no hay)

**TeamContext:**
- `useTeam()` - Hook principal con teams y memberships
- `useActiveTeam()` - Obtener equipo activo (throws si no hay)
- `useCanAccessTeam(teamId)` - Verificar acceso a equipo

### 2.5 Notas de Compatibilidad

- El campo legacy `role` se mantiene en JWT para compatibilidad con código existente
- El login funciona sin organización (usuarios legacy o nuevos sin asignar)
- Los contexts guardan en localStorage para persistencia

---

## Fase 3: Actualizar Rutas del Backend

**Estado:** ✅ COMPLETADO
**Fecha:** 2025-11-30

### 3.1 Rutas Actualizadas con Tenant Isolation

| Ruta | Archivo | Cambios |
|------|---------|---------|
| `/api/exercises` | `routes/exercises.ts` | + optionalTenant middleware, filtros OR global/org, verificación acceso |
| `/api/trainings` | `routes/trainings.ts` | + optionalTenant + buildScopedFilter, visibilidad híbrida team/org |
| `/api/videos` | `routes/videos.ts` | + optionalTenant, filtros OR global/org, verificación acceso |
| `/api/templates` | `routes/templates.ts` | + optionalTenant + buildScopedFilter, visibilidad híbrida team/org |

### 3.2 Nuevos Endpoints Creados

**Organizations API:** `routes/organizations.ts`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/organizations/sports` | Lista deportes disponibles (para signup) |
| POST | `/api/organizations` | Crear organización (con owner membership) |
| GET | `/api/organizations/:id` | Obtener detalles de organización |
| PATCH | `/api/organizations/:id` | Actualizar organización (admin+) |
| GET | `/api/organizations/:id/members` | Listar miembros de organización |
| PATCH | `/api/organizations/:id/members/:userId` | Actualizar rol de miembro (admin+) |
| DELETE | `/api/organizations/:id/members/:userId` | Eliminar miembro (admin+) |

**Teams API:** `routes/teams.ts`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/organizations/:orgId/teams` | Listar equipos de organización |
| GET | `/api/organizations/:orgId/teams/my-teams` | Equipos del usuario actual |
| GET | `/api/organizations/:orgId/teams/:id` | Detalle de equipo |
| POST | `/api/organizations/:orgId/teams` | Crear equipo (admin+) |
| PATCH | `/api/organizations/:orgId/teams/:id` | Actualizar equipo (admin+) |
| DELETE | `/api/organizations/:orgId/teams/:id` | Eliminar equipo (admin+) |
| GET | `/api/organizations/:orgId/teams/:id/members` | Listar miembros del equipo |
| POST | `/api/organizations/:orgId/teams/:id/members` | Añadir miembro a equipo |
| PATCH | `/api/organizations/:orgId/teams/:teamId/members/:userId` | Actualizar rol en equipo |
| DELETE | `/api/organizations/:orgId/teams/:teamId/members/:userId` | Eliminar de equipo |

### 3.3 Patrón de Verificación de Acceso

```typescript
// Verificar coach (legacy + org role)
const isCoach = req.user.role === 'coach' || req.tenant?.permissions.isCoach;

// Verificar tenant isolation en recursos
if (resource.organizationId && resource.organizationId !== req.tenant?.organizationId) {
  return res.status(403).json({ error: 'Access denied' });
}

// Filtro híbrido para contenido (shared + team-specific)
const where = buildScopedFilter(req); // Incluye OR: teamId=null || teamId=activeTeamId
```

### 3.4 Registro de Rutas en `index.ts`

```typescript
import organizationRoutes from './routes/organizations.js';
import teamRoutes from './routes/teams.js';

// Multi-tenant routes
app.use('/api/organizations', organizationRoutes);
app.use('/api/organizations/:orgId/teams', teamRoutes);
```

---

## Fase 4: Demo Organization Seed Data

**Estado:** ✅ COMPLETADO Y EJECUTADO
**Fecha:** 2025-11-30

### 4.1 Archivo Creado

```
backend/prisma/seeds/demo-organization.ts
```

### 4.2 Datos Demo Incluidos

| Tipo | Cantidad | Detalles |
|------|----------|----------|
| Organization | 1 | "Demo Football Club" (American Football) |
| Teams | 2 | Seniors, U15 Juniors |
| Users | 8 | 2 coaches, 6 players |
| Training Types | 5 | Strength, Speed, Practice, Film, Recovery |
| Exercise Categories | 5 | Compound, Accessory, Core, Plyos, Conditioning |
| Exercises | 19 | Ejercicios de gym comunes |
| Points Config | 1 | Sistema de puntos por organización |

### 4.3 Usuarios Demo

| Nombre | Email | Password | Rol Org | Equipos |
|--------|-------|----------|---------|---------|
| John Coach | headcoach@demo-fc.com | Demo123! | owner | Seniors, U15 |
| Mike Assistant | assistant@demo-fc.com | Demo123! | coach | U15 |
| James Wilson | player1@demo-fc.com | Demo123! | player | Seniors (QB #12) |
| Robert Brown | player2@demo-fc.com | Demo123! | player | Seniors (RB #28) |
| Michael Davis | player3@demo-fc.com | Demo123! | player | Seniors (WR #81) |
| Tommy Junior | junior1@demo-fc.com | Demo123! | player | U15 (QB #7) |
| Alex Young | junior2@demo-fc.com | Demo123! | player | U15 (RB #22) |
| Chris Smith | junior3@demo-fc.com | Demo123! | player | U15 (WR #15) |

### 4.4 Comando para Ejecutar

```bash
# Primero ejecutar el catálogo de deportes (si no existe)
cd backend
npx tsx prisma/seeds/sports-catalog.ts

# Luego ejecutar la organización demo
npx tsx prisma/seeds/demo-organization.ts
```

### 4.5 Training Types Creados

| Key | Name (EN) | Name (DE) | Season |
|-----|-----------|-----------|--------|
| strength | Strength Training | Krafttraining | all |
| speed | Speed & Agility | Schnelligkeit & Agilität | all |
| practice | Practice | Training | in-season |
| film | Film Study | Videoanalyse | all |
| recovery | Recovery | Regeneration | all |

### 4.6 Exercise Categories Creados

| Key | Name (EN) | Name (DE) | Color |
|-----|-----------|-----------|-------|
| compound | Compound Lifts | Grundübungen | #e53935 |
| accessory | Accessory Work | Isolationsübungen | #1e88e5 |
| core | Core | Rumpf | #43a047 |
| plyometrics | Plyometrics | Plyometrie | #ff9800 |
| conditioning | Conditioning | Kondition | #00acc1 |

### 4.7 Points Config

```typescript
{
  weeklyTarget: 20,
  maxDailyPoints: 3,
  categories: [
    { key: 'training', name: 'Training Session', points: 1, maxPerDay: 1 },
    { key: 'match', name: 'Match Day', points: 2, maxPerDay: 1 },
    { key: 'strength', name: 'Strength Training', points: 1, maxPerDay: 1 },
  ],
  colorScale: {
    low: '#ef5350',
    medium: '#ffb74d',
    high: '#66bb6a',
  }
}
```

### 4.8 Notas Técnicas

- El script es idempotente (puede ejecutarse múltiples veces)
- Si los usuarios ya existen, se actualizan sus membresías
- Requiere que el catálogo de deportes esté cargado primero
- Usa `passwordHash` (no `password`) para el modelo User
- Usa `bcryptjs` para hashing de contraseñas
- TrainingType usa campos `key`, `nameEN`, `nameDE`, `season`
- ExerciseCategory usa campos `key`, `nameEN`, `nameDE`, `color`
- Exercise usa `category` (string key) en lugar de `categoryId`

---

## Fase 5: Public UI Flow (Landing, Pricing, Signup)

**Estado:** ✅ COMPLETADO
**Fecha:** 2025-12-01

### 5.1 Nuevas Páginas Públicas Creadas

| Archivo | Descripción |
|---------|-------------|
| `src/pages/public/Landing.tsx` | Landing page con Hero, Features, Sports, Pricing preview, CTA, Footer |
| `src/pages/public/Pricing.tsx` | Página de precios con 4 planes, comparación, FAQ |
| `src/pages/public/Signup.tsx` | Wizard multi-step: Account → Organization → Team |
| `src/pages/public/index.ts` | Barrel exports para las páginas públicas |

### 5.2 Landing Page Features

- **Header**: Logo, navegación (Features, Pricing), Login/Signup botones
- **Hero Section**: Título, subtítulo, CTAs (Start Free Trial, Watch Demo)
- **Features Section**: 6 features con iconos (Training Plans, Analytics, Attendance, Drillbook, Testing, Mobile)
- **Sports Section**: Showcase de deportes soportados
- **Pricing Preview**: 3 planes (Free, Starter, Pro) con precios
- **CTA Final**: Call-to-action antes del footer
- **Footer**: Links organizados (Product, Company, Support, Legal)

### 5.3 Pricing Page Features

- **Toggle Mensual/Anual**: Con 20% de descuento en anual
- **4 Planes**: Free ($0), Starter ($29), Pro ($79), Enterprise (Custom)
- **Feature Comparison Table**: 17 features comparadas
- **FAQ Accordion**: 6 preguntas frecuentes
- **Plan destacado**: Badge "Most Popular" en Pro

### 5.4 Signup Wizard (3 pasos)

**Step 1 - Account:**
- First Name, Last Name
- Email, Password, Confirm Password
- Terms & Conditions checkbox

**Step 2 - Organization:**
- Organization Name
- Sport Selection (carga desde API)
- Timezone Selection

**Step 3 - First Team:**
- Team Name
- Age Category (dinámico según deporte)
- Your Role (Owner vs Head Coach)

**Extras:**
- Plan badge desde URL params (`?plan=starter`)
- Validación por paso
- Estados de loading/error

### 5.5 Routing Actualizado

Archivo: `src/App.tsx`

```typescript
// Public routes
<Route path="/" element={<Landing />} />
<Route path="/pricing" element={<Pricing />} />
<Route path="/signup" element={<Signup />} />
<Route path="/login" element={<Auth />} />

// Protected routes (sin cambios)
{currentUser ? (
  <Route element={<AppShell>...</AppShell>}>
    <Route path="/training" element={<MyTraining />} />
    ...
  </Route>
) : null}
```

**Comportamiento de redirección:**
- `/` → Landing (o `/training` si logueado)
- `/pricing` → Siempre accesible
- `/signup` → Signup wizard (o `/training` si logueado)
- `/login` → Auth page (o `/training` si logueado)

### 5.6 Traducciones i18n Añadidas

| Archivo | Keys Añadidos |
|---------|---------------|
| `src/i18n/messages/en.ts` | ~180 keys para landing, pricing, signup |
| `src/i18n/messages/de.ts` | ~180 keys (traducciones alemanas) |

**Categorías de keys:**
- `landing.hero.*` - Hero section
- `landing.features.*` - Features section
- `landing.pricing.*` - Pricing preview
- `landing.cta.*` - Call-to-action
- `landing.footer.*` - Footer links
- `pricing.*` - Pricing page
- `signup.*` - Signup wizard

### 5.7 Build Verificado

```bash
npm run build  # ✅ Exitoso en 31.32s
```

---

## Próximas Fases (Pendientes)

### Fase 6: Login & Organization Context
- [ ] Actualizar Login para cargar contexto de organización
- [ ] Integrar OrganizationContext en App
- [ ] Actualizar servicios para incluir `organizationId`

### Fase 7: Onboarding & Settings
- [ ] Crear Onboarding Tour para nuevos usuarios
- [ ] Crear Organization Settings page
- [ ] Actualizar branding dinámico desde Organization

### Fase 8: Billing (Stripe)
- [ ] Integrar Stripe
- [ ] Crear checkout flow
- [ ] Implementar webhooks
- [ ] Crear billing dashboard

---

## Notas Técnicas

### Compatibilidad Backwards

Los campos legacy se mantienen en `User` para compatibilidad:
- `role` - Ahora usar `OrganizationMember.role`
- `position` - Ahora usar `TeamMember.positionId`
- `ageCategory` - Ahora determinado por `Team.ageCategoryId`
- `coachCategories` - Ahora usar `TeamMember` assignments

### Ejercicios/Categorías Globales vs Por Organización

- `organizationId = null` → Recurso global (visible para todos)
- `organizationId = "xxx"` → Recurso específico de esa organización

### Visibilidad de Contenido: Sistema Híbrido (Opción C)

**Decisión:** Los coaches pueden elegir si compartir contenido con toda la organización o solo con su equipo.

| `teamId` | Visibilidad |
|----------|-------------|
| `null` | Compartido con toda la organización (todos los equipos) |
| `"team_id"` | Solo visible para ese equipo específico |

**Modelos afectados:**
- `TrainingTemplate` - Planes de entrenamiento
- `TrainingSession` - Sesiones
- `DrillTrainingSession` - Sesiones de drills
- `WorkoutLog` - Logs de workout (contexto del equipo)
- `PlayerWeeklyPoints` - Leaderboard por equipo
- `Match` - Partidos por equipo

**Query pattern:**
```typescript
// Ver planes: compartidos + de mi equipo
const plans = await prisma.trainingTemplate.findMany({
  where: {
    organizationId: orgId,
    OR: [
      { teamId: null },           // Planes compartidos
      { teamId: currentTeamId }   // Planes de mi equipo
    ]
  }
});
```

**UI:** Al crear contenido, el coach verá:
- "Compartir con todo el club" → `teamId = null`
- "Solo para mi equipo (U15)" → `teamId = team_id`

---

### Versión de Prisma

Usar `prisma@6.19.0` (no actualizar a v7 todavía por breaking changes)

```bash
npx prisma@6.19.0 generate
npx prisma@6.19.0 db push
```
