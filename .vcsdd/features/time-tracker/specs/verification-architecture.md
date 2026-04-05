# Verification Architecture: time-tracker

**Feature:** Time Tracker
**Mode:** lean
**Language:** TypeScript (React Native / Expo)
**Created:** 2026-04-05

---

## 1. Purity Boundary Map

### Pure Domain Layer (Tier 3 - Formal Verification Candidates)

These functions have no side effects and are ideal for property-based testing:

| Module             | Functions                                                                            | Purity |
| ------------------ | ------------------------------------------------------------------------------------ | ------ |
| `time-entry-utils` | `splitEntryAtMidnight`, `detectOverlap`, `mergeAdjacentEntries`, `calculateDuration` | Pure   |
| `category-utils`   | `getDefaultCategories`, `sortCategories`, `validateCategoryName`                     | Pure   |
| `chart-data`       | `aggregateByCategory`, `buildPieChartData`, `buildBarChartData`, `filterByPeriod`    | Pure   |
| `time-slot`        | `generateTimeSlots`, `snapToInterval`, `roundToNearest`                              | Pure   |
| `validation`       | Valibot schemas (`timeEntrySchema`, `categorySchema`, etc.)                          | Pure   |

### Impure Boundary Layer (Tier 1-2 - Integration/E2E Testing)

| Module                    | Side Effects                   | Testing Strategy                                 |
| ------------------------- | ------------------------------ | ------------------------------------------------ |
| `api/mutations`           | Network I/O (Elysia API calls) | Integration tests with Result pattern assertions |
| `api/queries`             | Network I/O (TanStack Query)   | Integration tests with mock server               |
| `db/turso-client`         | Database I/O (libSQL)          | Integration tests with test database             |
| `auth/better-auth`        | Auth service I/O               | Integration tests with Better Auth test mode     |
| `notifications/scheduler` | OS notification API            | Unit tests with expo-notifications mock          |
| `sync/sync-engine`        | Network + DB I/O               | Integration tests with conflict scenarios        |

### UI Layer (Tier 0-1 - Snapshot/Component Tests)

| Component                     | Testing Strategy                                   |
| ----------------------------- | -------------------------------------------------- |
| Calendar views (daily/weekly) | Component tests with @testing-library/react-native |
| Chart components (pie/bar)    | Snapshot tests + data transformation unit tests    |
| Time entry form               | Component tests with user interaction simulation   |
| Category management           | Component tests with role-based queries            |
| Notification settings         | Component tests with mock expo-notifications       |

---

## 2. Proof Obligations

### Tier 3: Property-Based / Formal (Pure Functions)

**PROP-001** (REQ-ENTRY-007)
_Overlap detection is correct and complete._

- For any two TimeEntry values, `detectOverlap(a, b)` returns true iff their time ranges intersect.
- Property: `detectOverlap(a, b) === detectOverlap(b, a)` (symmetry)
- Property: `detectOverlap(a, a) === true` (reflexivity)
- Verification: Property-based tests (fast-check)

**PROP-002** (REQ-ENTRY-008, EDGE-001)
_Midnight splitting preserves total duration._

- `splitEntryAtMidnight(entry).reduce((sum, e) => sum + duration(e), 0) === duration(entry)`
- Property: Output entries are non-overlapping and cover the original range.
- Verification: Property-based tests

**PROP-003** (REQ-CHART-001, REQ-CHART-002)
_Chart aggregation preserves total time._

- `sum(aggregateByCategory(entries)) === sum(entries.map(duration))`
- Property: No time is lost or duplicated during aggregation.
- Verification: Property-based tests

**PROP-004** (REQ-ENTRY-002)
_Valibot schemas reject invalid input and accept valid input._

- `timeEntrySchema` rejects entries where `endTime <= startTime`
- `timeEntrySchema` rejects entries with duration < 5 minutes
- `categorySchema` rejects empty names
- Verification: Unit tests with boundary values

### Tier 2: Integration (Impure Boundary)

**PROP-005** (REQ-DATA-001, REQ-DATA-002, REQ-DATA-003)
_Offline-first data round-trip._

- Create entry offline → entry persists in local DB → sync when online → entry exists in remote DB.
- Verification: Integration test with Turso embedded replica

**PROP-006** (REQ-DATA-004)
_Sync conflict resolution: last-write-wins._

- Given two conflicting writes, the one with the later timestamp prevails.
- Verification: Integration test with controlled timestamps

**PROP-007** (REQ-AUTH-001, REQ-AUTH-002, REQ-AUTH-003)
_Authentication lifecycle._

- Unauthenticated → sign in → session valid → access granted.
- Session expired → redirect to sign-in.
- Verification: Integration test with Better Auth test mode

