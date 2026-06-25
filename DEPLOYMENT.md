# CodeScope — Deployment Guide

This document covers the complete deployment, maintenance, and recovery workflow for CodeScope. It is written so that a fresh Ubuntu server can be fully configured using only this document.

---

## 1. Deployment Overview

CodeScope uses a split deployment model:

```text
Developer → GitHub Push
                │
    ┌───────────┴───────────┐
    ▼                       ▼
Vercel (Frontend)     Azure VM (Backend)
    │                       │
    │                   Nginx (Reverse Proxy)
    │                       │
    │                   HTTPS (Let's Encrypt)
    │                       │
    │                   PM2 (Process Manager)
    │                       │
    │                   Express API (:5000)
    │                       │
    │                   Docker Sandbox
    │                       │
    │                   eclipse-temurin:17
    │                       │
    └───────► API ◄─────────┘
           Requests
```

| Layer | Responsibility |
|:---|:---|
| **Vercel** | Hosts the Next.js frontend. Automatic deployments on push to `main`. |
| **Azure VM** | Runs the Node.js backend, Docker daemon, and Nginx. |
| **Nginx** | Terminates HTTPS via Let's Encrypt and reverse-proxies to Express on port 5000. |
| **PM2** | Keeps the Express process alive, handles graceful restarts, and survives reboots. |
| **Docker** | Runs ephemeral `eclipse-temurin:17` containers for each Java code execution. |
| **Let's Encrypt** | Provides free, auto-renewing TLS certificates via Certbot. |
| **DuckDNS** | Provides a free dynamic DNS hostname pointing to the Azure VM's public IP. |

---

## 2. Production Stack

| Component | Value |
|:---|:---|
| **OS** | Ubuntu 22.04 LTS (or later) |
| **Cloud Provider** | Azure (Standard B2s VM or similar) |
| **Frontend Hosting** | Vercel |
| **Backend Runtime** | Node.js 18+ |
| **Web Framework** | Express 5 |
| **Reverse Proxy** | Nginx |
| **Process Manager** | PM2 |
| **Container Runtime** | Docker Engine |
| **Java** | eclipse-temurin:17 (inside Docker) |
| **SSL** | Let's Encrypt (Certbot) |
| **DNS** | DuckDNS |
| **Version Control** | Git |

---

## 3. Prerequisites

Before starting, ensure you have:

- [ ] An **Azure VM** (or any Ubuntu server) with a public IP address
- [ ] **SSH access** to the server (`ssh user@<public-ip>`)
- [ ] A **GitHub account** with the CodeScope repository
- [ ] A **Vercel account** linked to GitHub
- [ ] A **DuckDNS account** with a registered subdomain pointing to your VM's public IP
- [ ] A **domain** or DuckDNS hostname (e.g., `codescope-api.duckdns.org`)

### Install system dependencies on the server

```bash
sudo apt update && sudo apt upgrade -y

# Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v   # Should be v18+
npm -v

# Git
sudo apt install -y git

# Nginx
sudo apt install -y nginx

# PM2 (global)
sudo npm install -g pm2

# Docker
sudo apt install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker

# Add your user to the docker group (avoids needing sudo for docker commands)
sudo usermod -aG docker $USER
# Log out and back in for group membership to take effect

# Certbot (for HTTPS)
sudo apt install -y certbot python3-certbot-nginx

# Pull the Java Docker image used for execution
docker pull eclipse-temurin:17
```

> **⚠️ Important:** After `usermod -aG docker $USER`, you must log out and SSH back in. Otherwise, the Node.js process (run by your user via PM2) will not have permission to spawn Docker containers.

---

## 4. Backend Deployment

### 4.1 Clone the repository

```bash
cd ~
git clone https://github.com/VrajPatel1635/CodeScope.git
cd CodeScope/Server
```

### 4.2 Install dependencies

```bash
npm install
```

### 4.3 Configure environment variables

```bash
cp .env.example .env
nano .env
```

Set the following values:

```env
PORT=5000
CLIENT_URL=https://code-scope-ochre.vercel.app
USE_DOCKER=true
DOCKER_TIMEOUT_MS=30000
MAX_TRACE_SIZE=5242880
```

> **⚠️ Critical:** `CLIENT_URL` must exactly match your Vercel deployment URL (including `https://`, no trailing slash). CORS will reject requests from any other origin.

### 4.4 Start the server with PM2

```bash
pm2 start src/index.js --name codescope-api
pm2 save
pm2 startup
```

