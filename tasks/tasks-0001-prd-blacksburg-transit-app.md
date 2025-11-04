# Task List: Blacksburg Transit Mobile App

**Based on:** `0001-prd-blacksburg-transit-app.md`  
**Created:** November 4, 2025  
**Target:** v0 MVP (Weeks 1–6), v1 Full Feature Set (Weeks 7–12)

---

## Relevant Files

### Proxy (Vercel Edge Functions)

- `proxy/package.json` - Proxy dependencies (fast-xml-parser, @vercel/edge)
- `proxy/tsconfig.json` - TypeScript config for Edge runtime
- `proxy/api/routes.ts` - GET /api/routes endpoint
- `proxy/api/stops/nearby.ts` - GET /api/stops/nearby endpoint
- `proxy/api/stops/[stopId]/departures.ts` - GET /api/stops/{id}/departures
- `proxy/api/stops/[stopId]/schedule.ts` - GET /api/stops/{id}/schedule
- `proxy/api/routes/[routeId]/stops.ts` - GET /api/routes/{id}/stops
- `proxy/api/vehicles.ts` - GET /api/vehicles endpoint
- `proxy/api/alerts.ts` - GET /api/alerts endpoint
- `proxy/api/health.ts` - Health check endpoint
- `proxy/lib/bt4u.ts` - SOAP client for BT4U API
- `proxy/lib/cache.ts` - Cache utilities (Vercel KV wrapper)
- `proxy/lib/circuit-breaker.ts` - Circuit breaker implementation
- `proxy/lib/rate-limit.ts` - Rate limiting logic
- `proxy/lib/parsers.ts` - XML→JSON parsers for BT4U responses
- `proxy/lib/validation.ts` - Input validation and Zod schemas
- `proxy/types/bt4u.ts` - TypeScript types for BT4U data
- `proxy/vercel.json` - Vercel deployment configuration
- `proxy/__tests__/api/routes.test.ts` - Unit tests for routes endpoint
- `proxy/__tests__/lib/parsers.test.ts` - Parser unit tests

### Mobile App (Expo + React Native)

- `app/package.json` - App dependencies
- `app/app.json` - Expo configuration
- `app/tsconfig.json` - TypeScript config for React Native
- `app/app/_layout.tsx` - Root layout with providers
- `app/app/(tabs)/_layout.tsx` - Tab navigator layout
- `app/app/(tabs)/near-me.tsx` - Near Me tab screen
- `app/app/(tabs)/search.tsx` - Search tab screen
- `app/app/(tabs)/map.tsx` - Map tab screen
- `app/app/(tabs)/favorites.tsx` - Favorites tab screen
- `app/app/(tabs)/alerts.tsx` - Alerts tab screen
- `app/app/stop/[id].tsx` - Stop Detail screen (dynamic route)
- `app/app/route/[id].tsx` - Route Detail screen (dynamic route)
- `app/app/settings.tsx` - Settings modal screen
- `app/components/StopCard.tsx` - Stop card component for lists
- `app/components/StopCard.test.tsx` - Unit tests for StopCard
- `app/components/PredictionRow.tsx` - Single departure row
- `app/components/PredictionRow.test.tsx` - Unit tests for PredictionRow
- `app/components/RouteBadge.tsx` - Route badge pill component
- `app/components/ErrorBanner.tsx` - Dismissible error banner
- `app/components/LoadingSkeleton.tsx` - Loading placeholder
- `app/components/EmptyState.tsx` - Empty state component
- `app/components/FavoriteButton.tsx` - Star toggle button
- `app/components/MapMarker.tsx` - Custom map marker (stop/vehicle)
- `app/components/ErrorBoundary.tsx` - Error boundary wrapper
- `app/lib/api.ts` - Proxy API client (fetch wrappers)
- `app/lib/api.test.ts` - API client tests
- `app/lib/hooks/useStopDepartures.ts` - React Query hook for departures
- `app/lib/hooks/useNearbyStops.ts` - React Query hook for GPS stops
- `app/lib/hooks/useRoutes.ts` - React Query hook for routes list
- `app/lib/hooks/useVehicles.ts` - React Query hook for vehicle positions
- `app/lib/hooks/useAlerts.ts` - React Query hook for service alerts
- `app/lib/stores/favoritesStore.ts` - Zustand store for favorites
- `app/lib/stores/settingsStore.ts` - Zustand store for settings
- `app/lib/utils/time.ts` - ETA formatting, date helpers
- `app/lib/utils/time.test.ts` - Time utility tests
- `app/lib/utils/geo.ts` - Distance calculations (haversine)
- `app/lib/utils/geo.test.ts` - Geo utility tests
- `app/lib/utils/validation.ts` - Zod schemas for API responses
- `app/lib/utils/smoothing.ts` - ETA smoothing and deduplication
- `app/constants/Colors.ts` - Theme colors (light/dark)
- `app/constants/Config.ts` - API URLs, polling intervals
- `app/types/api.ts` - TypeScript interfaces for API data
- `app/assets/images/markers/stop.png` - Stop marker icon
- `app/assets/images/markers/vehicle.png` - Vehicle marker icon

