# 🔐 VaultLock — Secure Password Manager

A full-stack, zero-knowledge password manager built with React, Node.js, MongoDB, and Docker.
Every password is encrypted with **AES-256-GCM** before it ever touches the database.

```
Tech Stack
├── Frontend   React 18 + Vite + Tailwind CSS
├── Backend    Node.js + Express.js REST API
├── Database   MongoDB 7 (Mongoose)
├── Auth       Google OAuth 2.0 + JWT (access) + httpOnly cookie (refresh)
├── Crypto     AES-256-GCM via Node built-in crypto (no third-party libs)
└── Container  Docker + Docker Compose
```

---

## Security Architecture

```
KEK  (env var only — never in DB)
 └── wraps/unwraps per-user DEK
      └── DEK  (stored encrypted in User.encryptedDEK)
           └── encrypts every VaultEntry payload  { username, password, notes }
```

- **Two-key envelope** — rotating the KEK only requires re-wrapping each user's DEK, not re-encrypting all vault entries.
- **Fresh IV per entry** — every encrypt call generates a cryptographically random 12-byte IV.
- **GCM authentication tag** — any tampering with ciphertext is detected before decryption.
- **Ownership guard** — every resource query includes `{ owner: req.user._id }`. The mongoose pre-find hook throws if an `owner` filter is missing.
- **Short-lived JWTs** — access tokens expire in 15 minutes; refresh via httpOnly cookie.

---

## Prerequisites

Make sure these are installed on your machine before starting:

| Tool          | Minimum version | Check command         |
|---------------|-----------------|-----------------------|
| Docker        | 24.x            | `docker --version`    |
| Docker Compose| 2.x             | `docker compose version` |
| Node.js       | 20.x (optional) | `node --version`      |
| Git           | any             | `git --version`       |

> **Node.js is optional** — Docker handles everything. You only need it locally if you want to run without Docker.

---

## Step-by-Step Setup

### Step 1 — Clone the repository

```bash
git clone https://github.com/your-username/password-manager.git
cd password-manager
```

---

### Step 2 — Create your `.env` file

Copy the example and fill in every value:

```bash
cp .env.example .env
```

Open `.env` in your editor. You need to fill in:

**MongoDB credentials**
```env
MONGO_ROOT_USER=admin
MONGO_ROOT_PASS=choose_a_strong_password
```

**Secret keys** — generate each one with the commands below:

```bash
# SESSION_SECRET (any 64-char random string)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# SERVER_KEK — must be exactly 64 hex chars (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> ⚠️ **Never reuse these values across environments.** Losing `SERVER_KEK` means all stored passwords become permanently unrecoverable.

---

### Step 3 — Set up Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Set Application type to **Web application**
6. Add these **Authorised JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:5000
   ```
7. Add this **Authorised redirect URI**:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
8. Click **Create** — copy the **Client ID** and **Client Secret** into your `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

---

### Step 4 — Build and start with Docker Compose

```bash
docker compose up --build
```

This single command:
- Pulls the MongoDB 7 image and creates the database + indexes
- Builds the Node.js server image and starts it on port **5000**
- Builds the React/Vite client image and starts it on port **5173**
- Wires all three containers together on an isolated Docker network

Wait until you see output like:
```
pm_server  | ✅  MongoDB connected: mongo
pm_server  | 🔐  Password Manager API running on port 5000
pm_client  | VITE v5.x.x  ready in 800ms
pm_client  | ➜  Local:   http://0.0.0.0:5173/
```

---

### Step 5 — Open the app

Navigate to **[http://localhost:5173](http://localhost:5173)** in your browser.

Click **Continue with Google**, sign in, and your encrypted vault is ready.

---

## Useful Docker Commands

```bash
# Start in background (detached)
docker compose up -d

# View live logs
docker compose logs -f

# View logs for one service only
docker compose logs -f server
docker compose logs -f client

# Stop all containers
docker compose down

# Stop and DELETE all data (including MongoDB volume)
docker compose down -v

# Rebuild after code changes
docker compose up --build

# Open a shell inside the running server container
docker compose exec server sh

# Open a MongoDB shell
docker compose exec mongo mongosh -u admin -p
```

---

## Running Without Docker (local development)

If you prefer running services directly:

**Start MongoDB** (requires MongoDB installed locally or via Homebrew):
```bash
mongod --dbpath ./data/db
```

**Start the server:**
```bash
cd server
npm install
npm run dev
```

**Start the client:**
```bash
cd client
npm install
npm run dev
```

Set `MONGO_URI=mongodb://localhost:27017/password_manager` in your `.env`.

---

## API Reference

All vault endpoints require `Authorization: Bearer <access_token>`.