`pm2 startup` will print a command — **copy and run it**. This ensures the process restarts after a server reboot.

### 4.5 Verify

```bash
# Health check
curl http://localhost:5000/health
# Expected: {"status":"ok"}

# Docker health check
curl http://localhost:5000/health/docker
# Expected: {"docker":"available"}
```

---

## 5. Frontend Deployment

The frontend is deployed on **Vercel**.

### 5.1 Import the repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `CodeScope` GitHub repository
3. Set the **Root Directory** to `client`
4. Vercel auto-detects Next.js — no framework override needed

### 5.2 Set environment variables

In the Vercel project settings → **Environment Variables**, add:

| Variable | Value |
|:---|:---|
| `NEXT_PUBLIC_API_URL` | `https://codescope-api.duckdns.org` |

Replace with your actual backend HTTPS URL.

> **⚠️ Note:** `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser.

### 5.3 Deploy

Click **Deploy**. Vercel builds and hosts the site. Subsequent pushes to `main` trigger automatic redeployments.

### 5.4 Verify

Visit `https://code-scope-ochre.vercel.app/` and confirm the landing page loads. Navigate to the visualizer and execute a simple algorithm to confirm the backend connection.

---

## 6. Environment Variables

### Backend (`Server/.env`)

| Variable | Default | Required | Description |
|:---|:---|:---:|:---|
| `PORT` | `5000` | ✅ | Port the Express server listens on |
| `CLIENT_URL` | `http://localhost:3000` | ✅ | Vercel frontend URL for CORS. Must be exact. |
| `USE_DOCKER` | `true` | ✅ | Enables Docker sandbox execution. Set to `false` only for local dev without Docker. |
| `DOCKER_TIMEOUT_MS` | `30000` | ❌ | Maximum container execution time in ms before forced kill |
| `MAX_TRACE_SIZE` | `5242880` | ❌ | Maximum stdout trace size in bytes (5MB) before container kill |

### Frontend (`client/.env.local` or Vercel dashboard)

| Variable | Default | Required | Description |
|:---|:---|:---:|:---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | ✅ | Backend API base URL. Must use HTTPS in production. |

---

## 7. Reverse Proxy (Nginx)