**PROP-008** (REQ-API-002, REQ-API-003)
_API validation and Result pattern._

- Invalid API input → Valibot rejection → Result.err returned.
- Valid API input → processed → Result.ok returned.
- Verification: Integration tests against Elysia API routes

**PROP-009** (REQ-NOTIF-001, REQ-NOTIF-004)
_Notification scheduling correctness._

- Setting interval to N minutes → N-minute notifications scheduled.
- Changing interval → old notifications cancelled, new ones scheduled.
- Verification: Integration tests with expo-notifications mock

**PROP-016** (REQ-NOTIF-002, REQ-NOTIF-003)
_Notification-to-form flow._

- When notification fires, app opens pre-filled time entry form for the elapsed interval.
- Tapping notification navigates to the correct screen with correct pre-fill data.
- Verification: Integration tests with expo-notifications mock + navigation assertions

**PROP-017** (REQ-NOTIF-005, REQ-NOTIF-006)
_Notification permission and disable behavior._

- When notifications are disabled, no notifications are scheduled.
- Permission is requested before first scheduling attempt.
- Verification: Integration tests with expo-notifications mock

**PROP-018** (REQ-NFR-005)
_Cross-user data isolation._

- User A cannot read, update, or delete User B's time entries or categories.
- API routes enforce user scoping on all queries.
- Verification: Integration tests with two authenticated test users

**PROP-019** (EDGE-002)
_Timezone change handling._

- Existing entries retain their original timezone after device timezone change.
- New entries use the current device timezone.
- Verification: Integration tests with mocked timezone changes

**PROP-020** (EDGE-003)
_Foreground notification handling._

- When notification fires while app is in foreground, system shows in-app prompt (not system notification).
- Verification: Component test with expo-notifications foreground handler mock

**PROP-021** (EDGE-005)
_Fallback category behavior._

- When all categories except "Other" are deleted, new entries default to "Other".
- Verification: Unit test

**PROP-022** (EDGE-006)
_Extended offline reconciliation._

- After >24h offline, system performs full reconciliation (not incremental sync).
- Verification: Integration test with controlled offline duration

**PROP-023** (EDGE-007)
_Rapid creation debounce._

- Multiple entries created within 2 seconds are batched into a single sync operation.
- Verification: Integration test with timing assertions

### Tier 1: Component (UI Layer)

**PROP-010** (REQ-CAL-001, REQ-CAL-002, REQ-CAL-003)
_Calendar renders entries in correct time slots._

- Given entries for a day, the daily view displays them at the correct vertical positions.
- Given entries for a week, the weekly view displays them in the correct day columns.
- Verification: Component tests with @testing-library/react-native

**PROP-011** (REQ-CAL-004)
_Swipe navigation changes date correctly._

- Swipe left in daily view → next day displayed.
- Swipe right in daily view → previous day displayed.
- Verification: Component tests with gesture simulation

**PROP-024** (REQ-CAL-005, REQ-CAL-007)
_Calendar interaction behaviors._

- Tap date header → navigate to daily view for that date.
- Long-press empty slot → quick-create form opens with correct time slot.
- Verification: Component tests with @testing-library/react-native

**PROP-012** (REQ-CHART-003, REQ-CHART-004, REQ-CHART-005)
_Chart period switching shows correct data._

- Switching to "daily" → only selected day's data.
- Switching to "weekly" → 7 days aggregated.
- Switching to "cumulative" → all-time data.
- Verification: Component tests with known data sets

**PROP-013** (REQ-CAT-004, REQ-CAT-005)
_Category deletion guards._

- Deleting category with entries → reassignment prompt shown.
- Deleting "Other" → operation blocked.
- Verification: Component tests

**PROP-025** (REQ-CAT-001, REQ-CAT-002, REQ-CAT-003)
_Category CRUD operations._

- Default categories are created on first launch with correct names, colors, and icons.
- Custom category creation persists name, color, and icon.
- Editing a category updates the display of all associated time entries.
- Verification: Component tests

**PROP-026** (REQ-CAT-006)
_Category reordering._

- Drag-and-drop reorder persists the new order.
- Verification: Component tests with gesture simulation

**PROP-027** (REQ-ENTRY-006)
_Delete confirmation flow._

- Tapping delete shows confirmation dialog.
- Cancelling confirmation does not delete the entry.
- Confirming deletes from local and remote DB.
- Verification: Component tests

**PROP-028** (REQ-CHART-006)
_Chart empty state._

- When no entries exist for the selected period, empty state message is displayed.
- Verification: Component tests

### Tier 0: Smoke / Snapshot

**PROP-014** (REQ-NFR-006)
_App launches without crash on iOS and Android._

