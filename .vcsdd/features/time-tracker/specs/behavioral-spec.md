# Behavioral Specification: time-tracker

**Feature:** Time Tracker - 時間の使い方を記録・可視化するアプリ
**Mode:** lean
**Language:** TypeScript (React Native / Expo)
**Created:** 2026-04-05

---

## 1. Domain Model

### Entities

- **TimeEntry**: 時間記録の単位（開始時刻、終了時刻、カテゴリ、メモ）
- **Category**: 時間記録の分類（名前、色、アイコン、表示順）
- **User**: 認証されたユーザー（Better Auth 経由）
- **NotificationSchedule**: 通知スケジュール設定（間隔、有効/無効）

### Value Objects

- **TimeInterval**: 15分 / 30分 / 60分 / カスタム分数
- **ViewMode**: daily / weekly
- **ChartPeriod**: daily / weekly / cumulative
- **TimeSlot**: カレンダー上の1つの時間枠（開始〜終了）

---

## 2. Functional Requirements (EARS Format)

### 2.1 Authentication

**REQ-AUTH-001** (Event-driven)
When a user opens the app for the first time, the system shall display a sign-up / sign-in screen using Better Auth.

**REQ-AUTH-002** (Event-driven)
When a user successfully authenticates, the system shall navigate to the home screen and persist the session locally via Turso.

**REQ-AUTH-003** (State-driven)
While a user session is expired or invalid, the system shall redirect the user to the sign-in screen.

**REQ-AUTH-004** (Ubiquitous)
The system shall support email/password authentication via Better Auth with Expo integration.

### 2.2 Time Entry Management

**REQ-ENTRY-001** (Event-driven)
When a user taps a time slot on the calendar view, the system shall open a time entry creation form pre-filled with the selected time slot.

**REQ-ENTRY-002** (Ubiquitous)
The system shall allow the user to record a time entry with the following fields:

- Start time (required)
- End time (required)
- Category (required, selected from user's categories)
- Memo (optional, free text)

**REQ-ENTRY-003** (Event-driven)
When a user submits a valid time entry, the system shall persist it to the local Turso database and sync to the remote database when online.

**REQ-ENTRY-004** (Event-driven)
When a user taps an existing time entry on the calendar, the system shall open the entry detail view with edit and delete options.

**REQ-ENTRY-005** (Event-driven)
When a user edits a time entry, the system shall validate the changes and update the local and remote databases.

**REQ-ENTRY-006** (Event-driven)
When a user deletes a time entry, the system shall remove it from the local and remote databases after confirmation.

**REQ-ENTRY-007** (Constraint)
The system shall prevent time entries from overlapping with existing entries for the same user.

**REQ-ENTRY-008** (Ubiquitous)
The system shall support time entries with intervals of 15, 30, 60 minutes, or a custom duration (minimum 5 minutes).

### 2.3 Calendar View

**REQ-CAL-001** (Ubiquitous)
The system shall display a calendar view similar to Google Calendar, showing time entries as colored blocks on a time grid.

**REQ-CAL-002** (Event-driven)
When a user selects "Daily View", the system shall display a single day's time entries on a vertical time grid (00:00–23:59).

**REQ-CAL-003** (Event-driven)
When a user selects "Weekly View", the system shall display 7 days of time entries in a horizontal layout with vertical time grid.

**REQ-CAL-004** (Event-driven)
When a user swipes left or right on the calendar, the system shall navigate to the previous or next day/week respectively.

**REQ-CAL-005** (Event-driven)
When a user taps a date on the calendar header (react-native-calendars), the system shall navigate to the daily view for that date.

**REQ-CAL-006** (State-driven)
While the calendar view is displayed, the system shall color-code time entries by their associated category color.

**REQ-CAL-007** (Event-driven)
When a user long-presses an empty time slot, the system shall open the quick-create form for that slot.

### 2.4 Notifications

**REQ-NOTIF-001** (Event-driven)
When a user enables interval notifications, the system shall schedule local push notifications at the configured interval (15 / 30 / 60 min / custom).

**REQ-NOTIF-002** (Event-driven)
When a notification fires, the system shall prompt the user to record what they were doing in the elapsed interval.

**REQ-NOTIF-003** (Event-driven)
When a user taps the notification, the system shall open the app with a pre-filled time entry form for the elapsed interval.

**REQ-NOTIF-004** (Event-driven)
When a user changes the notification interval setting, the system shall cancel existing scheduled notifications and reschedule with the new interval.

**REQ-NOTIF-005** (State-driven)
While notifications are disabled, the system shall not schedule or display any interval notifications.

**REQ-NOTIF-006** (Constraint)
The system shall request notification permissions via expo-notifications before scheduling any notifications.

### 2.5 Charts & Analytics

**REQ-CHART-001** (Ubiquitous)
The system shall display a pie chart showing the 24-hour time distribution of a selected day, segmented by category.

**REQ-CHART-002** (Ubiquitous)
The system shall display a bar chart showing time spent per category.

**REQ-CHART-003** (Event-driven)
When a user switches the bar chart period to "daily", the system shall show time per category for the selected day.

**REQ-CHART-004** (Event-driven)
When a user switches the bar chart period to "weekly", the system shall show time per category aggregated over the selected week.

**REQ-CHART-005** (Event-driven)
When a user switches the bar chart period to "cumulative", the system shall show total time per category from the user's first entry to the present.

**REQ-CHART-006** (State-driven)
While no time entries exist for the selected period, the system shall display an empty state message instead of an empty chart.

**REQ-CHART-007** (Ubiquitous)
The system shall render charts using react-native-gifted-charts with category colors matching the calendar view.

### 2.6 Category Management

**REQ-CAT-001** (Ubiquitous)
The system shall provide the following default categories:

- SNS (Social Media)
- Gaming
- Exercise
- Housework
- Study
- Events
- Meals
- Sleep
- Work
- Commute
- Other

**REQ-CAT-002** (Event-driven)
When a user creates a custom category, the system shall persist it with a name, color, and optional icon.

**REQ-CAT-003** (Event-driven)
When a user edits a category, the system shall update the category and all associated time entries' display.

**REQ-CAT-004** (Event-driven)
When a user deletes a category that has associated entries, the system shall prompt the user to reassign those entries to another category before deletion.

**REQ-CAT-005** (Constraint)
The system shall not allow deletion of the "Other" category (it serves as the fallback).

**REQ-CAT-006** (Ubiquitous)
The system shall allow reordering of categories via drag-and-drop in the settings screen.

### 2.7 Data Persistence & Sync

**REQ-DATA-001** (Ubiquitous)
The system shall store all data locally using Turso (libSQL) for offline-first operation.

**REQ-DATA-002** (State-driven)
While the device is online, the system shall sync local changes to the remote Turso database.

**REQ-DATA-003** (State-driven)
While the device is offline, the system shall queue changes locally and sync when connectivity is restored.

**REQ-DATA-004** (Event-driven)
When a sync conflict occurs, the system shall use last-write-wins strategy with server-assigned timestamps (hybrid logical clock). The server timestamp is authoritative; client clocks are used only for offline ordering until sync completes.

### 2.8 API Layer

**REQ-API-001** (Ubiquitous)
The system shall expose API routes via Elysia.js integrated with Expo API routes.

**REQ-API-002** (Ubiquitous)
The system shall validate all API inputs using Valibot schemas.

**REQ-API-003** (Ubiquitous)
The system shall use the Result pattern (better-result) for all API calls from the client.

**REQ-API-004** (Ubiquitous)
The system shall use TanStack Query for server state management with optimistic updates.

---

## 3. Non-Functional Requirements

**REQ-NFR-001** (Performance)
The calendar view shall render within 300ms for a day with up to 48 time entries (every 30-min slot filled).

**REQ-NFR-002** (Performance)
Chart rendering shall complete within 500ms for up to 1 year of cumulative data.

**REQ-NFR-003** (Accessibility)
All interactive elements shall have accessible labels and roles per WCAG 2.1 AA guidelines.

**REQ-NFR-004** (Offline)
The app shall be fully functional without network connectivity (create, read, update, delete entries).

**REQ-NFR-005** (Security)
User data shall be isolated per authenticated user; no cross-user data access shall be possible.

**REQ-NFR-006** (Platform)
The system shall support iOS and Android via React Native (Expo SDK 54).

---

## 4. Edge Cases

**EDGE-001**: User creates a time entry spanning midnight → system shall split into two entries (one per day) for display purposes, but store as a single entry. For chart aggregation (pie/bar), each day's portion is counted toward that day only (no double-counting).

**EDGE-002**: User changes device timezone → existing entries shall retain their original timezone; new entries use the current timezone.

**EDGE-003**: Notification fires while app is in foreground → system shall show an in-app prompt instead of a system notification.

**EDGE-004**: User creates overlapping entries by editing end time → system shall warn and prevent the save.

**EDGE-005**: User has no categories (all deleted except Other) → system shall default to "Other" for new entries.

**EDGE-006**: Sync resumes after extended offline period (>24h) → system shall perform a full reconciliation rather than incremental sync.

**EDGE-007**: User rapidly creates multiple entries → system shall debounce sync operations (batch within 2 seconds).

---

## 5. Technology Mapping

| Requirement Area | Technology                         |
| ---------------- | ---------------------------------- |
| UI Components    | HeroUI Native + Tailwind (uniwind) |
| Calendar         | react-native-calendars             |
| Charts           | react-native-gifted-charts         |
| Navigation       | Expo Router v6                     |
| State Management | TanStack Query v5                  |
| API Layer        | Elysia.js (Expo API routes)        |
| HTTP Client      | up-fetch                           |
| Database         | Turso (libSQL) - local + remote    |
| Authentication   | Better Auth (Expo integration)     |
| Validation       | Valibot                            |
| Error Handling   | better-result (Result pattern)     |
| Notifications    | expo-notifications                 |
| Offline Support  | Turso embedded replicas            |