### Testing & Infrastructure

- `app/e2e/jest.config.js` - Detox E2E test configuration
- `app/e2e/nearMeFlow.test.ts` - E2E: Near Me → Stop Detail → Favorite
- `app/e2e/searchFlow.test.ts` - E2E: Search → Route Detail → Map
- `app/e2e/accessibilityFlow.test.ts` - E2E: TalkBack/VoiceOver flow
- `app/jest.config.js` - Jest unit test configuration
- `app/.detoxrc.js` - Detox configuration
- `app/eas.json` - EAS Build configuration
- `.github/workflows/proxy-ci.yml` - Proxy CI/CD pipeline
- `.github/workflows/app-ci.yml` - App CI/CD pipeline
- `README.md` - Project documentation
- `CONTRIBUTING.md` - Contributor guidelines
- `LICENSE` - MIT license file
- `CODE_OF_CONDUCT.md` - Code of conduct

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- Proxy and app are separate repos/workspaces; each has its own `package.json` and deployment pipeline.

---

## Tasks

- [ ] 1.0 Project Setup & Infrastructure
  - [ ] 1.1 Initialize Git repository with monorepo structure (proxy/ and app/ folders)
  - [ ] 1.2 Create proxy workspace: Initialize Node.js project with TypeScript and Vercel Edge runtime
  - [ ] 1.3 Create app workspace: Initialize Expo project with TypeScript (SDK 50+) using `npx create-expo-app`
  - [ ] 1.4 Configure ESLint and Prettier for both workspaces (use React Native and TypeScript presets)
  - [ ] 1.5 Set up GitHub repository with branch protection (require PR reviews, CI checks)
  - [ ] 1.6 Create `.gitignore` files for both workspaces (node_modules, build artifacts, .env files)
  - [ ] 1.7 Set up Vercel project for proxy deployment (link Git repo, configure build settings)
  - [ ] 1.8 Set up EAS account and link Expo app (`eas init`, configure `eas.json`)
  - [ ] 1.9 Create development environment documentation (README.md with setup instructions)
  - [ ] 1.10 Set up Sentry projects for proxy and app (error tracking)

