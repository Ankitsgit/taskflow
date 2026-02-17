# TaskFlow — Scalable Web App with Auth & Dashboard

A production-ready full-stack application with JWT authentication, task management, and a polished dashboard UI.

## Tech Stack

**Frontend:** React 18 + Vite, TailwindCSS, React Router v6, Axios, react-hot-toast, Lucide Icons

**Backend:** Node.js + Express, MongoDB + Mongoose, JWT, bcryptjs, express-validator, helmet, express-rate-limit

---

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

---

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` (already provided, update if needed):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Start backend:
```bash
npm run dev    # development (with nodemon)
npm start      # production
```

Backend runs on: http://localhost:5000

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3000

The Vite dev server proxies `/api` requests to `http://localhost:5000` automatically.

---

## Features

### Authentication
- JWT-based register/login/logout
- Passwords hashed with bcrypt (12 salt rounds)
- Token stored in localStorage, sent via Authorization header
- Automatic logout on 401 responses
- Session restoration on page refresh

### Dashboard
- Overview with task stats and completion rate
- Full CRUD task management
- Search and filter (status, priority, text search)
- Task grouping by status
- Tag system with keyboard shortcuts

### Security
- Helmet.js for HTTP headers
- Rate limiting (100 req/15min global, 20 req/15min auth)
- Input validation with express-validator
- CORS configured for specific origins
- JWT expiry and refresh handling

---

## Project Structure

```
taskflow/
├── backend/
│   ├── controllers/       # Business logic
│   ├── middleware/        # JWT auth, error handling
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routers
│   ├── .env              # Environment variables
│   └── server.js         # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   │   ├── auth/     # ProtectedRoute
│   │   │   └── dashboard/ # Sidebar, TaskModal
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # Route page components
│   │   ├── utils/        # API client (axios)
│   │   └── styles/       # Global CSS + Tailwind
│   ├── index.html
│   └── vite.config.js
│
├── docs/
│   └── api.md            # API documentation
└── README.md
```

---

## API Endpoints

See `docs/api.md` for full documentation.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | Sign in |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/users/profile | Yes | Get profile |
| PUT | /api/users/profile | Yes | Update profile |
| PUT | /api/users/password | Yes | Change password |
| GET | /api/tasks | Yes | List tasks (with filters) |
| GET | /api/tasks/stats | Yes | Task statistics |
| POST | /api/tasks | Yes | Create task |
| PUT | /api/tasks/:id | Yes | Update task |
| DELETE | /api/tasks/:id | Yes | Delete task |

---

## Scaling for Production

See `docs/scaling.md` for detailed notes. Summary:

1. **Horizontal scaling** — Stateless JWT auth means multiple Node instances work behind a load balancer (e.g., Nginx, AWS ALB)
2. **Database** — Move to MongoDB Atlas with replica sets + indexes (already configured in models)
3. **Caching** — Add Redis for session caching and frequently-read data
4. **Frontend** — Build with `npm run build`, deploy to CDN (Vercel, Cloudflare Pages)
5. **Environment** — Use proper secret management (AWS Secrets Manager, HashiCorp Vault)

---

## Demo

Default test credentials (if you seed them):
- Email: `demo@taskflow.io`
- Password: `demo1234`