Nginx sits in front of Express to:
- Terminate HTTPS (so Express doesn't handle TLS)
- Forward requests to `localhost:5000`
- Set proper proxy headers for IP forwarding and WebSocket compatibility

### 7.1 Create the site configuration

```bash
sudo nano /etc/nginx/sites-available/codescope-api
```

Paste:

```nginx
server {
    listen 80;
    server_name codescope-api.duckdns.org;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10M;
    }
}
```

Replace `codescope-api.duckdns.org` with your actual hostname.

### 7.2 Enable the site

```bash
sudo ln -s /etc/nginx/sites-available/codescope-api /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default   # Remove the default Nginx welcome page
sudo nginx -t                               # Test configuration
sudo systemctl restart nginx
```

### 7.3 Verify

```bash
curl http://codescope-api.duckdns.org/health
# Expected: {"status":"ok"}
```

---

## 8. HTTPS (Let's Encrypt)

### 8.1 DuckDNS setup

1. Register at [duckdns.org](https://www.duckdns.org/)
2. Create a subdomain (e.g., `codescope-api`)
3. Point it to your Azure VM's **public IP address**
4. Verify DNS resolution:

```bash
nslookup codescope-api.duckdns.org
# Should return your VM's public IP
```

> **⚠️ Note:** DNS propagation can take up to 15 minutes. Wait until `nslookup` resolves correctly before proceeding to Certbot.

### 8.2 Obtain certificate with Certbot

```bash
sudo certbot --nginx -d codescope-api.duckdns.org
```

Certbot will:
- Verify domain ownership
- Obtain the certificate
- Automatically modify your Nginx config to add the `ssl` directives and redirect HTTP → HTTPS

### 8.3 Verify auto-renewal

```bash
sudo certbot renew --dry-run
```

Certbot installs a systemd timer that renews certificates automatically before expiry (every 90 days).

### 8.4 Test HTTPS

```bash
curl https://codescope-api.duckdns.org/health
# Expected: {"status":"ok"}
```

---

## 9. Azure Configuration

### 9.1 VM Requirements

- **Size:** Standard B2s (2 vCPU, 4 GB RAM) or larger
- **OS:** Ubuntu 22.04 LTS
- **Disk:** 30 GB minimum (Docker images consume space)
- **Public IP:** Static (so DuckDNS mapping doesn't break on reboot)

### 9.2 Network Security Group (NSG)

Open the following inbound ports in the Azure NSG:

| Port | Protocol | Purpose |
|:---:|:---|:---|
| `22` | TCP | SSH access |
| `80` | TCP | HTTP (Certbot verification + redirect to HTTPS) |
| `443` | TCP | HTTPS (production API traffic) |

> **⚠️ Do NOT expose port 5000.** Express should only be reachable via Nginx on ports 80/443. Direct access to 5000 bypasses HTTPS.

### 9.3 Static Public IP

In Azure Portal → VM → Networking → Public IP → set to **Static**. This prevents the IP from changing when the VM restarts, which would break DuckDNS.

---

## 10. PM2

PM2 manages the Express backend process.

### Common Commands

| Command | Purpose |
|:---|:---|
| `pm2 start src/index.js --name codescope-api` | Start the backend |
| `pm2 restart codescope-api` | Restart (triggers graceful shutdown via SIGTERM) |
| `pm2 stop codescope-api` | Stop the process |
| `pm2 delete codescope-api` | Remove from PM2 process list |
| `pm2 logs codescope-api` | Stream live logs |
| `pm2 logs codescope-api --lines 100` | View last 100 log lines |
| `pm2 monit` | Real-time CPU/memory dashboard |
| `pm2 status` | Show all managed processes |
| `pm2 save` | Save current process list (for auto-restart on reboot) |
| `pm2 startup` | Generate system startup script |

### When to use each

- **After code changes:** `pm2 restart codescope-api`
- **After server reboot:** PM2 auto-restarts if `pm2 save` and `pm2 startup` were configured
- **Debugging crashes:** `pm2 logs codescope-api --lines 200`
- **Performance monitoring:** `pm2 monit`

> The backend implements graceful shutdown handling. PM2 sends `SIGTERM`, Express drains connections for up to 10 seconds, then exits cleanly.

---

## 11. Docker

### Why Docker is required

CodeScope executes arbitrary user-submitted Java code. Every execution runs inside an ephemeral Docker container with strict resource limits (`--memory=256m`, `--cpus=0.5`, `--network=none`, `--pids-limit=64`). This prevents malicious code from affecting the host system.

### Verify installation

```bash
docker --version
docker info         # Should show the daemon is running
```

### Verify the Java image is available

```bash
docker images | grep eclipse-temurin
# Should show eclipse-temurin:17
```

If missing:

```bash
docker pull eclipse-temurin:17
```

### Test a container manually

```bash
docker run --rm eclipse-temurin:17 java -version
# Should print Java 17 version info
```

### Check for orphaned containers

```bash
docker ps -a | grep sandbox
# Should be empty if no executions are in progress
```

If orphaned containers exist:

```bash
docker rm -f $(docker ps -a -q --filter "name=sandbox")
```

---

## 12. Updating Production

### Backend update workflow

```bash
cd ~/CodeScope/Server

# Pull latest code
git pull origin main

# Install new dependencies (if package.json changed)
npm install

# Restart the backend
pm2 restart codescope-api

# Verify
curl https://codescope-api.duckdns.org/health
curl https://codescope-api.duckdns.org/health/docker
```

### Frontend update workflow

Push to the `main` branch on GitHub. Vercel automatically rebuilds and deploys.

If environment variables changed on Vercel, trigger a manual redeployment from the Vercel dashboard.

### Post-update verification

1. `curl https://codescope-api.duckdns.org/health` → `{"status":"ok"}`
2. `curl https://codescope-api.duckdns.org/health/docker` → `{"docker":"available"}`
3. Visit `https://code-scope-ochre.vercel.app/` → landing page loads
4. Execute a simple algorithm in the visualizer → results render correctly

---

## 13. Monitoring

### Backend health

```bash
curl https://codescope-api.duckdns.org/health
curl https://codescope-api.duckdns.org/health/docker
```

### PM2 status

```bash
pm2 status
pm2 monit
pm2 logs codescope-api --lines 50
```

### Nginx status

```bash
sudo systemctl status nginx
sudo nginx -t
```

### Docker daemon

```bash
sudo systemctl status docker
docker ps       # Running containers
docker ps -a    # All containers (check for orphans)
```

### SSL certificate expiry

```bash
sudo certbot certificates
# Shows expiry dates for all managed certificates
```

### Disk usage

```bash
df -h
docker system df   # Docker-specific disk usage
```

---

## 14. Backup & Recovery

### What to back up

| Item | Location | Why |
|:---|:---|:---|
| Backend `.env` | `~/CodeScope/Server/.env` | Contains production environment variables |
| Nginx config | `/etc/nginx/sites-available/codescope-api` | Reverse proxy configuration |
| SSL certificates | `/etc/letsencrypt/` | TLS certificates (auto-renewed, but useful for migration) |
| PM2 process list | `~/.pm2/dump.pm2` | Saved process configuration |

### Backup commands

```bash
# Copy critical files to a safe location
cp ~/CodeScope/Server/.env ~/backups/server.env.bak
sudo cp /etc/nginx/sites-available/codescope-api ~/backups/nginx-codescope.bak
sudo cp -r /etc/letsencrypt ~/backups/letsencrypt-backup
```

### Recovery onto a new VM

1. Provision a new Ubuntu VM with a static public IP
2. Update DuckDNS to point to the new IP
3. Follow Sections 3–9 of this document
4. Restore `.env` from backup
5. Restore Nginx config from backup (or re-create it)
6. Run `sudo certbot --nginx -d codescope-api.duckdns.org` for fresh certificates
7. Start PM2 and verify health endpoints

---

## 15. Troubleshooting

### SSH permission denied

| | |
|:---|:---|
| **Symptom** | `Permission denied (publickey)` when connecting via SSH |
| **Cause** | Missing or incorrect SSH private key, or wrong username |
| **Fix** | Verify the key file: `ssh -i ~/.ssh/your-key.pem user@<ip>`. Ensure file permissions: `chmod 400 ~/.ssh/your-key.pem` |

### Docker daemon not running

| | |
|:---|:---|
| **Symptom** | `/health/docker` returns `{"docker":"unavailable"}` or executions fail |
| **Cause** | Docker service is stopped |
| **Fix** | `sudo systemctl start docker && sudo systemctl enable docker` |

### Docker permission denied

| | |
|:---|:---|
| **Symptom** | `Error: connect EACCES /var/run/docker.sock` in PM2 logs |
| **Cause** | The user running PM2 is not in the `docker` group |
| **Fix** | `sudo usermod -aG docker $USER`, then log out/in and `pm2 restart codescope-api` |

### Nginx serving default page

| | |
|:---|:---|
| **Symptom** | Visiting the domain shows "Welcome to Nginx" instead of the API |
| **Cause** | The default site is still enabled, or the CodeScope config is not linked |
| **Fix** | `sudo rm /etc/nginx/sites-enabled/default && sudo systemctl restart nginx` |

### Mixed Content errors

| | |
|:---|:---|
| **Symptom** | Browser console shows "Mixed Content: The page was loaded over HTTPS but requested an insecure resource" |
| **Cause** | Frontend `NEXT_PUBLIC_API_URL` is set to `http://` instead of `https://` |
| **Fix** | Update the Vercel environment variable to use `https://` and redeploy |

### CORS errors

| | |
|:---|:---|
| **Symptom** | Browser console shows "CORS policy does not allow access from the specified Origin" |
| **Cause** | Backend `CLIENT_URL` does not exactly match the frontend's origin |
| **Fix** | Ensure `CLIENT_URL` in `Server/.env` is `https://code-scope-ochre.vercel.app` (no trailing slash). Restart PM2. |

### PM2 process offline

| | |
|:---|:---|
| **Symptom** | `pm2 status` shows `stopped` or `errored` |
| **Cause** | Crash in application code, or missing `.env` file |
| **Fix** | Check logs: `pm2 logs codescope-api --lines 100`. Fix the issue, then `pm2 restart codescope-api` |

### Port already in use

| | |
|:---|:---|
| **Symptom** | `Error: listen EADDRINUSE :::5000` |
| **Cause** | Another process is using port 5000 |
| **Fix** | `lsof -i :5000` to find the PID, then `kill <PID>`. Or: `pm2 delete all && pm2 start src/index.js --name codescope-api` |

### Certbot failure

| | |
|:---|:---|
| **Symptom** | `certbot --nginx` fails with challenge errors |
| **Cause** | Port 80 is blocked in Azure NSG, or DNS hasn't propagated |
| **Fix** | Open port 80 in the NSG. Wait for `nslookup` to resolve. Retry Certbot. |

### Health endpoint unavailable

| | |
|:---|:---|
| **Symptom** | `curl https://codescope-api.duckdns.org/health` times out or returns error |
| **Cause** | Backend is down, Nginx is misconfigured, or port 443 is blocked |
| **Fix** | Check in order: `pm2 status` → `sudo systemctl status nginx` → Azure NSG rules |

### DuckDNS not resolving

| | |
|:---|:---|
| **Symptom** | `nslookup codescope-api.duckdns.org` returns NXDOMAIN |
| **Cause** | DuckDNS record not created, or IP not updated |
| **Fix** | Log in to duckdns.org, verify the subdomain exists and the IP is correct |

### Vercel deployment failures

| | |
|:---|:---|
| **Symptom** | Vercel build fails after push |
| **Cause** | Build error in Next.js code, or missing environment variable |
| **Fix** | Check the Vercel deployment logs. Ensure `NEXT_PUBLIC_API_URL` is set in the Vercel dashboard. |

---

## 16. Maintenance Checklist

### Weekly

- [ ] `curl https://codescope-api.duckdns.org/health` — backend alive
- [ ] `curl https://codescope-api.duckdns.org/health/docker` — Docker available
- [ ] `pm2 status` — process online, no restarts
- [ ] `df -h` — disk usage below 80%
- [ ] `docker ps -a | grep sandbox` — no orphaned containers

### Monthly

- [ ] `sudo apt update && sudo apt upgrade -y` — OS security patches
- [ ] `sudo certbot certificates` — SSL certificate not expiring soon
- [ ] `docker system prune -f` — clean unused Docker resources
- [ ] `pm2 logs codescope-api --lines 500` — review for recurring errors
- [ ] Check DuckDNS IP matches current VM IP

### Quarterly

- [ ] Review and update Node.js version if needed
- [ ] `docker pull eclipse-temurin:17` — update Java image
- [ ] `cd ~/CodeScope/Server && npm audit` — check for dependency vulnerabilities
- [ ] Review Azure VM size and cost

---

## 17. Useful Commands

### Git

```bash
git pull origin main
git status
git log --oneline -5
```

### Docker

```bash
docker ps                                    # Running containers
docker ps -a                                 # All containers
docker images                                # Installed images
docker pull eclipse-temurin:17               # Update Java image
docker system prune -f                       # Remove unused data
docker rm -f $(docker ps -a -q --filter "name=sandbox")  # Kill orphans
```

### PM2

```bash
pm2 start src/index.js --name codescope-api
pm2 restart codescope-api
pm2 stop codescope-api
pm2 delete codescope-api
pm2 status
pm2 logs codescope-api --lines 100
pm2 monit
pm2 save
pm2 startup
```

### Nginx

```bash
sudo nginx -t                                # Test config
sudo systemctl restart nginx
sudo systemctl status nginx
sudo nano /etc/nginx/sites-available/codescope-api
```

### Certbot

```bash
sudo certbot --nginx -d codescope-api.duckdns.org
sudo certbot renew --dry-run
sudo certbot certificates
```

### Systemctl

```bash
sudo systemctl status nginx
sudo systemctl status docker
sudo systemctl restart nginx
sudo systemctl restart docker
```

### Networking

```bash
curl http://localhost:5000/health
curl https://codescope-api.duckdns.org/health
nslookup codescope-api.duckdns.org
lsof -i :5000
lsof -i :80
lsof -i :443
```

### Node & Java

```bash
node -v
npm -v
docker run --rm eclipse-temurin:17 java -version
```

---

## 18. Deployment Verification Checklist

Run through this after every fresh deployment or major update:

- [ ] ✅ `pm2 status` — codescope-api is `online`
- [ ] ✅ `curl http://localhost:5000/health` → `{"status":"ok"}`
- [ ] ✅ `curl http://localhost:5000/health/docker` → `{"docker":"available"}`
- [ ] ✅ `sudo systemctl status nginx` — active
- [ ] ✅ `sudo nginx -t` — configuration OK
- [ ] ✅ `curl https://codescope-api.duckdns.org/health` → `{"status":"ok"}`
- [ ] ✅ `sudo certbot certificates` — valid, not expiring
- [ ] ✅ Vercel dashboard — latest deployment successful
- [ ] ✅ Visit `https://code-scope-ochre.vercel.app/` — landing page loads
- [ ] ✅ Execute a test algorithm — visualizer renders results
- [ ] ✅ `docker ps` — no orphaned sandbox containers

---

<div align="center">
  <sub>CodeScope Deployment Guide — <a href="https://www.vraj-patel.me/">Vraj Patel</a></sub>
</div>
