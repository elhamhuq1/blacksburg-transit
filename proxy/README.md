# Blacksburg Transit Proxy

SOAP→JSON proxy for Blacksburg Transit BT4U webservice. Converts legacy SOAP/XML API to modern REST/JSON endpoints with caching, rate limiting, and circuit breaking.

## Features

- ✅ **SOAP→JSON Conversion**: Automatic XML parsing and JSON transformation
- ✅ **Smart Caching**: 10s-5min TTL based on data type (routes, stops, predictions)
- ✅ **Circuit Breaker**: Automatic failover on upstream failures
- ✅ **Rate Limiting**: 100 req/min per IP
- ✅ **Health Checks**: `/api/health` endpoint with metrics
- ✅ **Vercel Edge**: Global CDN distribution with <50ms latency

## API Endpoints

| Endpoint                               | Method | Cache TTL | Description               |
| -------------------------------------- | ------ | --------- | ------------------------- |
| `/api/routes`                          | GET    | 5 min     | All active routes         |
| `/api/stops/nearby`                    | GET    | 30s       | Stops near coordinates    |
| `/api/stops/{stopId}/departures`       | GET    | 10s       | Real-time predictions     |
| `/api/stops/{stopId}/schedule`         | GET    | 1 hour    | Scheduled departures      |
| `/api/routes/{routeId}/stops`          | GET    | 5 min     | Stops for route+direction |
| `/api/vehicles?routeId={id}`           | GET    | 10s       | Live vehicle positions    |
| `/api/alerts`                          | GET    | 5 min     | Service alerts            |
| `/api/health`                          | GET    | No cache  | Health check + metrics    |

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Install Dependencies

```bash
npm install
```

### Run Locally

```bash
vercel dev
```

The proxy will be available at `http://localhost:3000`

**Note:** Run `vercel dev` directly (not `npm run dev`) to avoid recursive script issues.

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `BT4U_SERVICE_URL`: BT4U SOAP webservice URL (default: http://216.252.195.248/webservices/bt4u_webservice.asmx)

Optional:
- `SENTRY_DSN`: Sentry error tracking
- Vercel KV / Upstash Redis credentials for production caching

## Testing

### Unit Tests

```bash
npm test
```

### With Coverage

```bash
npm run test:coverage
```

### Type Check

```bash
npm run type-check
```

## Deployment

### Deploy to Vercel

```bash
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments on push.

### Environment Variables (Production)

Set in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add `BT4U_SERVICE_URL` (production value)
3. Add `SENTRY_DSN` (if using Sentry)
4. Add Vercel KV credentials (if using)

## Architecture

```
┌─────────────────┐
│  Mobile App     │
│  (React Native) │
└────────┬────────┘
         │ HTTPS/JSON
         ▼
┌─────────────────┐
│  Vercel Edge    │◄──── Cache (10s-1hr)
│  Functions      │◄──── Rate Limit (100/min)
│  (TypeScript)   │◄──── Circuit Breaker
└────────┬────────┘
         │ SOAP/XML (3s timeout)
         ▼
┌─────────────────┐
│  BT4U Webservice│
│  (SOAP/ASMX)    │
└─────────────────┘
```

## Performance

- **Cache Hit Rate**: Target ≥70%
- **P95 Latency**: <500ms (cached), <1.5s (cache miss)
- **Uptime**: ≥99.9% (Vercel SLA)
- **Rate Limit**: 100 requests/min per IP

## Error Handling

### Circuit Breaker States

- **Closed**: Normal operation
- **Open**: After 7 failures in last 10 requests (30s timeout)
- **Half-Open**: Testing upstream after timeout

### Fallback Strategy

1. Return cached data (even if stale)
2. If no cache, return 503 with retry-after header
3. Log error to Sentry (if configured)

## Health Check

```bash
curl https://your-proxy.vercel.app/api/health
```

Response:
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

## License

MIT

