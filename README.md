# agent-learning

Learning Agentic Workflow — Copilot customization, security automation, and AI-assisted development.

## Repository Structure

```
agent-learning/
│
├── .github/
│   ├── dependabot.yml                     # Dependabot config (GitHub Actions + npm)
│   ├── SECURITY.md                        # Security policy & vulnerability reporting
│   └── workflows/
│       ├── copilot-review.yml             # Copilot AI-powered PR review (auto mode)
│       └── dependency-review.yml          # Block PRs with vulnerable dependencies
│
├── src/                                   # Application source code
│   ├── index.html                         # Kanban board — markup
│   ├── style.css                          # Kanban board — styling (dark theme, color-coded)
│   └── app.js                             # Kanban board — drag-and-drop, localStorage
│
├── docs/                                  # Documentation & guides
│   ├── plan.md                            # Kanban board implementation plan
│   ├── copilot-customization-reference.md # Copilot instructions/agents/skills guide
│   └── dependabot-copilot-review-guide.md # Dependabot & Copilot PR review setup guide
│
├── package.json                           # npm dependencies & scripts
├── .gitignore                             # Git ignore rules
└── README.md                              # This file
```

## Quick Start

```bash
# Install dependencies
npm install

# Start local dev server (opens browser at http://localhost:3000)
npm run dev

# Lint & format
npm run lint
npm run format
```

## Dependencies & Known Vulnerabilities

This project intentionally pins **older versions** of several packages to demonstrate Dependabot's vulnerability detection. Once pushed to GitHub, Dependabot will flag these and create fix PRs.

### Production Dependencies

| Package | Pinned Version | Latest | Known CVEs |
|---------|---------------|--------|------------|
| `express` | 4.17.1 | 4.21+ | [CVE-2024-29041](https://github.com/advisories/GHSA-rv95-896h-c2f7) — Open redirect |
| `lodash` | 4.17.20 | 4.17.21 | [CVE-2021-23337](https://github.com/advisories/GHSA-35jh-r3h4-6jhm) — Command injection |
| `axios` | 0.21.1 | 1.7+ | [CVE-2021-3749](https://github.com/advisories/GHSA-cph5-m8f7-6c5x) — ReDoS, SSRF |
| `moment` | 2.29.1 | 2.30+ | [CVE-2022-31129](https://github.com/advisories/GHSA-wc69-rhjr-hc9g) — ReDoS via path traversal |
| `marked` | 4.0.10 | 12+ | [CVE-2022-21680](https://github.com/advisories/GHSA-rrrm-qjm4-v8hf) — ReDoS |
| `jsonwebtoken` | 8.5.1 | 9.0+ | [CVE-2022-23529](https://github.com/advisories/GHSA-27h2-hvpr-p74q) — Insecure key handling |
| `helmet` | 4.6.0 | 7+ | Outdated security headers |
| `cors` | 2.8.5 | 2.8.5 | ✅ No known CVEs |

### Dev Dependencies

| Package | Pinned Version | Known CVEs |
|---------|---------------|------------|
| `minimist` | 1.2.5 | [CVE-2021-44906](https://github.com/advisories/GHSA-xvch-5gv4-984h) — Prototype pollution |
| `glob-parent` | 5.1.1 | [CVE-2021-35065](https://github.com/advisories/GHSA-cj88-88mr-972w) — ReDoS |
| `nth-check` | 1.0.2 | [CVE-2021-3803](https://github.com/advisories/GHSA-rp65-9cf3-cjxr) — ReDoS |
| `postcss` | 7.0.35 | [CVE-2021-23382](https://github.com/advisories/GHSA-566m-qj78-rww5) — ReDoS |
| `semver` | 7.3.5 | [CVE-2022-25883](https://github.com/advisories/GHSA-c2qf-rxjj-qqgw) — ReDoS |

> **What Dependabot will do**: After pushing to GitHub, Dependabot will create individual PRs to bump each vulnerable package to a safe version. The Dependency Review workflow will block any new PR that tries to add more vulnerable packages.

## Security & Automation

| Tool | File | Purpose |
|------|------|---------|
| **Dependabot** | `.github/dependabot.yml` | Auto-updates dependencies, flags CVEs |
| **Copilot PR Review** | `.github/workflows/copilot-review.yml` | AI code review on every PR |
| **Dependency Review** | `.github/workflows/dependency-review.yml` | Blocks PRs introducing vulnerable deps |
| **Security Policy** | `.github/SECURITY.md` | How to report vulnerabilities |

See [docs/dependabot-copilot-review-guide.md](docs/dependabot-copilot-review-guide.md) for full setup instructions and guidelines.

## Kanban Board

A drag-and-drop Kanban board with 5 columns (Backlog → Done), localStorage persistence, and color-coded columns. Run `npm run dev` or open `src/index.html` directly in a browser.

## Copilot Customization Reference

See [docs/copilot-customization-reference.md](docs/copilot-customization-reference.md) for a complete guide on `.instructions.md`, `.agent.md`, `SKILL.md`, prompts, hooks, and workspace instructions.