- Verification: E2E smoke test (Maestro/Detox)

**PROP-015** (REQ-NFR-003)
_All interactive elements have accessible labels._

- Verification: Accessibility audit (automated + manual)

**PROP-029** (REQ-NFR-001)
_Calendar view renders within 300ms._

- Render a day with 48 entries (every 30-min slot filled) and assert render time < 300ms.
- Verification: Performance benchmark test (react-native-performance or custom timer)

**PROP-030** (REQ-NFR-002)
_Chart renders within 500ms for 1 year of data._

- Load 365 days of cumulative data and assert chart render time < 500ms.
- Verification: Performance benchmark test

---

## 3. Verification Tier Summary

| Tier                | Count                                           | Strategy                          | Tools                                                                 |
| ------------------- | ----------------------------------------------- | --------------------------------- | --------------------------------------------------------------------- |
| 3 (Formal/Property) | PROP-001 to PROP-004 (4)                        | Property-based testing            | fast-check, vitest                                                    |
| 2 (Integration)     | PROP-005 to PROP-009, PROP-016 to PROP-023 (13) | Integration tests                 | vitest, Turso test DB, Better Auth test mode, expo-notifications mock |
| 1 (Component)       | PROP-010 to PROP-013, PROP-024 to PROP-028 (9)  | Component tests                   | @testing-library/react-native, vitest                                 |
| 0 (Smoke/Perf)      | PROP-014, PROP-015, PROP-029, PROP-030 (4)      | E2E / accessibility / performance | Maestro or Detox, perf benchmarks                                     |

---

## 4. Requirement → Proof Obligation Traceability

| Requirement        | Proof Obligations  |
| ------------------ | ------------------ |
| REQ-AUTH-001..003  | PROP-007           |
| REQ-AUTH-004       | PROP-007           |
| REQ-ENTRY-001..005 | PROP-005, PROP-010 |
| REQ-ENTRY-006      | PROP-027           |
| REQ-ENTRY-007      | PROP-001           |
| REQ-ENTRY-008      | PROP-002, PROP-004 |
| REQ-CAL-001..003   | PROP-010           |
| REQ-CAL-004        | PROP-011           |
| REQ-CAL-005        | PROP-024           |
| REQ-CAL-006        | PROP-010           |
| REQ-CAL-007        | PROP-024           |
| REQ-NOTIF-001      | PROP-009           |
| REQ-NOTIF-002..003 | PROP-016           |
| REQ-NOTIF-004      | PROP-009           |
| REQ-NOTIF-005..006 | PROP-017           |
| REQ-CHART-001..002 | PROP-003, PROP-012 |
| REQ-CHART-003..005 | PROP-012           |
| REQ-CHART-006      | PROP-028           |
| REQ-CHART-007      | PROP-012           |
| REQ-CAT-001..003   | PROP-025           |
| REQ-CAT-004..005   | PROP-013           |
| REQ-CAT-006        | PROP-026           |
| REQ-DATA-001..003  | PROP-005           |
| REQ-DATA-004       | PROP-006           |
| REQ-API-001..004   | PROP-008           |
| REQ-NFR-001        | PROP-029           |
| REQ-NFR-002        | PROP-030           |
| REQ-NFR-003        | PROP-015           |
| REQ-NFR-004        | PROP-005           |
| REQ-NFR-005        | PROP-018           |
| REQ-NFR-006        | PROP-014           |
| EDGE-001           | PROP-002, PROP-003 |
| EDGE-002           | PROP-019           |
| EDGE-003           | PROP-020           |
| EDGE-004           | PROP-001           |
| EDGE-005           | PROP-021           |
| EDGE-006           | PROP-022           |
| EDGE-007           | PROP-023           |

---

## 5. Sprint Decomposition Recommendation

### Sprint 1: Core Domain + Data Layer

- Pure utilities (time-entry-utils, category-utils, validation schemas)
- Turso database setup (local + remote)
- Basic CRUD API routes (Elysia)
- PROP-001, PROP-002, PROP-004, PROP-005

### Sprint 2: Authentication + Calendar UI

- Better Auth integration
- Calendar daily/weekly views
- Time entry creation form
- PROP-007, PROP-010, PROP-011

### Sprint 3: Charts + Analytics

- Chart data aggregation (pure functions)
- Pie chart and bar chart components
- Period switching
- PROP-003, PROP-012

### Sprint 4: Notifications + Categories

- Notification scheduling
- Category management CRUD
- Category reordering
- PROP-009, PROP-013

### Sprint 5: Sync + Polish

- Offline/online sync engine
- Conflict resolution
- Performance optimization
- E2E smoke tests
- PROP-006, PROP-014, PROP-015
