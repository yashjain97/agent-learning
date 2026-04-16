# Dependabot & Copilot PR Review — Setup Guidelines

## Table of Contents

- [Why This Is Required](#why-this-is-required)
- [What Each Component Does](#what-each-component-does)
- [Setup Guide: Dependabot](#setup-guide-dependabot)
- [Setup Guide: Copilot PR Review](#setup-guide-copilot-pr-review)
- [Setup Guide: Dependency Review](#setup-guide-dependency-review)
- [Enabling GitHub Security Features](#enabling-github-security-features)
- [How They Work Together](#how-they-work-together)
- [Handling Dependabot PRs](#handling-dependabot-prs)
- [Handling Copilot Review Comments](#handling-copilot-review-comments)
- [Troubleshooting](#troubleshooting)

---

## Why This Is Required

### The Problem

| Threat | Impact | Real-world Examples |
|--------|--------|---------------------|
| **Vulnerable dependencies** | Attackers exploit known CVEs in outdated packages | Log4Shell (Log4j), event-stream attack, ua-parser-js hijack |
| **Supply chain attacks** | Malicious code injected into trusted packages | Codecov breach, SolarWinds |
| **Human error in code review** | Security bugs slip through manual review | OWASP Top 10 issues in production |
| **License compliance** | Using GPL/AGPL code in proprietary projects | Legal liability |
| **Stale dependencies** | Missing security patches, compatibility drift | Breaking changes pile up over time |

### The Solution

| Tool | What It Prevents |
|------|-----------------|
| **Dependabot** | Stale/vulnerable dependencies — auto-creates PRs to update them |
| **Copilot PR Review** | Human-missed bugs — AI reviews every PR for logic errors, security issues, best practices |
| **Dependency Review** | Vulnerable imports — blocks PRs that introduce dependencies with known CVEs |

### Why Not Just Manual Review?

- **Scale**: Humans can't track every CVE across every dependency tree
- **Speed**: Dependabot creates fix PRs within hours of a CVE being published
- **Consistency**: AI review catches patterns that tired humans miss at 5 PM on a Friday
- **Shift-left**: Catching issues in PRs is 10x cheaper than catching them in production

---

## What Each Component Does

### 1. Dependabot (`dependabot.yml`)

**Purpose**: Automatically keeps dependencies up-to-date and flags known vulnerabilities.

**Two capabilities:**

| Feature | What It Does | How It Works |
|---------|-------------|--------------|
| **Version Updates** | Keeps packages current | Checks for newer versions weekly, creates PRs |
| **Security Alerts** | Flags vulnerable packages | GitHub Advisory Database triggers alerts + auto-fix PRs |

**Our configuration:**
- Monitors `github-actions` ecosystem (workflow action versions)
- Runs every Monday at 9:00 AM IST
- Groups minor/patch updates into a single PR (reduces noise)
- Labels PRs with `dependencies` for easy filtering
- npm ecosystem config is pre-written but commented out (uncomment when you add `package.json`)

### 2. Copilot PR Review (`copilot-review.yml`)

**Purpose**: AI-powered code review on every pull request.

**What Copilot reviews for:**
- Security vulnerabilities (injection, auth issues, data exposure)
- Logic errors and potential bugs
- Performance anti-patterns
- Code quality and best practices
- Missing error handling

**Our configuration:**
- Triggers on PR open, sync (new commits), and reopen
- Mode: `auto` (reviews every PR without needing `@copilot` mention)
- Posts review comments directly on the PR diff

### 3. Dependency Review (`dependency-review.yml`)

**Purpose**: Blocks PRs that introduce dependencies with known vulnerabilities.

**Our configuration:**
- Fails on `moderate` severity or higher (blocks the PR)
- Denies `GPL-3.0` and `AGPL-3.0` licenses (license compliance)
- Posts a summary comment on the PR with findings

---

## Setup Guide: Dependabot

### Step 1: Create the configuration file

```
.github/dependabot.yml
```

This file is already created in this repo. Dependabot reads it automatically — no GitHub Actions workflow needed.

### Step 2: Enable Dependabot in repo settings

1. Go to your repo on GitHub
2. Navigate to **Settings** → **Code security and analysis**
3. Enable:
   - ✅ **Dependency graph**
   - ✅ **Dependabot alerts** — get notified about vulnerable dependencies
   - ✅ **Dependabot security updates** — auto-create PRs to fix vulnerable deps
   - ✅ **Dependabot version updates** — auto-create PRs to keep deps current

### Step 3: Configure notifications

1. Go to **Settings** → **Notifications**
2. Under "Dependabot alerts", choose your notification preference:
   - Email, web, or both
   - Per-vulnerability or weekly digest

### Step 4: Customize for your ecosystem

Edit `.github/dependabot.yml` — uncomment/add ecosystems as needed:

| Ecosystem | When to Add |
|-----------|-------------|
| `npm` | When `package.json` exists |
| `pip` | When `requirements.txt` or `pyproject.toml` exists |
| `docker` | When `Dockerfile` exists |
| `github-actions` | Always (already configured) |
| `nuget` | When `.csproj` files exist |

### Key Configuration Options

```yaml
schedule:
  interval: "weekly"          # daily, weekly, monthly
  day: "monday"               # Only for weekly
  time: "09:00"               # UTC by default
  timezone: "Asia/Kolkata"    # Your timezone

groups:                        # Group related updates into one PR
  my-group:
    patterns: ["*"]
    update-types: ["minor", "patch"]

ignore:                        # Skip certain updates
  - dependency-name: "*"
    update-types: ["version-update:semver-major"]

open-pull-requests-limit: 10   # Max concurrent Dependabot PRs
```

---

## Setup Guide: Copilot PR Review

### Prerequisites

- GitHub Copilot must be enabled for the repository/organization
- Copilot Business or Enterprise plan (PR review is not available on Individual plan)

### Step 1: Create the workflow file

```
.github/workflows/copilot-review.yml
```

Already created in this repo.

### Step 2: Configure the review mode

| Mode | Behavior | Best For |
|------|----------|----------|
| `auto` | Reviews every PR automatically | Teams that want consistent coverage |
| `manual` | Only reviews when you comment `@copilot review` | Teams that want on-demand review |

### Step 3: Verify permissions

The workflow needs these permissions (already set):
```yaml
permissions:
  contents: read        # Read the code
  pull-requests: write  # Post review comments
```

### Step 4: Customize review scope (optional)

To limit which files Copilot reviews, add path filters:

```yaml
on:
  pull_request:
    paths:
      - "src/**"
      - "*.js"
      - "*.ts"
```

---

## Setup Guide: Dependency Review

### Step 1: Create the workflow file

```
.github/workflows/dependency-review.yml
```

Already created in this repo.

### Step 2: Configure severity threshold

| Severity | What It Means |
|----------|--------------|
| `critical` | Only block critical CVEs |
| `high` | Block high + critical |
| `moderate` | Block moderate + high + critical (our setting) |
| `low` | Block everything |

### Step 3: Configure license policy

```yaml
deny-licenses: "GPL-3.0, AGPL-3.0"     # Block copyleft licenses
allow-licenses: "MIT, Apache-2.0, BSD-2-Clause"  # Alternatively, allowlist
```

---

## Enabling GitHub Security Features

Beyond the files in this repo, enable these in your GitHub repo settings:

### Settings → Code security and analysis

| Feature | Toggle | Purpose |
|---------|--------|---------|
| **Dependency graph** | Enable | Maps all dependencies — required for everything else |
| **Dependabot alerts** | Enable | Notifies you about vulnerable dependencies |
| **Dependabot security updates** | Enable | Auto-creates PRs to fix vulnerabilities |
| **Dependabot version updates** | Enable | Auto-creates PRs for newer versions |
| **Code scanning** | Enable | Static analysis (CodeQL) on push/PR |
| **Secret scanning** | Enable | Detects accidentally committed secrets (API keys, tokens) |
| **Push protection** | Enable | Blocks pushes that contain secrets |

### Recommended: Enable CodeQL (optional, add later)

```yaml
# .github/workflows/codeql.yml
name: CodeQL Analysis
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 9 * * 1"  # Weekly scan

jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript
      - uses: github/codeql-action/analyze@v3
```

---

## How They Work Together

```
Developer pushes code
        │
        ▼
┌─────────────────────────────────────────────┐
│              Pull Request Created            │
└─────────────────┬───────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
┌────────┐  ┌──────────┐  ┌──────────────┐
│Copilot │  │Dependency│  │  Other CI    │
│Review  │  │ Review   │  │  (tests,     │
│        │  │          │  │   lint, etc.) │
└───┬────┘  └────┬─────┘  └──────┬───────┘
    │            │               │
    ▼            ▼               ▼
  Review     Pass/Fail       Pass/Fail
  Comments   (blocks if      (your tests)
  on diff    vuln found)
    │            │               │
    └─────────────┼──────────────┘
                  ▼
         All checks pass?
          │           │
         Yes          No
          │           │
          ▼           ▼
       ✅ Merge    ❌ Fix issues
```

**Meanwhile, independently:**

```
Every Monday at 9 AM IST
        │
        ▼
┌─────────────────────────────────────┐
│     Dependabot checks for updates   │
└──────────────┬──────────────────────┘
               │
    ┌──────────┼──────────┐
    ▼                     ▼
New versions         CVE published
available            for a dependency
    │                     │
    ▼                     ▼
Creates PR:          Creates PR:
"Bump X from         "Fix CVE-XXXX
1.2.3 to 1.2.4"     in package Y"
    │                     │
    └──────────┬──────────┘
               ▼
     PR triggers Copilot Review
     + Dependency Review
     (same workflow as above)
```

---

## Handling Dependabot PRs

### Workflow for reviewing Dependabot PRs

1. **Check the PR title** — it describes the update (e.g., "Bump actions/checkout from 4.1 to 4.2")
2. **Read the changelog** — Dependabot includes a changelog summary and commit diff
3. **Check CI status** — your tests + Copilot review should pass
4. **Merge strategy:**

| Update Type | Risk | Action |
|-------------|------|--------|
| Patch (`1.2.3` → `1.2.4`) | Low | Auto-merge or quick review |
| Minor (`1.2.0` → `1.3.0`) | Medium | Review changelog, run tests |
| Major (`1.0.0` → `2.0.0`) | High | Full review, check breaking changes |
| Security fix | Critical | Merge ASAP after CI passes |

### Enable auto-merge for low-risk updates (optional)

Add this workflow to auto-merge patch/minor Dependabot PRs:

```yaml
# .github/workflows/dependabot-auto-merge.yml
name: Auto-merge Dependabot
on: pull_request

permissions:
  contents: write
  pull-requests: write

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - uses: dependabot/fetch-metadata@v2
        id: metadata
      - if: steps.metadata.outputs.update-type == 'version-update:semver-patch' || steps.metadata.outputs.update-type == 'version-update:semver-minor'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Handling Copilot Review Comments

### Types of Copilot feedback

| Category | Example | Action |
|----------|---------|--------|
| **Security** | "This input is not sanitized" | Fix immediately |
| **Bug** | "This condition is always true" | Investigate and fix |
| **Performance** | "This runs in O(n²), consider a Set" | Fix if impactful |
| **Style** | "Consider using const instead of let" | Fix or dismiss |
| **False positive** | Copilot misunderstood the intent | Dismiss with reason |

### How to respond

- **Agree**: Fix the code, push a new commit
- **Disagree**: Dismiss the review comment with a reason
- **Discuss**: Reply to the comment to explain your reasoning

---

## Troubleshooting

### Dependabot not creating PRs

| Issue | Fix |
|-------|-----|
| No PRs appearing | Check Settings → Code security → Dependabot version updates is enabled |
| Wrong ecosystem | Verify `package-ecosystem` matches your actual package manager |
| `dependabot.yml` errors | Validate YAML syntax; check GitHub's [config docs](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file) |
| Too many PRs | Add `groups` to batch updates; lower `open-pull-requests-limit` |
| Ignoring a dependency | Add it to the `ignore` list in `dependabot.yml` |

### Copilot Review not running

| Issue | Fix |
|-------|-----|
| Workflow not triggering | Check the `on:` trigger matches your PR events |
| No review comments | Ensure Copilot is enabled for the org/repo and you have Copilot Business/Enterprise |
| Permission errors | Verify `pull-requests: write` permission is set |
| Want manual only | Change mode from `auto` to `manual`, then use `@copilot review` |

### Dependency Review blocking PRs unexpectedly

| Issue | Fix |
|-------|-----|
| Blocking on low-severity | Change `fail-on-severity` to `high` or `critical` |
| License false positive | Adjust `deny-licenses` / `allow-licenses` |
| Not running | Ensure the workflow file exists and PR events match |
