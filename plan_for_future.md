# Plan for Future: Production Backend Strategy

## Overview

Documentation of planned architecture changes for production deployment on Play Store / App Store, focusing on secure API key management and scalable infrastructure.

## Current State

- API keys (`EXPO_PUBLIC_OPENWEATHER_API_KEY`, `EXPO_PUBLIC_ANTHROPIC_API_KEY`) hardcoded in `.env`
- Keys potentially exposed in APK during build
- Direct app-to-API calls, no backend layer
- No centralized rate limiting or usage monitoring
- No authentication layer for future multi-user features

## Problem

Cannot safely publish to Play Store without exposing API keys to reverse engineering. Users would eventually discover keys in APK and could abuse them, causing unexpected billing or service shutdown.

## Proposed Solution: Backend Proxy Pattern

### Architecture

```
Mobile App
    ↓ HTTPS
Backend (Serverless Function / Cloud Run)
    ├─→ OpenWeatherMap API (weather endpoint)
    └─→ Anthropic Claude API (chat endpoint)
```

### Benefits

1. **Security** — API keys never exposed in APK
2. **Cost Control** — Centralized rate limiting and quota management
3. **Monitoring** — Visibility into usage patterns, costs, errors
4. **Flexibility** — Easy to swap providers, adjust limits, add caching
5. **Scalability** — Can add features (caching, authentication, logging) without app update
6. **Key Rotation** — Change keys without app rebuild/release cycle

## Implementation Plan

### Phase 1: Backend Infrastructure Setup

**Recommended:** Serverless (Vercel, Firebase Cloud Functions, or Google Cloud Run)

**Minimum endpoints needed:**

```
POST /api/weather
  Input: { lat, lon, units }
  Output: { temp, humidity, windSpeed, forecast[] }

POST /api/chat
  Input: { message, image?, conversationHistory }
  Output: { response, error? }

POST /api/rate-limit
  Input: { userId }
  Output: { questionsRemaining, resetTime }
```

**Example implementation (Node.js):**

```typescript
// api/weather.ts
export async function handler(req, res) {
  const { lat, lon } = req.body;
  
  // Validate request origin (CORS)
  const origin = req.headers.origin;
  if (!isValidAppOrigin(origin)) return res.status(403).json({ error: 'Forbidden' });
  
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY; // Server env only
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );
    const data = await response.json();
    
    res.status(200).json({
      temp: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
}
```

### Phase 2: App-Side Changes

**Update API calls** to use backend endpoints instead of direct API calls:

```typescript
// Before (not secure for production)
const response = await fetch(
  `https://api.openweathermap.org/data/2.5/weather?appid=${EXPO_PUBLIC_OPENWEATHER_API_KEY}`
);

// After
const response = await fetch(
  `https://your-api.com/api/weather`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lon })
  }
);
```

**Remove from `.env`:**
- `EXPO_PUBLIC_OPENWEATHER_API_KEY`
- `EXPO_PUBLIC_ANTHROPIC_API_KEY`

**Add backend URL:**
- `EXPO_PUBLIC_API_BASE_URL=https://your-api.com` (public, safe in APK)

### Phase 3: Feature Additions

Once backend is in place, add:

1. **Rate Limiting** — Per-user quotas stored in backend (Redis/Database)
2. **Caching** — Store weather for 30min, reduce OpenWeatherMap costs
3. **User Authentication** — Optional: link users to accounts for cross-device sync
4. **Analytics** — Track feature usage, error rates
5. **Fallback** — Store cached data locally if backend unavailable

### Phase 4: CI/CD & Deployment

- Secrets management (GitHub Secrets, Vercel Env Vars)
- Automated backend deployment (CI/CD pipeline)
- Monitoring and alerting for API errors
- Cost tracking per API call

## Implementation Order

1. **Choose provider** — Vercel (simplest), Firebase (integrates with Google), Cloud Run (flexibility)
2. **Implement weather endpoint** — Lower traffic volume, good test case
3. **Test from staging app** — Deploy alpha build with staging backend URL
4. **Implement chat endpoint** — More complex (vision support, rate limiting)
5. **Add rate limiting** — Track usage per user/IP
6. **Remove keys from app** — Final security hardening
7. **Release beta/Play Store** — With new backend URL

## Timeline Estimate

- **Phase 1 (Backend setup)** — 1-2 days (boilerplate + 2 endpoints)
- **Phase 2 (App integration)** — 1 day (update API calls, test)
- **Phase 3 (Enhancements)** — 3-5 days (caching, rate limiting, monitoring)
- **Phase 4 (Deployment)** — 1-2 days (CI/CD, secrets, monitoring)

**Total: ~1-2 weeks** from start to Play Store ready

## Alternatives Considered

| Approach | Pros | Cons |
|----------|------|------|
| **Backend Proxy** (chosen) | Secure, scalable, easy to maintain | Adds backend infrastructure |
| **API Gateway** (Firebase, AWS) | Managed, reduces boilerplate | Vendor lock-in, learning curve |
| **Public Keys + Restrictions** | No backend needed | Keys exposed, hard to enforce limits |
| **Device Attestation** | Verify legit app before allowing API | Complex, still needs verification server |

## Related Tasks

- [ ] Choose backend provider and setup project
- [ ] Implement `/api/weather` endpoint
- [ ] Implement `/api/chat` endpoint  
- [ ] Update app to use backend URLs
- [ ] Add rate limiting service
- [ ] Add caching layer (Redis/Memcached)
- [ ] Setup monitoring and alerting
- [ ] Update `.env.example` to remove hardcoded keys
- [ ] Write backend API documentation
- [ ] Deploy to staging and test with real app
- [ ] Prepare for Play Store release

## Notes

- **CORS** — Configure backend to accept requests only from your app (check origin header, implement key signing if needed)
- **Costs** — Backend calls add latency (~100-200ms), but worth it for security; serverless can handle 1000+ concurrent users
- **Rate Limiting** — Current limit: 3 questions/day. Move this to backend, store in database or Redis
- **Image Upload** — Chat with photos: compress in app, send base64 to backend, backend forwards to Claude