- [ ] 2.0 SOAP→JSON Proxy (Vercel Edge Functions)
  - [ ] 2.1 Create `proxy/lib/bt4u.ts`: Implement SOAP client to call BT4U webservice (use `node-fetch`, construct SOAP XML envelopes)
  - [ ] 2.2 Create `proxy/lib/parsers.ts`: Implement XML→JSON parsers using `fast-xml-parser` for each BT4U endpoint response
  - [ ] 2.3 Create `proxy/lib/cache.ts`: Implement caching layer with Vercel KV (get/set with TTL support)
  - [ ] 2.4 Create `proxy/lib/circuit-breaker.ts`: Implement circuit breaker pattern (track failures, open/close/half-open states)
  - [ ] 2.5 Create `proxy/lib/rate-limit.ts`: Implement rate limiting (100 req/min per IP using Upstash)
  - [ ] 2.6 Create `proxy/lib/validation.ts`: Implement input validation with Zod schemas (sanitize stopId, routeId, validate lat/lon)
  - [ ] 2.7 Create `proxy/api/routes.ts`: Implement GET /api/routes endpoint (fetch GetCurrentRoutes, cache 5min)
  - [ ] 2.8 Create `proxy/api/stops/nearby.ts`: Implement GET /api/stops/nearby endpoint (fetch GetNearestStops, cache 30s)
  - [ ] 2.9 Create `proxy/api/stops/[stopId]/departures.ts`: Implement GET /api/stops/{id}/departures (fetch GetNextDeparturesForStop, cache 10s)
  - [ ] 2.10 Create `proxy/api/stops/[stopId]/schedule.ts`: Implement GET /api/stops/{id}/schedule (fetch GetScheduledStopInfo, cache 1hr)
  - [ ] 2.11 Create `proxy/api/routes/[routeId]/stops.ts`: Implement GET /api/routes/{id}/stops (fetch GetRouteStops, cache 5min)
  - [ ] 2.12 Create `proxy/api/vehicles.ts`: Implement GET /api/vehicles endpoint (fetch GetVehiclePositions if available, cache 10s)
  - [ ] 2.13 Create `proxy/api/alerts.ts`: Implement GET /api/alerts endpoint (fetch GetAlerts if available, cache 5min)
  - [ ] 2.14 Create `proxy/api/health.ts`: Implement health check endpoint (return uptime, cache hit rate, upstream latency)
  - [ ] 2.15 Add error handling for all endpoints (timeout >3s, XML parse errors, upstream 4xx/5xx)
  - [ ] 2.16 Configure `vercel.json` with edge runtime settings, CORS headers, and environment variables
  - [ ] 2.17 Write unit tests for parsers (`proxy/__tests__/lib/parsers.test.ts` with mock XML fixtures)
  - [ ] 2.18 Write integration tests for endpoints (mock BT4U responses, test cache behavior, rate limits)
  - [ ] 2.19 Set up Vercel environment variables (BT4U_SERVICE_URL, UPSTASH_REDIS_URL, SENTRY_DSN)
  - [ ] 2.20 Deploy proxy to Vercel preview environment and test all endpoints manually

- [ ] 3.0 Mobile App Foundation (Expo + React Native)
  - [ ] 3.1 Initialize Expo project with TypeScript and Expo Router (`npx create-expo-app --template tabs`)
  - [ ] 3.2 Install core dependencies (React Navigation 6, React Query, Zustand, MMKV, Zod, Sentry)
  - [ ] 3.3 Configure `app.json`: Set app name, slug, version, orientation, icons, splash screen, iOS/Android configs
  - [ ] 3.4 Create `app/constants/Config.ts`: Define API base URL, polling intervals, cache TTLs as constants
  - [ ] 3.5 Create `app/constants/Colors.ts`: Define light/dark theme colors matching BT brand (orange/maroon accents)
  - [ ] 3.6 Create `app/types/api.ts`: Define TypeScript interfaces for Stop, Route, Prediction, Alert, Vehicle
  - [ ] 3.7 Create `app/lib/api.ts`: Implement API client with fetch wrappers for all proxy endpoints (include error handling)
  - [ ] 3.8 Set up React Query client in `app/_layout.tsx`: Configure default options (staleTime 10s, retry logic, exponential backoff)
  - [ ] 3.9 Set up Zustand stores: Create `favoritesStore.ts` (add/remove favorites, persist to MMKV) and `settingsStore.ts` (theme, units)
  - [ ] 3.10 Create `app/components/ErrorBoundary.tsx`: Implement error boundary with fallback UI and Sentry integration
  - [ ] 3.11 Configure tab navigation in `app/(tabs)/_layout.tsx`: Set tab icons, labels, and accessibility labels for 5 tabs
  - [ ] 3.12 Create placeholder screens for all tabs (Near Me, Search, Map, Favorites, Alerts) with basic Text components
  - [ ] 3.13 Set up Sentry SDK in `app/_layout.tsx`: Initialize with DSN, set release version, enable performance monitoring
  - [ ] 3.14 Configure TypeScript strict mode in `tsconfig.json` and fix any initial errors
  - [ ] 3.15 Test app runs on iOS Simulator and Android Emulator without errors

