# PuppetMaster2 - DevOps Stack Rationale

This document explains why we chose our DevOps stack and compares it to alternatives.

---

## Stack Overview

| Component     | Tool           | Purpose                      |
| ------------- | -------------- | ---------------------------- |
| Containers    | Docker         | Application packaging        |
| Deployment    | Kamal          | Zero-downtime deploys        |
| Provisioning  | Ansible        | Server setup automation      |
| CI/CD         | GitHub Actions | Automated testing and builds |
| Reverse Proxy | Traefik        | SSL termination, routing     |

---

## Docker vs Alternatives

### Why Docker?

| Option      | Pros                        | Cons                            |
| ----------- | --------------------------- | ------------------------------- |
| **Docker**  | Industry standard, portable | Slight overhead                 |
| Podman      | Rootless by default         | Less tooling support            |
| Bare metal  | Maximum performance         | No isolation, hard to rollback  |
| systemd     | No container overhead       | Manual dependency management    |

**Decision**: Docker provides the best balance of portability, isolation, and ecosystem support.

### Our Docker Setup

- **Multi-stage builds** - Small production images (~200MB)
- **Non-root user** - Runs as `nuxt:1001` for security
- **Alpine base** - Minimal attack surface
- **Health checks** - Built into container

---

## Kamal vs Alternatives

### Why Kamal?

| Tool           | Pros                               | Cons                           | Best For                   |
| -------------- | ---------------------------------- | ------------------------------ | -------------------------- |
| **Kamal**      | Zero-config, built-in Traefik      | Ruby dependency                | Single server, small teams |
| Coolify        | GUI, many templates                | Heavier, less control          | Non-developers             |
| CapRover       | GUI, git push deploy               | Another service to maintain    | Teams wanting PaaS-like UX |
| Kubernetes     | Infinite scale, cloud-native       | Overkill for 1-3 servers       | Large teams, multi-region  |
| Manual SSH     | Full control                       | No rollback, error-prone       | Never recommended          |
| Docker Compose | Simple                             | No zero-downtime, no SSL       | Development only           |

**Decision**: Kamal is ideal for single-VPS Node.js apps with SQLite. It provides:

- Zero-downtime deployments out of the box
- Built-in Traefik with Let's Encrypt SSL
- One-command rollbacks
- No additional services to maintain

### Why Not Kubernetes?

Kubernetes requires:

- 3+ nodes for production (cost)
- Dedicated cluster management
- Complex networking
- Steep learning curve

For a single SQLite-based app, this is massive overkill.

---

## GitHub Actions vs Alternatives

### Why GitHub Actions?

| Platform       | Free Minutes (Private) | Syntax     | Integration    |
| -------------- | ---------------------- | ---------- | -------------- |
| **GitHub**     | 2,000/month            | Simple     | Native to repo |
| GitLab CI      | 400/month              | More complex | Native         |
| Jenkins        | Unlimited (self-host)  | Groovy     | Requires setup |
| CircleCI       | 6,000/month            | YAML       | Third-party    |

**Decision**: If code is on GitHub, use GitHub Actions. Native integration, simple YAML, generous free tier.

### Our Pipeline

```
Push to master → Lint → Test → Build → Docker Build → (Deploy)
                  ↓       ↓       ↓          ↓
               ~30s    ~60s    ~90s       ~120s
```

Total CI time: ~5 minutes per push. With 2,000 free minutes, that's ~400 deploys/month.

---

## Ansible vs Alternatives

### Why Ansible?

| Tool         | Use Case                        | Our Fit                       |
| ------------ | ------------------------------- | ----------------------------- |
| **Ansible**  | One-time server setup           | Run once, done                |
| Terraform    | Cloud infrastructure (VPCs)     | Overkill for single VPS       |
| cloud-init   | Boot-time setup only            | Less flexible                 |
| Manual SSH   | No reproducibility              | Never recommended             |

**Decision**: Ansible for server prep + Kamal for deploys = industry standard pattern.

### What Ansible Does For Us

1. **common** - Updates packages, installs essentials (curl, git, ffmpeg, sqlite3)
2. **security** - Configures UFW firewall, fail2ban, SSH hardening
3. **docker** - Installs Docker, creates Traefik network and volumes
4. **deploy-user** - Creates `deploy` user with Docker permissions

Run once per server, then forget about it.

---

## Traefik vs Alternatives

### Why Traefik?

| Proxy     | SSL Auto-Renewal | Docker-Native | Config          |
| --------- | ---------------- | ------------- | --------------- |
| **Traefik** | Built-in       | Labels        | Automatic       |
| Nginx     | Certbot cron     | Manual        | Config files    |
| Caddy     | Built-in         | Manual        | Caddyfile       |

**Decision**: Traefik is built into Kamal and auto-configures from Docker labels. Zero manual SSL management.

---

## Cost Analysis

### Single VPS Setup (Current)

| Item              | Monthly Cost |
| ----------------- | ------------ |
| VPS (2GB RAM)     | $10-20       |
| Domain            | $1           |
| GitHub (Private)  | $0           |
| SSL (Let's Encrypt) | $0         |
| **Total**         | **$11-21**   |

### If We Used Kubernetes

| Item                     | Monthly Cost |
| ------------------------ | ------------ |
| 3x Nodes (minimum)       | $30-60       |
| Load Balancer            | $10          |
| Managed K8s control plane | $0-70       |
| Domain                   | $1           |
| **Total**                | **$41-141**  |

**Verdict**: Stick with Kamal until you need multi-region or 10+ replicas.

---

## When to Reconsider

Consider changing the stack when:

| Trigger                        | Solution                    |
| ------------------------------ | --------------------------- |
| Need multi-region              | Add Kubernetes or Fly.io    |
| SQLite becomes bottleneck      | Add Postgres + connection pool |
| Need 10+ app replicas          | Add load balancer + K8s     |
| Team grows to 20+ developers   | Consider GitLab (self-host) |

Until then, this stack is optimal.

---

## Summary

```
Local Dev          Server Provisioning          Deployment
─────────          ───────────────────          ──────────
npm run dev   →    ansible-playbook    →        kamal deploy
                   (run once)                   (run on every push)
```

**Stack Score**: 9/10 for single-VPS Node.js applications.
