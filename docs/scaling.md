# Scaling TaskFlow for Production

## Current Architecture

```
Browser → React SPA → Express API → MongoDB
```

## Production-Ready Architecture

```
                    ┌─────────────────────────────────────┐
Browser/Mobile ──→  │  CDN (Cloudflare / Vercel Edge)     │  (Static React Build)
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │   Load Balancer (Nginx / AWS ALB)    │
                    └──────┬───────────────────────────────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
     ┌───────▼──┐  ┌───────▼──┐  ┌──────▼───┐
     │ API Node │  │ API Node │  │ API Node │  (Auto-scaled instances)
     └───────┬──┘  └───────┬──┘  └──────┬───┘
             └─────────────┼─────────────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
     ┌───────▼──┐  ┌───────▼──┐  ┌──────▼───┐
     │  Redis   │  │ MongoDB  │  │  S3 File │
     │  Cache   │  │ Cluster  │  │  Storage │
     └──────────┘  └──────────┘  └──────────┘
```

---

## 1. Frontend Scaling

### Static Deployment
```bash
cd frontend
npm run build
# Deploy /dist folder to:
# - Vercel: git push → auto-deploy
# - Cloudflare Pages: wrangler pages deploy dist
# - AWS S3 + CloudFront
```

### Environment Config
```javascript
// vite.config.js - production
export default {
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.API_URL)
  }
}
```

### Code Splitting
```javascript
// Lazy-load dashboard pages
const TasksPage = lazy(() => import('./pages/TasksPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
```

---

## 2. Backend Scaling

### Horizontal Scaling (Stateless JWT)
JWT tokens are verified using a shared `JWT_SECRET` — no session store needed. Multiple instances can handle any request:

```nginx
upstream taskflow_api {
    server node1:5000;
    server node2:5000;
    server node3:5000;
}
```

### Process Manager
```bash
# PM2 cluster mode
pm2 start server.js -i max --name taskflow-api
pm2 save && pm2 startup
```

### Environment Variables
Use AWS Secrets Manager or HashiCorp Vault in production — never commit `.env`:
```bash
# Fetch secrets at startup
const secret = await secretsManager.getSecretValue({ SecretId: 'taskflow/prod' }).promise();
```

---

## 3. Database Scaling

### MongoDB Atlas (Recommended)
- **Replica sets** — automatic failover
- **Sharding** — for massive scale
- **Connection pooling** — already configured via Mongoose

```javascript
// Optimized connection
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,          // Connection pool
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### Indexes (already in models)
```javascript
taskSchema.index({ user: 1, status: 1 });     // Filter queries
taskSchema.index({ user: 1, createdAt: -1 }); // Sort queries
```

---

## 4. Caching with Redis

Add Redis for high-read endpoints:

```javascript
// Cache task stats for 60 seconds
const getStats = async (req, res) => {
  const cacheKey = `stats:${req.user._id}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  
  const stats = await computeStats(req.user._id);
  await redis.setEx(cacheKey, 60, JSON.stringify(stats));
  res.json(stats);
};
```

Invalidate on write:
```javascript
await redis.del(`stats:${req.user._id}`); // After task create/update/delete
```

---

## 5. Security Hardening

```bash
# Production checklist
✅ HTTPS only (SSL/TLS via Let's Encrypt)
✅ JWT_SECRET = 256-bit random string
✅ Rate limiting (already implemented)
✅ Helmet.js headers (already implemented)
✅ Input validation (already implemented)
✅ bcrypt with cost factor 12 (already implemented)
✅ MongoDB connection via TLS
✅ Environment variables via secrets manager
⬜ OWASP dependency audit: npm audit --fix
⬜ WAF (AWS WAF / Cloudflare)
⬜ SIEM logging (DataDog, Grafana)
```

---

## 6. API Versioning

Future-proof with versioned routes:
```javascript
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
// Later:
app.use('/api/v2/tasks', taskRoutesV2);
```

---

## 7. Monitoring & Observability

```javascript
// Add structured logging (Winston)
const winston = require('winston');
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Metrics endpoint for Prometheus/DataDog
app.get('/metrics', async (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
```

---

## Cost Estimate (Starting Small)

| Service | Tier | Cost/mo |
|---------|------|---------|
| Vercel (Frontend) | Hobby | Free |
| Railway/Render (API) | Starter | $5 |
| MongoDB Atlas | M0 Sandbox | Free → M10 $57 |
| **Total (MVP)** | | **~$5-10** |

Scale to: AWS ECS Fargate + RDS → ~$50-200/mo for serious traffic.