- [ ] 4.0 Core Features - Real-Time Arrivals & Search (MVP - P0/P1)
  - [ ] 4.1 Create `app/lib/utils/validation.ts`: Implement Zod schemas for validating API responses (Stop, Route, Prediction)
  - [ ] 4.2 Create `app/lib/utils/time.ts`: Implement ETA formatting functions (formatETA: seconds → "5 min" or "Approaching")
  - [ ] 4.3 Create `app/lib/utils/time.test.ts`: Write unit tests for time utilities (test edge cases: <60s, negative ETAs)
  - [ ] 4.4 Create `app/lib/utils/smoothing.ts`: Implement ETA smoothing (clamp negatives, dedupe, smooth jitter per PRD 7.6)
  - [ ] 4.5 Create `app/lib/hooks/useStopDepartures.ts`: Implement React Query hook for fetching stop departures (10s refetch when focused)
  - [ ] 4.6 Create `app/lib/hooks/useRoutes.ts`: Implement React Query hook for fetching routes list (5min cache)
  - [ ] 4.7 Create `app/components/PredictionRow.tsx`: Implement departure row component (route badge, headsign, ETA, status indicator)
  - [ ] 4.8 Create `app/components/RouteBadge.tsx`: Implement route badge pill (color-coded, accessible)
  - [ ] 4.9 Create `app/components/LoadingSkeleton.tsx`: Implement skeleton loader for lists and cards
  - [ ] 4.10 Create `app/components/EmptyState.tsx`: Implement empty state component (icon, title, subtitle)
  - [ ] 4.11 Implement `app/app/stop/[id].tsx`: Stop Detail screen
    - Fetch departures using `useStopDepartures` hook
    - Display stop name, ID, address in header
    - Render next 5 departures with PredictionRow components
    - Add pull-to-refresh functionality
    - Show "Schedule only" chip if `scheduleBased: true`
    - Display empty state if no departures
    - Add favorite button in header (star icon)
  - [ ] 4.12 Add real-time updates to Stop Detail: Use `useIsFocused()` to pause refetch when screen backgrounded
  - [ ] 4.13 Create `app/components/StopCard.tsx`: Implement stop card for lists (name, distance, routes list)
  - [ ] 4.14 Implement `app/app/(tabs)/search.tsx`: Search tab screen
    - Add search input with type-ahead (no submit button)
    - Implement fuzzy search logic (filter routes and stops by query)
    - Display search results in categorized sections (Stops, Routes)
    - Add recent searches (max 10, stored in local state)
    - Navigate to Stop Detail or Route Detail on tap
  - [ ] 4.15 Add search performance optimization: Debounce input (300ms), use `useMemo` for filtered results
  - [ ] 4.16 Create `app/app/route/[id].tsx`: Route Detail screen (basic version for v0)
    - Fetch route stops using new `useRouteStops` hook
    - Display route name, number, service hours
    - Show direction switcher (tabs or segmented control)
    - List all stops in order (tap to navigate to Stop Detail)
    - Add favorite button in header
  - [ ] 4.17 Implement `app/app/(tabs)/near-me.tsx`: Near Me tab (v0 placeholder, full implementation in 6.0)
    - Show "Grant location permission" prompt if not granted
    - Display placeholder message or list of hardcoded nearby stops
  - [ ] 4.18 Write unit tests for PredictionRow, RouteBadge, StopCard components
  - [ ] 4.19 Test Stop Detail screen with various stop IDs (verify ETA updates, pull-to-refresh, empty states)
  - [ ] 4.20 Test Search tab (verify fuzzy matching, recent searches, navigation)

