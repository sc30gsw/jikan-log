# Spec Review Report: time-tracker (Iteration 1)

**Reviewer:** VCSDD Adversary
**Date:** 2026-04-05
**Overall Verdict:** FAIL

---

## Dimension 1: Spec Fidelity — FAIL

### Critical/High Findings

#### H1: Five of seven edge cases are verification orphans

`behavioral-spec.md` lines 227-237 enumerate EDGE-002 through EDGE-007. Of these, only EDGE-001 and EDGE-004 appear in the traceability matrix (`verification-architecture.md` lines 184-186). The remaining five edge cases have no proof obligation:

| Edge Case | Description                          | PROP? |
| --------- | ------------------------------------ | ----- |
| EDGE-002  | Device timezone change               | None  |
| EDGE-003  | Notification in foreground           | None  |
| EDGE-005  | All categories deleted except Other  | None  |
| EDGE-006  | Extended offline >24h reconciliation | None  |
| EDGE-007  | Rapid create debounce                | None  |

These were deemed important enough to document as edge cases but have zero verification coverage.

#### H2: Performance NFRs lack verification strategy

`behavioral-spec.md` lines 203-207 specify:

- REQ-NFR-001: Calendar renders within 300ms
- REQ-NFR-002: Chart renders within 500ms

These are mapped to PROP-014 (`verification-architecture.md` line 179), which is a smoke test checking "app launches without crash." There is no performance measurement, no benchmark tooling, and no threshold-based pass/fail criterion.

### Medium Findings

#### M1: Delete confirmation flow unverified

REQ-ENTRY-006 (`behavioral-spec.md` line 66) requires confirmation before deletion. No PROP tests the confirmation dialog behavior or what happens when the user cancels.

#### M2: Sync conflict timestamp ambiguity

REQ-DATA-004 (`behavioral-spec.md` line 183) specifies "last-write-wins strategy with timestamps" but does not define the timestamp source. Client-local clocks can drift, especially combined with EDGE-002 timezone changes. This ambiguity could yield divergent implementations.

#### M3: Notification subsystem under-verified

REQ-NOTIF-002 (prompt on fire), REQ-NOTIF-003 (tap opens pre-filled form), REQ-NOTIF-005 (disabled state), and REQ-NOTIF-006 (permission request) are all mapped to PROP-009, which only checks scheduling/rescheduling logic.

#### M4: Category CRUD and reorder unverified

REQ-CAT-001 through REQ-CAT-003 and REQ-CAT-006 are mapped to PROP-013, which exclusively tests deletion guards. Creating, editing, listing defaults, and drag-and-drop reordering have no dedicated proof obligation.

### Low Findings

#### L1: Midnight split and chart aggregation interaction unclear

EDGE-001 states entries spanning midnight are stored as one record but displayed as two. The spec does not clarify how chart aggregation (REQ-CHART-001 pie chart for a single day) handles this split, risking double-counting or under-counting.

---

## Dimension 2: Verification Readiness — FAIL

### Critical Findings

#### C1: Edge case proof obligation coverage is 2/7 (29%)

The verification architecture acknowledges edge cases by referencing EDGE-001 and EDGE-004 in the traceability matrix but silently omits five others. This is not a minor gap; these edge cases describe real failure scenarios (timezone drift, extended offline, rapid input) that will manifest in production.

### High Findings

#### H3: PROP-013 overloaded — covers 6 REQs, verifies 2

PROP-013 (`verification-architecture.md` lines 128-133) is the sole proof obligation for all six REQ-CAT requirements. Its description only covers deletion guards (REQ-CAT-004 and REQ-CAT-005). Four requirements have no meaningful verification.

#### H4: PROP-009 overloaded — covers 6 REQs, verifies 2

PROP-009 (`verification-architecture.md` lines 101-105) covers REQ-NOTIF-001 through REQ-NOTIF-006 but only describes scheduling and interval change behavior. Permission gating, in-app prompting, deep-link from notification, and disable-state are absent.

#### H5: Performance thresholds mapped to smoke tests

REQ-NFR-001 (300ms) and REQ-NFR-002 (500ms) require instrumented performance measurement. PROP-014 is a binary launch test. No tooling (e.g., `react-native-performance`, custom timers, Flashlight) is specified for performance verification.

#### H6: Data isolation conflated with auth lifecycle

REQ-NFR-005 requires that User A cannot access User B's data. PROP-007 tests login/logout/session-expiry flow. These are orthogonal concerns. A proof obligation should demonstrate that an authenticated request with User A's credentials cannot retrieve User B's records.

### Medium Findings

#### M5: API integration and optimistic updates unverified

REQ-API-001 (Elysia.js routing) and REQ-API-004 (TanStack Query optimistic updates) are mapped to PROP-008, which only tests input validation and Result pattern. The actual routing integration and optimistic update rollback behavior lack verification.

#### M6: Tier inconsistency for notification scheduler

The purity boundary map (`verification-architecture.md` line 33) classifies `notifications/scheduler` testing strategy as "Unit tests with expo-notifications mock" (suggesting Tier 2/3), but PROP-009 is classified as Tier 2 Integration. The stated strategy and tier assignment are inconsistent.

### Low Findings

#### L2: PROP-010 conflates rendering, navigation, and gesture interaction

PROP-010 covers REQ-CAL-001 through REQ-CAL-003 (rendering) but is also mapped to REQ-CAL-005 (date tap navigation) and REQ-CAL-007 (long-press quick-create). These are distinct interaction patterns requiring different test approaches.

---

## Recommendations for Iteration 2

1. **Add proof obligations for all five unmapped edge cases** (EDGE-002, 003, 005, 006, 007). Even lightweight unit tests would close these gaps.
2. **Split overloaded PROPs**: PROP-009, PROP-010, and PROP-013 each need to be decomposed into requirement-specific proof obligations.
3. **Create a dedicated performance verification PROP** with tooling specification (Flashlight, custom perf markers, or threshold-based vitest benchmarks).
4. **Add a data isolation PROP** separate from auth lifecycle — test cross-user query rejection explicitly.
5. **Clarify sync timestamp source** in the behavioral spec (client UTC, server UTC, or hybrid logical clock).
6. **Clarify midnight-split aggregation** behavior for chart calculations.