| Method | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| GET    | `/api/auth/google`     | Initiate Google OAuth flow           |
| GET    | `/api/auth/google/callback` | OAuth redirect handler          |
| POST   | `/api/auth/refresh`    | Refresh access token (uses cookie)   |
| POST   | `/api/auth/logout`     | Clear refresh token cookie           |
| GET    | `/api/auth/me`         | Get current user profile             |
| GET    | `/api/vault`           | List all vault entries (metadata)    |
| POST   | `/api/vault`           | Create new encrypted entry           |
| GET    | `/api/vault/:id`       | Get single entry (fully decrypted)   |
| PUT    | `/api/vault/:id`       | Update entry                         |
| DELETE | `/api/vault/:id`       | Delete entry                         |
| PATCH  | `/api/vault/:id/favorite` | Toggle favorite flag             |

---

## Project Structure

```
password-manager/
├── docker-compose.yml          # Orchestrates all 3 services
├── mongo-init.js               # DB init script (indexes)
├── .env.example                # Template — copy to .env
│
├── server/
│   ├── config/
│   │   ├── env.js              # Zod env validation (fails fast on startup)
│   │   ├── db.js               # Mongoose connection
│   │   └── passport.js         # Google OAuth strategy
│   ├── controllers/
│   │   ├── authController.js   # OAuth flow + JWT issuance
│   │   └── vaultController.js  # CRUD + encrypt/decrypt logic
│   ├── middleware/
│   │   ├── authenticate.js     # JWT guard
│   │   ├── ownershipGuard.js   # Resource ownership check
│   │   └── validateRequest.js  # Zod body validation
│   ├── models/
│   │   ├── User.js             # User schema + DEK storage
│   │   └── VaultEntry.js       # Encrypted entry schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── vaultRoutes.js
│   └── services/
│       └── cryptoService.js    # All AES-256-GCM operations
│
└── client/
    └── src/
        ├── components/
        │   ├── auth/OAuthCallback.jsx
        │   ├── vault/VaultItem.jsx
        │   ├── vault/EntryModal.jsx
        │   └── ui/{CopyButton,PasswordStrengthMeter}.jsx
        ├── hooks/useVault.js
        ├── pages/{Login,Dashboard}.jsx
        ├── services/api.js         # Axios + silent token refresh
        └── store/authStore.js      # Zustand auth state
```

---

## Environment Variables Reference

| Variable              | Required | Description                                      |
|-----------------------|----------|--------------------------------------------------|
| `MONGO_ROOT_USER`     | Yes      | MongoDB root username                            |
| `MONGO_ROOT_PASS`     | Yes      | MongoDB root password                            |
| `SESSION_SECRET`      | Yes      | Express session secret (≥32 chars)               |
| `SERVER_KEK`          | Yes      | 64 hex chars — Key Encryption Key                |
| `JWT_SECRET`          | Yes      | Signs access tokens (≥32 chars)                  |
| `JWT_REFRESH_SECRET`  | Yes      | Signs refresh tokens (≥32 chars)                 |
| `GOOGLE_CLIENT_ID`    | Yes      | From Google Cloud Console                        |
| `GOOGLE_CLIENT_SECRET`| Yes      | From Google Cloud Console                        |
| `GOOGLE_CALLBACK_URL` | Yes      | Must match Google Console exactly                |
| `CLIENT_URL`          | Yes      | Frontend origin (for CORS + redirect)            |
| `VITE_API_URL`        | Yes      | Backend API base URL for the React app           |

---

## Common Issues

**`SERVER_KEK must be exactly 64 hex characters` on startup**
→ Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and paste the output into `.env`.

**`redirect_uri_mismatch` from Google**
→ The `GOOGLE_CALLBACK_URL` in `.env` must exactly match what you added in the Google Console, including the protocol and port.

**Port 5173 or 5000 already in use**
→ Change the host port mapping in `docker-compose.yml` (e.g. `"5001:5000"`).

**MongoDB connection refused**
→ The server waits for the health check to pass. Give it ~15 seconds after `docker compose up`.

**Changes not reflecting after editing code**
→ Run `docker compose up --build` to force a rebuild of the changed image.

---

## Production Hardening Checklist

Before deploying to production, address these additional items:

- [ ] Set `NODE_ENV=production` — disables stack traces in error responses
- [ ] Use a secrets manager (AWS Secrets Manager, Vault) instead of `.env` for `SERVER_KEK`
- [ ] Enable TLS/HTTPS — set `secure: true` on cookies
- [ ] Set `sameSite: 'strict'` on the refresh token cookie
- [ ] Point MongoDB at a managed cluster (Atlas) with auth and TLS
- [ ] Add a reverse proxy (Nginx/Caddy) in front of both services
- [ ] Set up automated MongoDB backups
- [ ] Add structured logging (Winston/Pino) and a log aggregator
- [ ] Implement refresh token rotation + revocation list in Redis
- [ ] Run `docker scout` or `trivy` to scan images for vulnerabilities

---

## License

MIT