- [ ] 5.0 Map View & Vehicle Tracking (P2)
  - [ ] 5.1 Install react-native-maps: `npx expo install react-native-maps`
  - [ ] 5.2 Configure maps for iOS (Apple Maps) and Android (Google Maps) in `app.json` (add Google Maps API key for Android)
  - [ ] 5.3 Create `app/lib/hooks/useVehicles.ts`: Implement React Query hook for fetching vehicle positions (12s refetch when focused)
  - [ ] 5.4 Create `app/components/MapMarker.tsx`: Create custom marker components for stops (📍) and vehicles (🚍)
  - [ ] 5.5 Create vehicle marker assets: Export small PNG icons (30×30pt) for stop and vehicle markers, add rotation for vehicle heading
  - [ ] 5.6 Implement `app/app/(tabs)/map.tsx`: Map tab screen
    - Initialize MapView with Blacksburg region center (lat: 37.23, lon: -80.42)
    - Fetch and display all routes as polylines (use route colors from API)
    - Render stop markers for all stops (use clustering if >50 stops)
    - Fetch and render vehicle markers using `useVehicles` hook
    - Add user location (blue dot) with re-center button
    - Implement route filter (show/hide specific routes via bottom sheet or modal)
  - [ ] 5.7 Add map performance optimizations: Set `tracksViewChanges={false}` on markers after render, use `react-native-map-clustering` for vehicles
  - [ ] 5.8 Implement stop marker tap handler: Show callout with stop name, then navigate to Stop Detail on callout tap
  - [ ] 5.9 Implement vehicle marker tap handler: Show callout with route info and ETA to next stop
  - [ ] 5.10 Add "View on Map" button to Stop Detail screen: Opens Map tab centered on stop location
  - [ ] 5.11 Update Route Detail screen: Add embedded map showing route polyline and stops
  - [ ] 5.12 Test map performance: Verify 60fps pan/zoom on test devices (iOS Simulator, Android Emulator)
  - [ ] 5.13 Test map interactions: Tap markers, verify callouts, test route filter, check vehicle updates every 12s

- [ ] 6.0 Favorites & Settings (P2)
  - [ ] 6.1 Complete `app/lib/stores/favoritesStore.ts`: Implement add/remove/reorder favorites, sync to MMKV on changes
  - [ ] 6.2 Add favorite functionality to Stop Detail: Wire up star button to toggle favorite (optimistic update)
  - [ ] 6.3 Add favorite functionality to Route Detail: Wire up star button to toggle favorite
  - [ ] 6.4 Implement `app/app/(tabs)/favorites.tsx`: Favorites tab screen
    - Display list of favorited stops and routes
    - Show next arrival time/badge for each favorited stop (use `useStopDepartures` for each)
    - Implement swipe-to-delete gesture (remove from favorites)
    - Add empty state: "No favorites yet. Tap ★ on any stop or route."
    - Update next arrivals every 15s when tab focused
  - [ ] 6.5 Add GPS/location functionality: Request location permission using `expo-location`, handle permission states
  - [ ] 6.6 Create `app/lib/utils/geo.ts`: Implement haversine distance calculation and walking time estimation (1.4 m/s)
  - [ ] 6.7 Create `app/lib/utils/geo.test.ts`: Write unit tests for distance and walking time calculations
  - [ ] 6.8 Create `app/lib/hooks/useNearbyStops.ts`: Implement hook to fetch nearby stops (debounce GPS updates, 30s min interval)
  - [ ] 6.9 Complete `app/app/(tabs)/near-me.tsx`: Near Me tab implementation
    - Request location permission on mount
    - Fetch user's current location
    - Call `useNearbyStops` with lat/lon to get stops within 800m
    - Display sorted list of stops with StopCard (show distance and walking time)
    - Show "Grant permission" prompt if denied
    - Add refresh button to manually update location
  - [ ] 6.10 Implement location permission handling: Show rationale modal, link to system settings if permanently denied
  - [ ] 6.11 Create `app/app/settings.tsx`: Settings screen (modal)
    - Add theme selector (Auto / Light / Dark) using `settingsStore`
    - Add units selector (Imperial mi / Metric km)
    - Show location permission status with link to system settings
    - Add "Clear cache" button (call `queryClient.clear()`)
    - Display app version, build number, and license (MIT)
    - Add links to Privacy Policy and Terms (placeholder URLs)
  - [ ] 6.12 Implement theme switching: Use `useColorScheme` hook, apply Colors.light/dark based on settings
  - [ ] 6.13 Add settings button to tab bar or header (gear icon, opens settings modal)
  - [ ] 6.14 Test favorites: Add/remove stops and routes, verify persistence across app restarts
  - [ ] 6.15 Test Near Me: Grant/deny permissions, verify GPS updates, check distance calculations
  - [ ] 6.16 Test settings: Toggle theme (verify app updates), change units (verify distance displays)

