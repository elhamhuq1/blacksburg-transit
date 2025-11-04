# PRD: Blacksburg Transit Mobile App (Expo + React Native)

**Version:** 1.0  
**Status:** Draft  
**Author:** Product Team  
**Last Updated:** November 4, 2025  
**Target Audience:** Junior–Mid-level developers, designers, QA engineers

---

## 1. Problem Statement

### Current Pain Points

The existing Blacksburg Transit (BT4U) mobile experience suffers from two critical issues:

1. **Poor UI/UX and Accessibility**

   - Low-contrast text difficult to read in sunlight
   - Small tap targets fail accessibility guidelines (< 44×44 pt)
   - Information hierarchy unclear—users struggle to find "next bus" quickly
   - No dark mode support
   - Minimal screen reader support (unlabeled controls, no semantic roles)
   - Poor empty states and error messaging

2. **Unreliable "Real-Time" Experience**
   - Polling-based updates (30–60s intervals) cause stale predictions
   - No client-side caching—every screen load hits network
   - Upstream SOAP API latency (500–1200ms) feels sluggish
   - Jittery updates (prediction jumps from "5 min" to "1 min" abruptly)
   - No graceful degradation when live data unavailable
   - Battery drain from aggressive polling

### Why Expo + React Native?

**Target Users:** Virginia Tech students, Blacksburg residents, and visitors (iOS and Android, roughly 60/40 split).

**Benefits:**

- Single codebase reduces development time by ~40% vs. native
- Expo's managed workflow: OTA updates, no Xcode/Android Studio for most dev
- Strong ecosystem for maps, location, and background tasks
- Fast iteration: hot reload, EAS Build CI/CD
- Native performance for lists and maps with proper optimization

---

## 2. Goals & Non-Goals

### Goals

1. **Delightful, Accessible UI**: WCAG 2.1 AA compliant; passes TalkBack/VoiceOver audit; Dynamic Type support; dark mode.
2. **Reliable Next-Arrival Info**: Real-time predictions with ≤15s latency; fallback to schedules if live data unavailable; smooth ETA updates (no jitter).
3. **Fast Perceived Performance**: Cold start ≤2.5s on mid-range Android (Pixel 5); list scroll 60fps; instant favorite/search interactions.
4. **Offline Usefulness**: Cached schedules, favorites, and last-known arrivals visible without network.
5. **Privacy-Respecting Location**: GPS used only on-device for "Nearest Stops"; no server-side tracking; truncated coordinates in logs.
6. **Low Battery Usage**: No background location; pause polling when app backgrounded; ≤3% battery/hour active use.

### Non-Goals (v1 Scope)

- **Fare purchase / mobile ticketing** (future consideration)
- **Driver console or dispatch tools** (separate stakeholder)
- **Full trip planner** (A→B routing across multiple routes/transfers)—v1 provides stop/route browsing; users plan manually
- **Push notifications for arrivals** (v1.1 feature)
- **Offline GTFS bundle** (v1 uses network-fetched cached data; v1.1 may add)

---

## 3. Users & Personas

### Persona 1: Sarah – VT Commuter (Student)

**Demographics:** 20, Junior, lives off-campus (Foxridge)  
**Jobs-to-be-Done:**

- "Get to class on time from my apartment" (Hethwood/MSN routes)
- "Know if I need to leave now or can wait 10 more minutes"
- "Check service during bad weather or exam week"

**Constraints:**

- Phone: Android (Samsung A52), moderate data plan
- Poor signal in some campus buildings
- Needs one-handed operation (carrying backpack, coffee)

### Persona 2: Miguel – Town Resident

**Demographics:** 35, works at Corporate Research Center (CRC)  
**Jobs-to-be-Done:**

- "Commute to work without driving" (UCB/CRC routes)
- "Save my home/work stops as favorites for quick access"
- "Check alerts for detours or delays"

**Constraints:**

- iPhone 12, good signal
- Accessibility need: low vision (uses VoiceOver, large text)
- Time-sensitive: needs confidence in arrival predictions

### Persona 3: Jamie – First-Time Visitor

**Demographics:** 28, visiting VT for conference  
**Jobs-to-be-Done:**

- "Find a bus stop near my hotel"
- "Understand which route goes downtown"
- "Get to Lane Stadium for a game"

**Constraints:**

- Unfamiliar with routes/stops
- May have poor cellular (crowded event)
- Needs clear onboarding and labels

---

## 4. Key Use Cases / User Stories

### Core Use Cases

| ID   | User Story                                                                                                          | Priority | Acceptance Notes                                                               |
| ---- | ------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| UC-1 | As a **commuter**, I want to **see next buses for my frequent stop** so that **I know when to leave**.              | P0       | Real-time if available; fallback schedule; sorted by ETA; show headsign/route. |
| UC-2 | As a **student**, I want to **search for a route by name or number** so that **I can view its schedule and stops**. | P1       | Fuzzy search; instant results; keyboard dismisses on select.                   |
| UC-3 | As a **rider**, I want to **see live bus positions on a map** so that **I can track my bus approaching**.           | P2       | Vehicle pins update every 10–15s; cluster if >5 in view; tap pin → route info. |
| UC-4 | As a **frequent rider**, I want to **favorite stops and routes** so that **I have quick access from home screen**.  | P2       | Local persistence; swipe to unfavorite; badge shows next arrival time.         |
| UC-5 | As a **visitor**, I want to **find the nearest stops to my location** so that **I can catch a bus quickly**.        | P2       | GPS permission prompt; list sorted by distance; show walking time.             |
| UC-6 | As a **rider**, I want to **see service alerts affecting my route** so that **I'm aware of delays or detours**.     | P3       | Severity badges; filter by route/stop; banner on affected stop/route screens.  |

### Edge Cases

- **Late-night service:** No departures after 11pm most routes; show "Service ended" with next day's first departure.
- **Detours:** Alert banner on route screen; map shows temporary routing if data available.
- **Canceled trip:** Prediction removed from list; show "Trip canceled" if API provides reason.
- **Missing vehicle telemetry:** Show schedule-based predictions with "Live data unavailable" chip.
- **GPS denied:** "Nearest Stops" shows permission prompt; fallback to manual search.
- **No network:** Display cached data with timestamp "Updated 5 min ago"; retry button.

---

## 5. UX Principles & Accessibility

### Design Principles

1. **Information Hierarchy:** "Next arrivals" always top; maps and lists secondary.
2. **Glanceable:** Large type (min 17pt body), high contrast (4.5:1+), bold headings.
3. **Forgiving:** Undo for unfavorite; clear error recovery; no dead ends.
4. **Offline First:** Last-known data visible; indicate staleness; no blank screens.
5. **Performance as Feature:** Skeleton screens; instant local actions (favorite, search); optimistic updates.

### Accessibility (WCAG 2.1 AA)

- **Tap Targets:** 44×44 pt minimum; 8pt spacing between interactive elements.
- **Dynamic Type:** Support iOS/Android text scaling (up to 200%); reflow layouts.
- **Color Contrast:** 4.5:1 text, 3:1 graphical elements; test with Stark/axe DevTools.
- **Screen Readers:**
  - Semantic roles (`accessibilityRole`: button, header, list)
  - Labels for icons (`accessibilityLabel`: "Refresh arrivals")
  - Hints for non-obvious actions (`accessibilityHint`: "Double tap to favorite this stop")
  - Announce live updates (use `accessibilityLiveRegion: "polite"` for arrival countdowns)
