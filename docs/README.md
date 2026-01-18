# Puppet Master Documentation

Welcome to the Puppet Master documentation.

## Folder Structure

```
docs/
├── guides/           # User guides and tutorials
├── reference/        # Technical references
├── architecture/     # System architecture & design
├── operations/       # Deployment & monitoring
├── roadmap/          # Future plans & roadmaps
├── internal/         # Internal notes & analysis
└── styles/           # CSS documentation
```

---

## Guides

| Document | Description |
|----------|-------------|
| [Getting Started](guides/getting-started.md) | Installation and setup guide |
| [Admin Guide](guides/admin-guide.md) | User guide for the admin panel |
| [Setup Workflows](guides/setup-workflows.md) | Detailed setup and migration workflows |

---

## Technical Reference

| Document | Description |
|----------|-------------|
| [API Reference](reference/api-reference.md) | All API endpoints (auth, admin, content, 2FA) |
| [Configuration](reference/configuration.md) | Complete configuration reference |
| [Security](reference/security.md) | Security features and checklist |
| [WebSocket](reference/websocket.md) | Real-time WebSocket communication |
| [External API](reference/external-api.md) | External API integration guide |
| [Low-End Devices](reference/low-end-devices.md) | Performance optimization for low-end devices |
| [Virus Scanning](reference/security-virus-scanning.md) | File upload security scanning |

---

## Architecture

| Document | Description |
|----------|-------------|
| [PM Architecture](architecture/pm-architecture.md) | Overall system architecture |
| [PM System Overview](architecture/pm-system-overview.md) | System concepts and workflows |
| [PM Claude System](architecture/pm-claude-system.md) | Claude AI integration for PM |

---

## CSS Architecture

| Document | Description |
|----------|-------------|
| [CSS Architecture](styles/CSS_ARCHITECTURE.md) | 5-layer CSS system overview |
| [CSS Quick Reference](styles/CSS_QUICK_REFERENCE.md) | CSS classes and utilities lookup |
| [CSS Customization](styles/CSS_CUSTOMIZATION.md) | Customizing the CSS system |

---

## Operations

| Document | Description |
|----------|-------------|
| [Deployment](operations/deployment.md) | Docker, Kamal, and production deployment |
| [Monitoring](operations/monitoring.md) | Health checks and logging |

---

## Roadmap

| Document | Description |
|----------|-------------|
| [Refactoring Roadmap](roadmap/refactoring-roadmap.md) | Planned code improvements |

---

## Internal

> These documents are for internal reference and development notes.

| Document | Description |
|----------|-------------|
| [Audit Report](internal/audit-report.md) | Codebase audit findings |
| [Contribution Workflows](internal/contribution-workflows-analysis.md) | Workflow analysis document |
| [Claude Code RAG Guide](internal/claude-code-rag-guide.md) | RAG integration notes |

---

## Quick Links

- **Project README**: [../README.md](../README.md) — Project overview and quick start
- **Config File**: [../app/puppet-master.config.ts](../app/puppet-master.config.ts) — Main configuration
- **Environment Variables**: [../.env.example](../.env.example) — Environment variables template