- [ ] 7.0 Service Alerts & Polish (P3)
  - [ ] 7.1 Create `app/lib/hooks/useAlerts.ts`: Implement React Query hook for fetching service alerts (5min cache)
  - [ ] 7.2 Create `app/components/ErrorBanner.tsx`: Implement alert banner component (severity colors: info=blue, warning=yellow, critical=red)
  - [ ] 7.3 Implement `app/app/(tabs)/alerts.tsx`: Alerts tab screen
    - Fetch alerts using `useAlerts` hook
    - Display list of alerts sorted by severity (critical > warning > info)
    - Show severity badge, cause, effect, description, timestamp ("Posted 2 hours ago")
    - Filter by affected route/stop (optional for v1)
    - Add empty state: "No active service alerts"
  - [ ] 7.4 Add alert banners to Stop Detail: Show banner at top if stop affected by alert (tap to view full alert)
  - [ ] 7.5 Add alert banners to Route Detail: Show banner if route affected by alert
  - [ ] 7.6 Implement dark mode support: Ensure all screens respect theme (test both light/dark modes)
  - [ ] 7.7 Audit all screens for empty states: Ensure every list/data view has proper empty state component
  - [ ] 7.8 Implement error states: Add retry buttons and error messages for network failures (use ErrorBanner)
  - [ ] 7.9 Add loading states: Replace blank screens with LoadingSkeleton during data fetches
  - [ ] 7.10 Implement offline detection: Use `NetInfo` to detect offline state, show banner with cached data timestamp
  - [ ] 7.11 Add subtle animations: Implement fade-in for list items, smooth transitions between screens (React Navigation defaults)
  - [ ] 7.12 Polish UI spacing and typography: Ensure consistent padding (16pt), font sizes (17pt body), and hierarchy
  - [ ] 7.13 Add haptic feedback: Light haptic on favorite toggle, error haptic on failures (use `expo-haptics`)
  - [ ] 7.14 Test alerts tab: Verify alert display, severity colors, filtering (if implemented)
  - [ ] 7.15 Test dark mode: Manually toggle theme and verify all screens, check contrast ratios
  - [ ] 7.16 Test offline mode: Enable airplane mode, verify cached data displays, test retry buttons

- [ ] 8.0 Accessibility & Testing
  - [ ] 8.1 Install accessibility linting: Add `eslint-plugin-jsx-a11y` to ESLint config
  - [ ] 8.2 Audit all interactive elements: Add `accessibilityLabel` to icons and buttons (e.g., "Favorite this stop")
  - [ ] 8.3 Add `accessibilityHint` to non-obvious actions (e.g., "Double tap to favorite")
  - [ ] 8.4 Set `accessibilityRole` on all components (button, header, list, text, image)
  - [ ] 8.5 Implement `accessibilityLiveRegion="polite"` for ETA countdown in Stop Detail (announce updates to screen readers)
  - [ ] 8.6 Test tap target sizes: Ensure all buttons/taps are ≥44×44pt (use React Native Inspector)
  - [ ] 8.7 Test color contrast: Use Stark or similar tool to verify 4.5:1 for text, 3:1 for graphics (light and dark modes)
  - [ ] 8.8 Test Dynamic Type: Enable 200% text size on device, verify all screens reflow without truncation
  - [ ] 8.9 Manual TalkBack test (Android): Navigate Near Me → Stop Detail → Favorite flow, verify all elements announced correctly
  - [ ] 8.10 Manual VoiceOver test (iOS): Same flow as TalkBack, verify labels, hints, and navigation
  - [ ] 8.11 Set up Jest for unit tests: Configure `jest.config.js` with React Native preset, add test scripts to `package.json`
  - [ ] 8.12 Write unit tests for utility functions: `time.test.ts`, `geo.test.ts`, `smoothing.test.ts` (≥80% coverage)
  - [ ] 8.13 Write component tests: `StopCard.test.tsx`, `PredictionRow.test.tsx`, `RouteBadge.test.tsx` using React Native Testing Library
  - [ ] 8.14 Set up Detox for E2E tests: Install Detox, configure `.detoxrc.js` for iOS and Android
  - [ ] 8.15 Write E2E test: `e2e/nearMeFlow.test.ts` (grant location → tap stop → favorite → verify in Favorites tab)
  - [ ] 8.16 Write E2E test: `e2e/searchFlow.test.ts` (search "MSN" → tap route → verify Route Detail → tap "View on Map")
  - [ ] 8.17 Write E2E test: `e2e/accessibilityFlow.test.ts` (enable TalkBack → navigate Near Me → Stop Detail)
  - [ ] 8.18 Run full test suite: `npx jest` for unit tests, `detox test` for E2E (iOS Simulator and Android Emulator)
  - [ ] 8.19 Achieve ≥70% unit test coverage (run `npx jest --coverage` and review report)
  - [ ] 8.20 Document accessibility features in README (screen reader support, Dynamic Type, haptics)