- **Keyboard/Focus:** Logical tab order; visible focus indicator; no keyboard traps.
- **Motion:** Respect `prefers-reduced-motion`; no auto-playing animations >5s.
- **Haptics:** Light feedback on favorite/tap (optional; respect system settings).

### Screen Map & Navigation

**Tab Bar (bottom):**

1. **Near Me** (location pin icon): GPS-sorted stops; walking distance.
2. **Search** (magnifying glass): Unified search (stops, routes, places).
3. **Map** (map icon): Live vehicles; stop markers; route overlays.
4. **Favorites** (star icon): Pinned stops/routes; quick access to next arrivals.
5. **Alerts** (bell icon): Service alerts; filter by route/stop; severity badges.

**Modal Screens:**

- Stop Detail (pushed from Near Me, Search, Map tap)
- Route Detail (pushed from Search, Stop Detail)
- Settings (header right button on any tab)

**Wireframe Notes (ASCII Concept):**

```
┌─────────────────────────────┐
│  ← Stop: Squires (123)      │ ← Header: Back, name, Favorite ★
├─────────────────────────────┤
│  🚍 MSN → CRC               │ ← Next arrival card (route badge, headsign)
│     5 min  •  On time       │ ← ETA, status
├─────────────────────────────┤
│  🚍 HWD → Foxridge          │
│     12 min  •  Delayed 3m   │
├─────────────────────────────┤
│  🚍 MSN → CRC               │
│     20 min                  │
├─────────────────────────────┤
│  📍 View on Map             │ ← Action button
└─────────────────────────────┘
┌─ Tab Bar ──────────────────┐
│ Near Me  Search  Map  Fav  │
└─────────────────────────────┘
```

### Dark Mode

- System theme auto-detection (`useColorScheme`)
- High contrast in both modes (test with iOS "Increase Contrast")
- Consistent accent color (BT brand orange/maroon)

---

## 6. Feature Requirements (Functional)

### 6.1 Search & Discovery

**FR-1.1:** Search by stop name, stop ID, or route number/name.  
**FR-1.2:** Fuzzy matching (handle typos: "squres" → "Squires").  
**FR-1.3:** Instant results (no search button; type-ahead).  
**FR-1.4:** Recent searches saved locally (max 10).  
**FR-1.5:** Landmark aliases (e.g., "Drillfield" → nearby stops).

**Acceptance:**

- Search "123" returns Stop 123 (Squires).
- Search "msn" returns MSN route.
- Results appear <100ms on 2020+ devices.

---

### 6.2 Nearest Stops (GPS)

**FR-2.1:** Request location permission on first use (explain benefit: "Find stops near you").  
**FR-2.2:** Show stops within 800m, sorted by walking distance.  
**FR-2.3:** Debounce GPS updates (min 30s between queries; no updates in background).  
**FR-2.4:** Display walking time (assume 1.4 m/s = ~5 km/h).  
**FR-2.5:** Graceful degradation if permission denied: prompt to enable or use Search.  
**FR-2.6:** Show user's location on map (blue dot); do not send to server.

**Acceptance:**

- List updates when user moves >100m.
- No GPS queries if app backgrounded.
- Battery impact <2% over 30 min active use.

---

### 6.3 Stop Detail Screen

**FR-3.1:** Display stop name, ID, and address (if available).  
**FR-3.2:** Show next 5 departures, sorted by ETA ascending.  
**FR-3.3:** Each departure shows:

- Route badge (color-coded if design specifies)
- Headsign (destination)
- ETA (minutes, or "Approaching" if <60s, or "Delayed" if >5min behind schedule)
- Status indicator (on time / delayed / scheduled)
  **FR-3.4:** Real-time updates every 10s when screen focused; pause when backgrounded.  
  **FR-3.5:** Pull-to-refresh manual override.  
  **FR-3.6:** Favorite/unfavorite toggle (star icon, top-right).  
  **FR-3.7:** "View on Map" button (opens Map tab, centered on stop).  
  **FR-3.8:** Show alert banner if stop affected by service alert.  
  **FR-3.9:** Fallback to scheduled departures if live data unavailable (display "Schedule only" chip).  
  **FR-3.10:** Empty state: "No upcoming departures. Next bus: tomorrow 6:30 AM."

**Acceptance:**

- ETAs update smoothly (no jumps >2 min unless real change).
- Clamp negative ETAs to "Approaching."
- Dedupe identical predictions (same route/headsign/ETA).

---

### 6.4 Route Detail Screen

**FR-4.1:** Display route name, number, and description.  
**FR-4.2:** Direction switcher (e.g., "Outbound" / "Inbound" or loop start point).  
**FR-4.3:** List all stops in order; tap to view Stop Detail.  
**FR-4.4:** Show live vehicle pins on map (if available).  
**FR-4.5:** Polyline overlay of route path (if shape data available; else connect stops with straight lines).  
**FR-4.6:** Favorite/unfavorite toggle.  
**FR-4.7:** Service hours display (e.g., "Mon–Fri 6:00 AM – 11:00 PM").  
**FR-4.8:** Alert banner if route has active service alert.

**Acceptance:**

- Direction switch reloads stop list <300ms.
- Map zoom/pan smooth (60fps).

---

### 6.5 Favorites

**FR-5.1:** Local persistence (AsyncStorage or MMKV).  
**FR-5.2:** Support both stops and routes.  
**FR-5.3:** Display next arrival time for each favorited stop (badge or subtitle).  
**FR-5.4:** Swipe-to-delete or edit mode for unfavoriting.  
**FR-5.5:** Reorder favorites (drag-and-drop; optional v1.1).  
**FR-5.6:** Empty state: "No favorites yet. Tap ★ on any stop or route."

**Acceptance:**

- Favorites persist across app restarts.
- Next arrival updates every 15s when Favorites tab focused.
- Max 20 favorites (soft limit; warn user if exceeded).

---

### 6.6 Service Alerts

**FR-6.1:** Fetch alerts from API; display severity (info / warning / critical).  
**FR-6.2:** Filter by route or stop (optional; v1 may show all alerts).  
**FR-6.3:** Show cause (e.g., "Construction"), effect (e.g., "Detour"), and description.  
**FR-6.4:** Banner on affected Stop/Route Detail screens.  
**FR-6.5:** Timestamp: "Posted 2 hours ago."  
**FR-6.6:** Link to BT website for full details (optional).

**Acceptance:**

- Alerts refresh every 5 minutes.
- Critical alerts display red banner; info alerts display blue.

---

### 6.7 Map View

**FR-7.1:** Display all active routes (polylines; color-coded if data supports).  
**FR-7.2:** Stop markers (tap to view Stop Detail popover or push to full screen).  
**FR-7.3:** Live vehicle pins (update every 10–15s); cluster if >5 vehicles in viewport.  
**FR-7.4:** User location (blue dot; re-center button).  
**FR-7.5:** Route filter (show/hide specific routes).  
**FR-7.6:** Prefetch map tiles near current viewport (react-native-maps default; ensure cache enabled).

**Acceptance:**

- Pan/zoom 60fps on 2019+ devices.
- Vehicle pins update without full map redraw.
- Tap stop marker → Stop Detail in <200ms.

---

### 6.8 Settings