- [ ] 9.0 Deployment & Launch
  - [ ] 9.1 Configure EAS Build: Update `eas.json` with production, preview channels, set build profiles for iOS and Android
  - [ ] 9.2 Configure EAS Update: Set up OTA update channels (production, preview), configure auto-update strategy
  - [ ] 9.3 Set up GitHub Actions CI for proxy: Create `.github/workflows/proxy-ci.yml` (run tests, deploy to Vercel on push)
  - [ ] 9.4 Set up GitHub Actions CI for app: Create `.github/workflows/app-ci.yml` (run tests, lint, build preview on PR)
  - [ ] 9.5 Create app icons: Design and export iOS (1024×1024) and Android (adaptive icon) assets
  - [ ] 9.6 Create splash screen: Design and export splash screen assets (Expo splash screen generator)
  - [ ] 9.7 Configure iOS Privacy Manifest: Add `NSLocationWhenInUseUsageDescription` in `app.json` (copy from PRD Appendix E)
  - [ ] 9.8 Configure Android permissions: Add location permissions in `app.json` Android config
  - [ ] 9.9 Set up Sentry releases: Configure source maps upload in EAS builds, tag releases with version
  - [ ] 9.10 Set up proxy monitoring: Configure UptimeRobot to ping `/api/health` every 5 min, set up Slack/email alerts
  - [ ] 9.11 Run load test on proxy: Use k6 or Artillery to simulate 50 req/s, verify p95 latency <500ms, no errors
  - [ ] 9.12 Create internal beta build: Run `eas build --profile preview`, distribute via TestFlight (iOS) and Play Internal (Android)
  - [ ] 9.13 Conduct beta testing with 10 VT students: Gather feedback on usability, bugs, performance
  - [ ] 9.14 Fix critical bugs and polish based on beta feedback
  - [ ] 9.15 Create production build: Run `eas build --profile production` for iOS and Android
  - [ ] 9.16 Submit iOS app to App Store: Create app listing, upload screenshots, write description, submit for review
  - [ ] 9.17 Submit Android app to Google Play: Create app listing, upload screenshots, write description, submit for review
  - [ ] 9.18 Prepare open source release: Add `LICENSE` (MIT), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`
  - [ ] 9.19 Write comprehensive README: Include setup instructions, architecture overview, deployment guide, contribution guidelines
  - [ ] 9.20 Publish GitHub repository: Make repo public, add topics (expo, react-native, transit, blacksburg, open-source)
  - [ ] 9.21 Create launch announcement: Post to VT subreddit, social media, coordinate BT website link
  - [ ] 9.22 Monitor launch metrics: Track crash-free rate (target ≥99%), TTI (target <2.5s Android, <2s iOS), user feedback

---

**Status:** Complete - All tasks generated with detailed sub-tasks.  
**Next Step:** Begin implementation with Task 1.0 (Project Setup & Infrastructure).