**FR-8.1:** Theme: Auto / Light / Dark.  
**FR-8.2:** Units: Imperial (mi) / Metric (km) for distances.  
**FR-8.3:** Permissions status (Location, Notifications [v1.1]).  
**FR-8.4:** Analytics opt-in toggle (if implemented).  
**FR-8.5:** Privacy policy and terms links.  
**FR-8.6:** About: version number, build, license (open source).  
**FR-8.7:** Clear cache button (force refresh all data).

---

## 7. Data & API Integration Plan

### 7.1 Primary SOAP/ASMX Endpoints (BT4U)

**Service Root:** `http://216.252.195.248/webservices/bt4u_webservice.asmx` (mirror: `https://www.bt4uclassic.org/webservices/bt4u_webservice.asmx`)

| Endpoint                                     | Purpose                               | Polling Interval                            | Screen Mapping          |
| -------------------------------------------- | ------------------------------------- | ------------------------------------------- | ----------------------- |
| `GetCurrentRoutes`                           | Fetch active routes (ID, name, color) | On app start, then every 5 min (background) | Search, Map, Route List |
| `GetNearestStops`                            | Stops within radius of lat/lon        | On "Near Me" tab focus, GPS change >100m    | Near Me tab             |
| `GetNextDeparturesForStop`                   | Real-time predictions for stop ID     | Every 10–15s when Stop Detail focused       | Stop Detail screen      |
| `GetScheduledStopInfo`                       | Fallback schedule if live unavailable | On demand when live data missing            | Stop Detail fallback    |
| `GetRouteStops`                              | List stops for route+direction        | On Route Detail load                        | Route Detail screen     |
| `GetVehiclePositions` (if exists)            | Live vehicle lat/lon/heading          | Every 10–15s when Map tab focused           | Map view pins           |
| `GetAlerts` (if exists; else scrape or skip) | Service alerts                        | Every 5 min                                 | Alerts tab, banners     |

**Note:** Confirm endpoint availability during dev; if `GetVehiclePositions` or `GetAlerts` missing, document fallback (schedule-only, no alerts).

---

### 7.2 SOAP→JSON Proxy Architecture

**Purpose:**

- Convert XML/SOAP to JSON for React Native consumption.
- Cache responses to reduce upstream load and latency.
- Apply backoff and circuit breaking on upstream failures.
- Expose REST/JSON + SSE for real-time streams.

**Tech Stack:**

- **Runtime:** Vercel Edge Functions (Node.js-compatible, global CDN).
- **Language:** TypeScript.
- **Libraries:** `fast-xml-parser` (XML→JSON), `@vercel/edge` caching, `lru-cache` for in-memory.

**Endpoints (Proxy):**

```
GET  /api/routes
GET  /api/stops/nearby?lat={lat}&lon={lon}&radius={meters}
GET  /api/stops/{stopId}/departures
GET  /api/stops/{stopId}/schedule
GET  /api/routes/{routeId}/stops?direction={0|1}
GET  /api/vehicles?routeId={routeId}  (optional)
GET  /api/alerts
SSE  /api/events/stop/{stopId}  (server-sent events for live updates; v1.1)
```

**Caching Strategy:**

| Endpoint                     | TTL    | Cache Key                  | Rationale                  |
| ---------------------------- | ------ | -------------------------- | -------------------------- |
| `/api/routes`                | 5 min  | Global                     | Routes change infrequently |
| `/api/stops/nearby`          | 30 sec | `lat,lon,radius` (rounded) | Balance freshness + load   |
| `/api/stops/{id}/departures` | 10 sec | `stopId`                   | Core real-time data        |
| `/api/stops/{id}/schedule`   | 1 hour | `stopId`                   | Static schedule            |
| `/api/routes/{id}/stops`     | 5 min  | `routeId,direction`        | Semi-static                |
| `/api/vehicles`              | 10 sec | `routeId` (or global)      | Real-time positions        |
| `/api/alerts`                | 5 min  | Global                     | Infrequent changes         |

**Backoff & Rate Limiting:**

- **Rate Limit:** 100 req/min per IP (generous for single app; protect against abuse).
- **Upstream Circuit Breaker:** After 3 consecutive failures (5xx or timeout >3s), open circuit for 30s; return cached data or 503.
- **Client Backoff:** Exponential (10s, 20s, 40s) on proxy 5xx; jitter ±20%.

**Health Checks:**

- `/api/health` endpoint: returns `{status: "ok", uptime, cache_hit_rate, upstream_latency_p95}`.
- Synthetic check every 5 min (UptimeRobot or Vercel's monitoring).

---

### 7.3 Proxy Implementation Details

**Sequence Diagram: App ↔ Proxy ↔ BT4U**

```
App (React Native)       Proxy (Vercel Edge)       BT4U (SOAP)
      |                          |                       |
      |--GET /api/stops/123/---> |                       |
      |     departures           |                       |
      |                          |--Check Cache--------> |
      |                          |   (HIT: return)       |
      |                          |   (MISS: continue)    |
      |                          |                       |
      |                          |--SOAP Request-------> |
      |                          | GetNextDepartures...  |
      |                          |                       |
      |                          | <----XML Response---- |
      |                          | (Parse XML→JSON)      |
      |                          | (Store in cache, 10s) |
      |                          |                       |
      | <----JSON Response------ |                       |
      | {predictions: [...]}     |                       |
      |                          |                       |
```

**Error Handling:**

- **Timeout (>3s):** Return cached data if available; else `{error: "Upstream timeout", cached: false}`.
- **XML Parse Error:** Log, return 502 Bad Gateway.
- **Upstream 4xx/5xx:** Return cached data if <5 min old; else forward error.

---

### 7.4 Example JSON Schemas

**Stop:**

```json
{
  "id": "123",
  "name": "Squires Student Center",
  "lat": 37.2296,
  "lon": -80.4239,
  "address": "365 W Campus Dr, Blacksburg, VA 24061",
  "routes": ["MSN", "HWD", "UCB"]
}
```

**Route:**

```json
{
  "id": "MSN",
  "name": "Main Street North",
  "color": "#FF6600",
  "directions": [
    { "id": 0, "name": "Outbound" },
    { "id": 1, "name": "Inbound" }
  ],
  "serviceHours": "Mon-Fri 6:00 AM - 11:00 PM"
}
```

**Prediction:**

```json
{
  "routeId": "MSN",
  "headsign": "Corporate Research Center",
  "predictedArrivalTime": "2025-11-04T14:35:00Z",
  "etaMinutes": 5,
  "etaSeconds": 300,
  "status": "on_time", // on_time | delayed | early | scheduled
  "delayMinutes": 0,
  "vehicleId": "1023",
  "scheduleBased": false
}
```

**Alert:**

```json
{
  "id": "alert-001",
  "severity": "warning", // info | warning | critical
  "cause": "Construction",
  "effect": "Detour",
  "description": "MSN route detoured via Patrick Henry Dr due to road work on Main St.",
  "affectedRoutes": ["MSN"],
  "affectedStops": [],
  "startTime": "2025-11-04T08:00:00Z",
  "endTime": "2025-11-06T18:00:00Z",
  "postedAt": "2025-11-04T07:45:00Z"
}
```

---

### 7.5 Client Polling Strategy (React Query)

**Configuration:**

```typescript
// React Query defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000, // 10s for departures
      cacheTime: 5 * 60 * 1000, // 5 min memory cache
      refetchOnWindowFocus: true, // Refresh on app foreground
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000), // Exponential backoff
    },
  },
});
```

**Screen-Specific Refetch Intervals:**

| Screen         | Refetch Interval | Condition                      |
| -------------- | ---------------- | ------------------------------ |
| Stop Detail    | 10s              | Focused; pause if backgrounded |
| Favorites      | 15s              | Focused                        |
| Map (vehicles) | 12s              | Focused                        |
| Near Me        | 30s              | Focused                        |
| Alerts         | 5 min            | Background-safe                |

**Implementation:**

- Use `refetchInterval` with `enabled` based on `useIsFocused()` (React Navigation).
- Jitter: add random 0–20% to intervals to avoid thundering herd.

---

### 7.6 Data Validation & Smoothing (Client-Side)

**FR-DATA-1:** Clamp negative ETAs to 0 (display "Approaching").  
**FR-DATA-2:** Dedupe predictions: if two have same `routeId + headsign + etaMinutes`, keep first.  
**FR-DATA-3:** Smooth ETA decrements: if new ETA < old ETA - 2 min (and <10s elapsed), ignore (likely jitter).  
**FR-DATA-4:** Flag `scheduleBased: true` if API indicates no live vehicle data.  
**FR-DATA-5:** Validate lat/lon bounds (Blacksburg: ~37.1–37.3, -80.5 to -80.3); reject outliers.

**Zod Schema (example):**

```typescript
const PredictionSchema = z.object({
  routeId: z.string(),
  headsign: z.string(),
  etaMinutes: z.number().min(0).max(120),
  status: z.enum(["on_time", "delayed", "early", "scheduled"]),
  scheduleBased: z.boolean(),
});
```

---

## 8. Non-Functional Requirements

### 8.1 Performance Budgets

| Metric                           | Target | Measurement                        |
| -------------------------------- | ------ | ---------------------------------- |
| **Cold Start (Android Pixel 5)** | ≤2.5s  | Time to interactive (TTI)          |
| **Cold Start (iPhone 12)**       | ≤2.0s  | TTI                                |
| **Interaction Latency**          | <100ms | Tap → visual feedback              |
| **List Scroll (FlatList)**       | 60fps  | No janks >16ms                     |
| **Stop Detail Load**             | <1.2s  | Network + render                   |
| **Search Results**               | <300ms | Keystroke → results display        |
| **Map Pan/Zoom**                 | 60fps  | No dropped frames                  |
| **Bundle Size (JS)**             | <3MB   | After minification, pre-gzip       |
| **Memory (Android)**             | <150MB | Steady state (5 screens navigated) |

**Tools:**

- Expo dev tools: Performance monitor overlay.
- Flipper: React DevTools profiler, Network inspector.
- `react-native-performance` for production metrics (optional).

---

### 8.2 Reliability

| Metric                  | Target | Mitigation                                               |
| ----------------------- | ------ | -------------------------------------------------------- |
| **Crash-Free Sessions** | ≥99.9% | Error boundaries, Sentry crash reporting                 |
| **Proxy Uptime**        | ≥99.9% | Vercel SLA; fallback to direct SOAP if proxy down (v1.1) |
| **API Success Rate**    | ≥99%   | Retry logic, circuit breaker, cached fallback            |

**Error Boundaries:**

- Top-level boundary: catch render errors → show "Something went wrong" with retry.
- Screen-level boundaries: isolate tab crashes (e.g., Map crash doesn't kill app).

---

### 8.3 Battery & Network Efficiency

**Battery:**

- **Active Use:** ≤3% battery/hour (no GPS), ≤5% with GPS.
- **Background:** 0% (no background tasks in v1; location disabled when backgrounded).

**Network:**

- **Data Usage:** ~2MB/hour active use (mix of API calls + map tiles).
- **Offline:** Cached data allows 80% of interactions without network (view favorites, last-known arrivals, schedules).

**Implementation:**

- Use `NetInfo` to detect offline; queue writes (favorites) if offline.
- Compress API responses (gzip); Vercel Edge supports auto-compression.
- Throttle GPS: update every 30s max; no updates in background.

---

### 8.4 Privacy & Data Handling

**FR-PRIV-1:** No PII collected (no user accounts, names, emails).  
**FR-PRIV-2:** GPS location used only on-device for "Near Me" calculations; **never sent to server** (proxy receives only stop IDs, not user location).  
**FR-PRIV-3:** Logs truncate coordinates to 2 decimal places (~1km precision) if debugging network issues.  
**FR-PRIV-4:** Favorites stored locally (AsyncStorage/MMKV); not synced to cloud (v1).  
**FR-PRIV-5:** Analytics (if enabled): coarse location (city-level), screen views, anonymized crash logs; opt-in required.

**Compliance:**

- GDPR: No personal data → minimal compliance burden.
- CCPA: No sale of data.
- Accessibility: WCAG 2.1 AA (ADA compliance).

---

### 8.5 Accessibility Testing

**Automated:**

- `eslint-plugin-jsx-a11y` (React Native rules).
- Axe DevTools (web preview if using Expo Web).

**Manual:**

- **TalkBack (Android):** Full flow test (Near Me → Stop Detail → Favorite).
- **VoiceOver (iOS):** Same flow; verify labels, hints, live regions.
- **Dynamic Type:** Test at 200% text size; ensure no truncation/overflow.
- **Color Contrast:** Stark plugin in Figma; manual check in app (light/dark modes).

**Acceptance:** Zero critical issues; all interactive elements labeled and focusable.

---

## 9. Mobile Architecture (Expo + React Native Best Practices)

### 9.1 Tech Stack

| Layer                | Technology                                  | Rationale                                        |
| -------------------- | ------------------------------------------- | ------------------------------------------------ |
| **Framework**        | Expo SDK 50+                                | Managed workflow; OTA updates; streamlined build |
| **Language**         | TypeScript (strict mode)                    | Type safety; better DX                           |
| **Navigation**       | React Navigation 6                          | Industry standard; deep linking support          |
| **State (Server)**   | React Query (TanStack Query)                | Caching, retries, focus refetch, devtools        |
| **State (UI/Local)** | Zustand (or Redux Toolkit if complex)       | Lightweight; avoid prop drilling                 |
| **Styling**          | Styled-components (or Tailwind RN)          | Scoped styles; theme support                     |
| **Maps**             | react-native-maps                           | Free (Google Maps/Apple Maps); wide adoption     |
| **Storage**          | MMKV (or AsyncStorage fallback)             | Fast key-value store for favorites/settings      |
| **Validation**       | Zod                                         | Runtime schema validation; TS integration        |
| **Testing**          | Jest + React Native Testing Library + Detox | Unit, integration, E2E                           |
| **CI/CD**            | EAS Build + EAS Update                      | Expo-native; GitHub Actions integration          |
| **Error Tracking**   | Sentry (free tier)                          | Crash reporting; performance monitoring          |

---

### 9.2 Project Structure

```
/app
  /_layout.tsx           # Root layout (providers, navigation)
  /(tabs)                # Tab navigator group
    /near-me.tsx
    /search.tsx
    /map.tsx
    /favorites.tsx
    /alerts.tsx
  /stop/[id].tsx         # Stop Detail (dynamic route)
  /route/[id].tsx        # Route Detail
/components
  /StopCard.tsx
  /RouteCard.tsx
  /LoadingSpinner.tsx
  /ErrorBoundary.tsx
/lib
  /api.ts               # Proxy API client (fetch wrappers)
  /hooks
    /useStopDepartures.ts  # React Query hooks
    /useNearbyStops.ts
  /stores
    /favoritesStore.ts  # Zustand store
  /utils
    /time.ts            # ETA formatting, date helpers
    /geo.ts             # Distance calculations
    /validation.ts      # Zod schemas
/constants
  /Colors.ts
  /Config.ts            # API URLs, intervals
/types
  /api.ts               # TS interfaces for API responses
```

---

### 9.3 State Management Strategy

**Server State (React Query):**

- All API data (stops, routes, departures, alerts).
- Cached, refetched, invalidated automatically.

**Local/UI State (Zustand):**

- Favorites list (synced to MMKV).
- User preferences (theme, units).
- UI-only state (modal open, search query).

**Why not Redux?** Zustand simpler for small state surface; Redux Toolkit viable if team prefers (v1.1+).

**Example Hook:**

```typescript
export function useStopDepartures(stopId: string) {
  const isFocused = useIsFocused();
  return useQuery({
    queryKey: ["stop", stopId, "departures"],
    queryFn: () => api.getStopDepartures(stopId),
    enabled: isFocused,
    refetchInterval: isFocused ? 10_000 : false, // 10s when focused
    staleTime: 10_000,
  });
}
```

---

### 9.4 List Performance (FlatList)

**Optimizations:**

- `keyExtractor`: use stable IDs (stop ID, prediction ID).
- `getItemLayout`: provide fixed heights if uniform (skip measurement).
- `maxToRenderPerBatch={10}`, `updateCellsBatchingPeriod={50}`.
- `removeClippedSubviews={true}` on Android.
- Memoize row components: `React.memo(StopCard)`.
- `useMemo` for derived data (sorted/filtered lists).

**Acceptance:** 60fps scroll on 2019+ devices; no visible janks.

---

### 9.5 Map Performance (react-native-maps)

**Optimizations:**

- Cluster vehicle pins if >5 in viewport (use `react-native-map-clustering`).
- Throttle vehicle updates: batch position changes, update every 10–15s.
- Prefetch tiles: react-native-maps handles this; ensure cache enabled.
- Reduce overdraw: hide off-screen markers with `tracksViewChanges={false}` after initial render.
- Use `mapPadding` for safe areas (not manual margins).

**Custom Markers:**

- Use native image markers (faster than custom React components).
- Vehicle: small SVG → PNG asset (30×30 pt); rotate based on heading.

---

### 9.6 OTA Updates (EAS Update)

**Strategy:**

- Push non-native changes (JS, assets) via EAS Update.
- Critical fixes: OTA within 1 hour.
- Feature releases: weekly cadence.

**Channels:**

- `production`: stable, all users.
- `preview`: internal beta (TestFlight/Play Internal).

**Feature Flags:**

- Use simple config file or `expo-constants` + remote JSON.
- Toggle risky features (e.g., new map provider) without redeploying.

---

### 9.7 Error Handling

**Error Boundaries:**

```typescript
<ErrorBoundary fallback={<ErrorScreen />}>
  <Navigation />
</ErrorBoundary>
```

**Network Errors:**

- Display retry button + cached data.
- Toast for transient failures; modal for critical (e.g., location denied).

**Empty States:**

- "No departures available" (with next day's first departure).
- "No favorites yet. Tap ★ on any stop."
- "Search for stops, routes, or places."

**Sentry Integration:**

- Capture crashes, unhandled promise rejections.
- Breadcrumbs: screen navigation, API calls.
- Release tracking: tag with version + build number.

---

## 10. Realtime Architecture (Proxy)

### 10.1 Proxy Tech Stack

| Component         | Technology                              |
| ----------------- | --------------------------------------- |
| **Runtime**       | Vercel Edge Functions (V8 isolates)     |
| **Language**      | TypeScript                              |
| **SOAP Client**   | `node-fetch` + `fast-xml-parser`        |
| **Caching**       | Vercel Edge Cache (KV) + in-memory LRU  |
| **Rate Limiting** | Vercel KV + Upstash Rate Limit SDK      |
| **Monitoring**    | Vercel Analytics + custom `/api/health` |

---

### 10.2 Endpoint Implementations

**Example: `/api/stops/[stopId]/departures`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { fetchBT4U, parsePredictions } from "@/lib/bt4u";
import { cacheGet, cacheSet } from "@/lib/cache";

export const config = { runtime: "edge" };

export default async function handler(req: NextRequest) {
  const stopId = req.nextUrl.pathname.split("/")[3];
  const cacheKey = `departures:${stopId}`;

  // Check cache
  const cached = await cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    // Fetch from BT4U SOAP
    const xml = await fetchBT4U("GetNextDeparturesForStop", { StopID: stopId });
    const predictions = parsePredictions(xml);

    // Cache for 10s
    await cacheSet(cacheKey, predictions, 10);

    return NextResponse.json(predictions);
  } catch (error) {
    console.error("BT4U fetch error:", error);
    // Return stale cache if available (up to 5 min old)
    const stale = await cacheGet(cacheKey, { allowStale: true });
    if (stale) return NextResponse.json({ ...stale, cached: true });

    return NextResponse.json(
      { error: "Upstream unavailable" },
      { status: 503 }
    );
  }
}
```

---

### 10.3 Rate Limiting

**Strategy:**

- 100 requests/min per IP (Upstash Rate Limit).
- Return `429 Too Many Requests` with `Retry-After` header.

**Client Handling:**

- React Query: respect `Retry-After`; exponential backoff.

---

### 10.4 Circuit Breaker

**Logic:**

- Track last 10 upstream requests.
- If ≥7 failures (5xx, timeout >3s), open circuit for 30s.
- While open: return cached data or 503.
- After 30s: half-open (try 1 request); if success, close circuit.

**Implementation:** In-memory state (per Edge region); acceptable for v1.

---

### 10.5 Metrics & Logging

**Health Endpoint (`/api/health`):**

```json
{
  "status": "ok",
  "uptime": 86400,
  "cache_hit_rate": 0.73,
  "upstream_latency_p95_ms": 850,
  "requests_last_hour": 1523,
  "circuit_breaker_state": "closed"
}
```

**Logs:**

- Info: request path, cache hit/miss, duration.
- Warn: slow upstream (>2s), cache miss streak.
- Error: SOAP parse failure, upstream timeout.

**Monitoring:**

- Vercel Dashboard: invocations, errors, duration.
- Uptime check: Pingdom / UptimeRobot (5 min interval).

---

### 10.6 SSE Endpoint (v1.1)

**`/api/events/stop/[stopId]` (Server-Sent Events):**

- Stream live updates to client (no polling).
- Client: `EventSource` polyfill (`react-native-sse`).
- Server: keep connection open; push updates every 10s or when data changes.

**Acceptance (v1.1):**

- Reduce client polling; battery savings ~15%.
- Fallback to polling if SSE unsupported.

---

## 11. Security, Compliance, & Risk

### 11.1 Security Measures

**Input Validation:**

- Sanitize `stopId`, `routeId` (alphanumeric only).
- Validate lat/lon ranges (Blacksburg bounds).
- Zod schemas on API responses (reject malformed upstream data).

**SOAP Risks:**

- **XML Entity Expansion (XXE):** Use `fast-xml-parser` with `allowBooleanAttributes: true, ignoreAttributes: false`, disable external entities.
- **Timeout:** 3s max per SOAP request.

**Secrets Management:**

- No secrets in client (all API keys server-side only).
- Vercel environment variables for BT4U URL (if auth added later).
- No SSL pinning required (upstream not HTTPS; consider MITM risk low for public transit data).

**HTTPS:**

- Client ↔ Proxy: HTTPS (Vercel default).
- Proxy ↔ BT4U: HTTP (upstream limitation; data not sensitive).

---

### 11.2 Compliance

**Open Source (MIT License):**

- Include LICENSE file.
- Contributor guidelines (CONTRIBUTING.md).
- Code of Conduct.

**App Store Requirements:**

- iOS: Privacy manifest (location usage, analytics opt-in).
- Android: Data Safety section (no data collected; location local-only).

**Accessibility:**

- WCAG 2.1 AA compliance → ADA/Section 508 alignment.

---

### 11.3 Operational Risks & Mitigations

| Risk                              | Impact                      | Likelihood | Mitigation                                    |
| --------------------------------- | --------------------------- | ---------- | --------------------------------------------- |
| **BT4U API outage**               | No live data; app degraded  | Medium     | Cache + fallback to schedules; display banner |
| **Missing vehicle telemetry**     | No live ETAs; schedule only | High       | Fallback logic; "Live data unavailable" chip  |
| **Proxy outage (Vercel)**         | App unusable                | Low        | 99.9% SLA; v1.1: direct SOAP fallback         |
| **Route changes (new stops)**     | Stale data                  | Low        | Cache TTL 5 min; manual refresh; alerts       |
| **GPS inaccurate (urban canyon)** | Wrong "nearest stops"       | Medium     | Show accuracy radius; allow manual search     |
| **Slow upstream (>3s)**           | Poor UX                     | Medium     | Circuit breaker; cached data; timeout         |

---

## 12. Testing Strategy

### 12.1 Unit Tests (Jest)

**Coverage Target:** ≥70% lines, ≥80% functions.

**Focus Areas:**

- Data mappers: SOAP XML → JSON (mock fixtures).
- Time utilities: ETA formatting ("5 min", "Approaching").
- Geo calculations: haversine distance, walking time.
- Validation: Zod schemas reject invalid data.
- Polling logic: backoff, jitter calculations.

**Example:**

```typescript
describe("formatETA", () => {
  it('shows "Approaching" for <60s', () => {
    expect(formatETA(45)).toBe("Approaching");
  });
  it("shows minutes for ≥60s", () => {
    expect(formatETA(300)).toBe("5 min");
  });
});
```

---

### 12.2 Integration Tests (Proxy)

**Mock BT4U Responses:**

- Record real SOAP responses (fixtures).
- Test proxy endpoints return expected JSON.
- Contract tests: ensure schema stability.

**Tools:** Jest + `node-fetch` mock.

**Tests:**

- `/api/stops/123/departures` returns valid predictions.
- Cache hit: second request within 10s returns cached data.
- Upstream timeout: returns 503 after 3s.
- Rate limit: 101st request returns 429.

---

### 12.3 E2E Tests (Detox)

**Critical Flows:**

1. **Nearest Stops → Stop Detail → Favorite**

   - Grant location permission.
   - Verify "Near Me" shows ≥3 stops.
   - Tap first stop → Stop Detail loads.
   - Tap ★ → stop added to Favorites.
   - Navigate to Favorites tab → verify stop present.

2. **Search → Route Detail → Map**

   - Type "MSN" in search.
   - Tap route result.
   - Verify Route Detail shows stops.
   - Tap "View on Map" → map centers on route.

3. **Accessibility Flow (TalkBack)**
   - Enable TalkBack.
   - Navigate Near Me → Stop Detail.
   - Verify all elements focusable and labeled.

**Tools:** Detox + Expo Go (or dev client).

**Acceptance:** Flows pass on iOS Simulator (iPhone 14) and Android Emulator (Pixel 5).

---

### 12.4 Load Tests (Proxy)

**Scenario:** Simulate arrival rush (8:00 AM, 100 concurrent users checking stops).

**Tool:** k6 or Artillery.

**Metrics:**

- Requests/sec: 50 (100 users × 10s polling = ~50 req/s).
- p95 latency: <500ms (cached), <1.5s (cache miss).
- Error rate: <1%.

**Acceptance:** Proxy handles 50 req/s without degradation.

---

### 12.5 Synthetic Monitoring

**Production Checks (UptimeRobot, 5 min interval):**

- `/api/health` returns 200.
- `/api/stops/123/departures` returns valid JSON.

**Alerts:** Slack/email if 2 consecutive failures.

---

## 13. Rollout Plan & Milestones

### v0: MVP (Weeks 1–6)

**Scope:**

- Proxy: SOAP→JSON for stops, routes, departures.
- App: Stop Detail with real-time arrivals, basic search, favorites.
- A11y: WCAG AA baseline (labels, contrast, Dynamic Type).

**Deliverables:**

- [ ] Proxy deployed to Vercel; `/api/stops/{id}/departures` live.
- [ ] App: Near Me, Search, Stop Detail screens functional.
- [ ] Favorites: local storage, swipe-to-delete.
- [ ] TalkBack/VoiceOver pass: all core flows accessible.
- [ ] Unit tests: ≥60% coverage.

**Metrics:**

- TTI: <3s (Android mid-range).
- Stop Detail load: <1.5s.
- Crash-free: ≥99%.

**User Testing:** Internal beta (10 VT students); gather feedback.

---

### v1: Full Feature Set (Weeks 7–12)

**Scope:**

- Map view: live vehicles, route overlays, stop markers.
- Alerts: fetch and display service alerts; banners on affected screens.
- Route Detail: stop list, direction switch, favorite.
- Polish: dark mode, empty states, error handling, animations (subtle).

**Deliverables:**

- [ ] Map tab: react-native-maps integrated; vehicle pins update every 10s.
- [ ] Alerts tab: fetch from API (or mock if unavailable).
- [ ] Route Detail: complete functionality.
- [ ] Settings: theme, units, privacy links.
- [ ] E2E tests: Detox flows for 3 critical paths.
- [ ] Load test: proxy handles 50 req/s.

**Metrics:**

- TTI: <2.5s (Android), <2.0s (iOS).
- Map scroll: 60fps.
- Crash-free: ≥99.9%.
- Cache hit rate: ≥70%.

**Launch:**

- Submit to App Store + Google Play.
- Open source: publish repo (MIT license).
- Announce: VT subreddit, social media, BT website link.

---

### v1.1: Enhancements (Weeks 13–16)

**Scope:**

- Widgets: iOS Home Screen widget (next arrivals for favorite stop).
- Push notifications: opt-in alerts for favorite stops (e.g., "Bus arriving in 5 min").
- SSE: replace polling with server-sent events for arrivals.
- Deep links: `blacksburg-transit://stop/123` → Stop Detail.

**Deliverables:**

- [ ] iOS widget: WidgetKit, shows next 3 arrivals.
- [ ] Push: Expo Notifications, opt-in UI, background fetch.
- [ ] SSE endpoint: `/api/events/stop/{id}`.
- [ ] Deep linking: React Navigation + Expo Linking.

**Metrics:**

- Widget adoption: 20% of users enable.
- Push CTR: ≥40%.
- Battery (with push): <5% per hour.

---

### Metrics Summary

| Metric                    | v0 Target | v1 Target | v1.1 Target |
| ------------------------- | --------- | --------- | ----------- |
| **TTI (Android)**         | <3s       | <2.5s     | <2.5s       |
| **TTI (iOS)**             | <2.5s     | <2.0s     | <2.0s       |
| **Crash-Free Rate**       | ≥99%      | ≥99.9%    | ≥99.9%      |
| **Stop Detail Load**      | <1.5s     | <1.2s     | <1.0s       |
| **Cache Hit Rate**        | ≥60%      | ≥70%      | ≥75%        |
| **API p95 Latency**       | <1.5s     | <1.0s     | <800ms      |
| **Active Users (Week 1)** | 50 (beta) | 500       | 1,000+      |

---

## 14. Acceptance Criteria

### Feature-Level Acceptance

| Feature           | Criteria                                                                                                               | Measurement           |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------- |
| **Nearest Stops** | Loads within 1.2s on Pixel 5 (LTE); shows ≥3 stops within 500m; gracefully degrades if GPS denied.                     | Manual test; profiler |
| **Stop Detail**   | Displays next 5 departures; ETAs update every 10s (focused); "Approaching" for <60s; fallback banner if schedule-only. | Automated + manual    |
| **Favorites**     | Persists across restarts; max 20 stops/routes; next arrival badge updates every 15s; swipe-to-delete in <100ms.        | E2E test              |
| **Search**        | Results appear <300ms; fuzzy match "squres" → "Squires"; recent searches saved (max 10).                               | Performance test      |
| **Map**           | Pan/zoom 60fps; vehicle pins update without full redraw; cluster if >5 vehicles; tap stop marker → detail in <200ms.   | Profiler + manual     |
| **Alerts**        | Refresh every 5 min; critical alerts show red banner; filter by route (optional v1).                                   | Manual test           |
| **Accessibility** | Zero critical a11y issues (axe); TalkBack/VoiceOver flows pass; Dynamic Type up to 200%; 4.5:1 contrast.               | Automated + manual    |
| **Offline**       | Show cached data with timestamp; retry button; favorites accessible offline.                                           | Airplane mode test    |
| **Dark Mode**     | System theme auto-switch; high contrast in both modes.                                                                 | Visual test           |

---

## 15. Open Questions & Assumptions

### Open Questions

1. **Vehicle Positions API:** Does `GetVehiclePositions` (or equivalent) exist? If not, fallback to schedule-only predictions.

   - **Owner:** Dev Lead
   - **Decision Deadline:** Week 1 (v0 scoping)

2. **Service Alerts Endpoint:** Confirm `GetAlerts` availability. If missing, consider web scraping or manual entry (v1.1).

   - **Owner:** Backend Dev
   - **Deadline:** Week 3

3. **Route Shapes:** Are polyline geometries available (GTFS shapes.txt equivalent)? If not, connect stops with straight lines.

   - **Owner:** Dev Lead
   - **Deadline:** Week 6 (Map implementation)

4. **Analytics Opt-In:** Default opt-in or opt-out? Recommend opt-out (privacy-first).

   - **Owner:** PM
   - **Deadline:** Week 4

5. **Crowding Data:** Does API provide vehicle occupancy (low/medium/high)? If yes, display in Stop Detail.
   - **Owner:** Backend Dev
   - **Deadline:** Week 2

### Assumptions

1. **Upstream Reliability:** BT4U API uptime ≥99%; latency p95 <1.5s.

   - **Validation:** Monitor during dev; if violated, increase cache TTLs.

2. **User Base:** 1,000 active users (Week 1 post-launch); 5,000 by Month 3.

   - **Impact:** If exceeded, increase proxy rate limits and scale (Vercel auto-scales).

3. **Device Targets:** iOS 14+, Android 8+ (covers ~95% of VT student devices).

   - **Validation:** Check VT IT surveys; adjust if needed.

4. **Network Conditions:** Assume LTE (10 Mbps); test on 3G (1.5 Mbps) for rural riders.

5. **Open Source Contributors:** Expect 2–5 community PRs/month after launch (documentation, bug fixes).
   - **Mitigation:** Clear CONTRIBUTING.md; label "good first issue."

---

## Appendices

### Appendix A: Endpoint Catalog (JSON Examples)

**GET `/api/routes`**

Request: `GET https://proxy.blacksburg-transit.app/api/routes`

Response:

```json
[
  {
    "id": "MSN",
    "name": "Main Street North",
    "shortName": "MSN",
    "color": "#FF6600",
    "textColor": "#FFFFFF",
    "directions": [
      { "id": 0, "name": "Outbound" },
      { "id": 1, "name": "Inbound" }
    ],
    "serviceHours": "Mon-Fri 6:00 AM - 11:00 PM"
  },
  {
    "id": "HWD",
    "name": "Hethwood",
    "shortName": "HWD",
    "color": "#0066CC",
    "textColor": "#FFFFFF",
    "directions": [{ "id": 0, "name": "Loop" }],
    "serviceHours": "Mon-Fri 6:30 AM - 10:30 PM"
  }
]
```

---

**GET `/api/stops/nearby?lat=37.2296&lon=-80.4239&radius=800`**

Request: `GET https://proxy.blacksburg-transit.app/api/stops/nearby?lat=37.2296&lon=-80.4239&radius=800`

Response:

```json
[
  {
    "id": "123",
    "name": "Squires Student Center",
    "lat": 37.2296,
    "lon": -80.4239,
    "distanceMeters": 50,
    "walkingTimeSeconds": 36,
    "routes": ["MSN", "HWD", "UCB"]
  },
  {
    "id": "456",
    "name": "Drillfield",
    "lat": 37.2284,
    "lon": -80.4234,
    "distanceMeters": 150,
    "walkingTimeSeconds": 107,
    "routes": ["PRO", "MSN"]
  }
]
```

---

**GET `/api/stops/123/departures`**

Request: `GET https://proxy.blacksburg-transit.app/api/stops/123/departures`

Response:

```json
{
  "stopId": "123",
  "stopName": "Squires Student Center",
  "predictions": [
    {
      "routeId": "MSN",
      "routeName": "Main Street North",
      "headsign": "Corporate Research Center",
      "predictedArrivalTime": "2025-11-04T14:35:00Z",
      "etaMinutes": 5,
      "etaSeconds": 300,
      "status": "on_time",
      "delayMinutes": 0,
      "vehicleId": "1023",
      "scheduleBased": false
    },
    {
      "routeId": "HWD",
      "routeName": "Hethwood",
      "headsign": "Foxridge Apartments",
      "predictedArrivalTime": "2025-11-04T14:42:00Z",
      "etaMinutes": 12,
      "etaSeconds": 720,
      "status": "delayed",
      "delayMinutes": 3,
      "vehicleId": "1045",
      "scheduleBased": false
    }
  ],
  "cached": false,
  "lastUpdated": "2025-11-04T14:30:00Z"
}
```

---

**GET `/api/routes/MSN/stops?direction=0`**

Request: `GET https://proxy.blacksburg-transit.app/api/routes/MSN/stops?direction=0`

Response:

```json
{
  "routeId": "MSN",
  "direction": 0,
  "directionName": "Outbound",
  "stops": [
    {
      "id": "100",
      "name": "Squires Student Center",
      "sequence": 1,
      "lat": 37.2296,
      "lon": -80.4239
    },
    {
      "id": "101",
      "name": "Washington Street",
      "sequence": 2,
      "lat": 37.2305,
      "lon": -80.425
    },
    {
      "id": "102",
      "name": "Main Street",
      "sequence": 3,
      "lat": 37.232,
      "lon": -80.427
    }
  ]
}
```

---

**GET `/api/vehicles?routeId=MSN`**

Request: `GET https://proxy.blacksburg-transit.app/api/vehicles?routeId=MSN`

Response:

```json
[
  {
    "vehicleId": "1023",
    "routeId": "MSN",
    "lat": 37.231,
    "lon": -80.4255,
    "heading": 45,
    "speed": 12.5,
    "lastUpdated": "2025-11-04T14:30:15Z"
  },
  {
    "vehicleId": "1024",
    "routeId": "MSN",
    "lat": 37.228,
    "lon": -80.422,
    "heading": 180,
    "speed": 8.3,
    "lastUpdated": "2025-11-04T14:30:10Z"
  }
]
```

---

**GET `/api/alerts`**

Request: `GET https://proxy.blacksburg-transit.app/api/alerts`

Response:

```json
[
  {
    "id": "alert-001",
    "severity": "warning",
    "cause": "Construction",
    "effect": "Detour",
    "description": "MSN route detoured via Patrick Henry Dr due to road work on Main St.",
    "affectedRoutes": ["MSN"],
    "affectedStops": ["101", "102"],
    "startTime": "2025-11-04T08:00:00Z",
    "endTime": "2025-11-06T18:00:00Z",
    "postedAt": "2025-11-04T07:45:00Z"
  },
  {
    "id": "alert-002",
    "severity": "info",
    "cause": "Special Event",
    "effect": "Extra Service",
    "description": "Additional buses added for football game. Expect increased frequency.",
    "affectedRoutes": ["PRO", "UCB"],
    "affectedStops": [],
    "startTime": "2025-11-09T10:00:00Z",
    "endTime": "2025-11-09T18:00:00Z",
    "postedAt": "2025-11-08T12:00:00Z"
  }
]
```

---

### Appendix B: UI Component Inventory

| Component         | Description                             | Props                                                       |
| ----------------- | --------------------------------------- | ----------------------------------------------------------- |
| `StopCard`        | Displays stop name, distance, routes    | `stop: Stop, onPress: () => void`                           |
| `PredictionRow`   | Single departure (route, headsign, ETA) | `prediction: Prediction`                                    |
| `Routebadge`      | Colored pill with route short name      | `routeId: string, color: string`                            |
| `ErrorBanner`     | Dismissible banner for errors           | `message: string, severity: 'info' \| 'warning' \| 'error'` |
| `LoadingSkeleton` | Placeholder during data fetch           | `variant: 'list' \| 'card'`                                 |
| `EmptyState`      | Centered message + icon for empty lists | `title: string, subtitle: string, icon: string`             |
| `MapMarker`       | Custom stop/vehicle marker              | `type: 'stop' \| 'vehicle', label?: string`                 |
| `FavoriteButton`  | Star icon toggle                        | `isFavorite: boolean, onToggle: () => void`                 |

---

### Appendix C: Minimal Wireframes (ASCII)

**Near Me Tab:**

```
┌─────────────────────────────┐
│  Near Me               [GPS]│
├─────────────────────────────┤
│  🚏 Squires (123)      50m  │
│     MSN, HWD, UCB           │
├─────────────────────────────┤
│  🚏 Drillfield (456)  150m  │
│     PRO, MSN                │
├─────────────────────────────┤
│  🚏 Burruss (789)     300m  │
│     HWD, TTT                │
└─────────────────────────────┘
```

**Stop Detail:**

```
┌─────────────────────────────┐
│  ← Squires (123)         ★  │
├─────────────────────────────┤
│  🚍 MSN → CRC               │
│     5 min  •  On time       │
├─────────────────────────────┤
│  🚍 HWD → Foxridge          │
│     12 min  •  Delayed 3m   │
├─────────────────────────────┤
│  [  View on Map  ]          │
└─────────────────────────────┘
```

**Route Detail:**

```
┌─────────────────────────────┐
│  ← MSN                   ★  │
│  Main Street North          │
├─────────────────────────────┤
│  [Outbound] [Inbound]       │ ← Direction tabs
├─────────────────────────────┤
│  1. Squires (123)           │
│  2. Washington St (101)     │
│  3. Main Street (102)       │
│  4. CRC (200)               │
├─────────────────────────────┤
│  [  View on Map  ]          │
└─────────────────────────────┘
```

**Map View:**

```
┌─────────────────────────────┐
│  [Filter ▼]          [🎯]   │ ← Route filter, re-center
├─────────────────────────────┤
│                             │
│     🚍  (vehicle pin)       │
│                             │
│         📍 (stop marker)    │
│                             │
│  🔵 (user location)         │
│                             │
└─────────────────────────────┘
```

---

### Appendix D: Performance Budget Details

**Bundle Size Breakdown:**

| Component                 | Budget | Rationale                  |
| ------------------------- | ------ | -------------------------- |
| **React Navigation**      | 300 KB | Core routing               |
| **React Query**           | 100 KB | Data fetching              |
| **react-native-maps**     | 800 KB | Map library (largest)      |
| **Zustand**               | 10 KB  | State management           |
| **Styled-components**     | 200 KB | Styling                    |
| **App Code**              | 500 KB | Components, screens, utils |
| **Assets (fonts, icons)** | 1 MB   | Optimized PNGs/SVGs        |
| **Total**                 | ~3 MB  | Pre-gzip; ~1.2 MB gzipped  |

**Optimization Strategies:**

- Tree-shake unused libraries.
- Lazy-load Map tab (React.lazy + Suspense).
- Use Hermes engine (Android): 30% JS perf boost.

---

### Appendix E: Privacy & Permissions

**iOS Privacy Manifest (PrivacyInfo.xcprivacy):**

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We use your location to show nearby bus stops and calculate walking distance. Your location is never sent to our servers.</string>
```

**Android Permissions (AndroidManifest.xml):**

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

**Privacy Policy (Summary):**

- No user accounts; no PII collected.
- Location: device-only; used for "Near Me" feature.
- Analytics: opt-in; anonymized screen views and crash logs.
- Open source: audit at [github.com/blacksburg-transit/app].

---

## Document Metadata

**Approvals:**

- [ ] PM: ******\_\_\_\_****** Date: **\_\_\_\_**
- [ ] Engineering Lead: ******\_\_\_\_****** Date: **\_\_\_\_**
- [ ] Design Lead: ******\_\_\_\_****** Date: **\_\_\_\_**

**Revision History:**

- v1.0 (2025-11-04): Initial draft.

**Next Steps:**

1. Review and approve PRD (Deadline: Week 1, Day 2).
2. Dev team: spike BT4U API endpoints (confirm availability).
3. Designer: high-fidelity mockups (Figma) for Stop Detail, Map.
4. Backend: proxy scaffold + health endpoint (Week 1).
5. Kickoff: Week 1, Day 3.

---

**End of PRD**
