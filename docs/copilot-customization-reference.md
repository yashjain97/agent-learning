# Copilot Customization Reference Guide

## Overview

GitHub Copilot in VS Code can be customized using several file-based primitives. Each serves a different purpose — from always-on project rules to on-demand workflow packages.

---

## 1. Workspace Instructions (Always-On, Project-Wide)

These files apply automatically to **every** chat request in your workspace.

### Option A: `copilot-instructions.md`

| Property | Value |
|----------|-------|
| **Location** | `.github/copilot-instructions.md` |
| **Scope** | Entire project |
| **Best for** | Single projects, cross-editor compatibility |

```markdown
# Project Guidelines

## Code Style
- Use TypeScript strict mode
- Prefer functional components with hooks

## Build and Test
- Run `npm test` before committing
- Use vitest for unit tests
```

### Option B: `AGENTS.md`

| Property | Value |
|----------|-------|
| **Location** | Root or subfolders |
| **Scope** | Directory tree (closest file wins) |
| **Best for** | Monorepos with different rules per folder |

**Hierarchy example:**
```
/AGENTS.md              ← Root defaults
/frontend/AGENTS.md     ← Frontend-specific (overrides root)
/backend/AGENTS.md      ← Backend-specific (overrides root)
```

> **Important:** Use only ONE of these — never both `copilot-instructions.md` and `AGENTS.md`.

---

## 2. File-Specific Instructions (`.instructions.md`)

Guidelines loaded **on-demand** when relevant, or **explicitly** when files match a pattern.

| Property | Value |
|----------|-------|
| **Location** | `.github/instructions/*.instructions.md` |
| **User-level** | `<profile>/instructions/*.instructions.md` |

### Frontmatter

```yaml
---
description: "Use when writing database migrations, schema changes, or data transformations."
applyTo: "**/*.sql"
---
```

### Discovery Modes

| Mode | Trigger | Use Case |
|------|---------|----------|
| **On-demand** (`description`) | Agent detects task relevance via keywords | Task-based: migrations, refactoring, API work |
| **Explicit** (`applyTo`) | Files matching glob are in context | File-based: language standards, framework rules |
| **Manual** | `Add Context` → `Instructions` | Ad-hoc attachment |

### Example

```markdown
---
description: "Use when writing database migrations, schema changes, or data transformations."
applyTo: "**/*.sql"
---
# Migration Guidelines

- Always create reversible migrations
- Test rollback before merging
- Never drop columns in the same release as code removal
```

### Best Practices
- **Keyword-rich descriptions** — include trigger words for on-demand discovery
- **One concern per file** — separate files for testing, styling, documentation
- **Concise and actionable** — keep instructions focused
- **Show, don't tell** — brief code examples over lengthy prose

### Anti-Patterns
- Vague descriptions like "Helpful coding tips"
- Using `applyTo: "**"` when content only applies to specific files (burns context)
- Mixing concerns: testing + API design + styling in one file

---

## 3. Custom Agents (`.agent.md`)

Custom personas with **specific tools, instructions, and behaviors**. Use for orchestrated workflows with role-based tool restrictions.

| Property | Value |
|----------|-------|
| **Location** | `.github/agents/*.agent.md` |
| **User-level** | `<profile>/agents/*.agent.md` |

### Frontmatter

```yaml
---
description: "Use when reviewing PRs for security vulnerabilities."
name: "Security Reviewer"
tools: [read, search]
model: "Claude Sonnet 4"
user-invocable: true
---
```

### Tool Aliases

| Alias | Purpose |
|-------|---------|
| `execute` | Run shell commands |
| `read` | Read file contents |
| `edit` | Edit files |
| `search` | Search files or text |
| `agent` | Invoke other agents as subagents |
| `web` | Fetch URLs and web search |
| `todo` | Manage task lists |

### Tool Access Patterns

| Pattern | Tools | Use Case |
|---------|-------|----------|
| Read-only research | `[read, search]` | Code review, analysis |
| Edit without terminal | `[read, edit, search]` | Safe file modifications |
| Terminal only | `[execute]` | DevOps, build tasks |
| MCP server | `[myserver/*]` | External API integration |
| Conversational | `[]` | Chat-only, no tool access |

### Invocation Modes

| Setting | Default | Effect |
|---------|---------|--------|
| `user-invocable: true` | Yes | Appears in agent picker for manual selection |
| `user-invocable: false` | — | Hidden — only accessible as a subagent |
| `disable-model-invocation: true` | — | Cannot be auto-invoked by parent agents |

### Agent Modes Diagram

```mermaid
flowchart TD
    subgraph TOOL_MODES["🔧 Agent Tool Access Modes"]
        direction TB
        T1["🔍 Read-Only\ntools: read, search"]
        T2["✏️ Edit No Terminal\ntools: read, edit, search"]
        T3["⚙️ Terminal Only\ntools: execute"]
        T4["🌐 MCP Server\ntools: myserver/*"]
        T5["💬 Conversational\ntools: empty"]
        T6["🛠️ Full Access\ntools: omitted = defaults"]
    end

    subgraph INVOKE_MODES["📡 Agent Invocation Modes"]
        direction TB
        I1["👤 User-Invocable\nuser-invocable: true\nAppears in agent picker"]
        I2["🔒 Subagent Only\nuser-invocable: false\nHidden from picker"]
        I3["🚫 No Auto-Invoke\ndisable-model-invocation: true\nManual slash command only"]
        I4["🔐 Fully Restricted\nBoth set\nNo picker, no auto-load"]
    end

    subgraph DISCOVERY["🔎 Instructions Discovery Modes"]
        direction TB
        D1["🎯 On-Demand\ndescription keywords\nAgent detects relevance"]
        D2["📁 Explicit\napplyTo glob pattern\nFile-type matching"]
        D3["🖱️ Manual\nAdd Context - Instructions\nUser attaches manually"]
    end

    subgraph SKILL_LOADING["⚡ Skill Progressive Loading"]
        direction LR
        S1["1️⃣ Discovery\n~100 tokens\nname + description"] --> S2["2️⃣ Instructions\nlt 5000 tokens\nSKILL.md body"] --> S3["3️⃣ Resources\nAs needed\nscripts, references"]
    end

    style TOOL_MODES fill:#1e293b,color:#e2e8f0,stroke:#475569
    style INVOKE_MODES fill:#1e293b,color:#e2e8f0,stroke:#475569
    style DISCOVERY fill:#1e293b,color:#e2e8f0,stroke:#475569
    style SKILL_LOADING fill:#1e293b,color:#e2e8f0,stroke:#475569
    style T1 fill:#3b82f6,color:#fff,stroke:#2563eb
    style T2 fill:#f59e0b,color:#000,stroke:#d97706
    style T3 fill:#ef4444,color:#fff,stroke:#dc2626
    style T4 fill:#8b5cf6,color:#fff,stroke:#7c3aed
    style T5 fill:#94a3b8,color:#fff,stroke:#64748b
    style T6 fill:#22c55e,color:#fff,stroke:#16a34a
    style I1 fill:#22c55e,color:#fff,stroke:#16a34a
    style I2 fill:#f59e0b,color:#000,stroke:#d97706
    style I3 fill:#ef4444,color:#fff,stroke:#dc2626
    style I4 fill:#64748b,color:#fff,stroke:#475569
    style D1 fill:#6366f1,color:#fff,stroke:#4f46e5
    style D2 fill:#f472b6,color:#fff,stroke:#ec4899
    style D3 fill:#94a3b8,color:#fff,stroke:#64748b
    style S1 fill:#3b82f6,color:#fff,stroke:#2563eb
    style S2 fill:#f59e0b,color:#000,stroke:#d97706
    style S3 fill:#22c55e,color:#fff,stroke:#16a34a
```

### Example

```markdown
---
description: "Use when reviewing code for security vulnerabilities, OWASP issues, or auth bugs."
tools: [read, search]
user-invocable: true
---
You are a security specialist. Review code for vulnerabilities.

## Constraints
- DO NOT modify any files
- DO NOT run any commands
- ONLY report findings with severity ratings

## Approach
1. Search for auth, input handling, and data access patterns
2. Check against OWASP Top 10
3. Report findings with file locations and fix suggestions

## Output Format
| Severity | File | Line | Issue | Fix |
```

### Anti-Patterns
- **Swiss-army agents** — too many tools, tries to do everything
- **Vague descriptions** — "A helpful agent" doesn't guide delegation
- **Role confusion** — description doesn't match body persona
- **Circular handoffs** — A → B → A without progress

---

## 4. Prompts (`.prompt.md`)

Single focused tasks with parameterized inputs. Appear as **slash commands** in chat.

| Property | Value |
|----------|-------|
| **Location** | `.github/prompts/*.prompt.md` |
| **User-level** | `<profile>/prompts/*.prompt.md` |
| **Invocation** | Type `/prompt-name` in chat |

### Example

```markdown
---
description: "Generate a React component with tests"
---
Create a React component called ${{name}} with:
- TypeScript props interface
- Unit test file using vitest
- Storybook story
```

---

## 5. Skills (`SKILL.md`)

On-demand **workflow packages** with bundled assets (scripts, templates, reference docs).

| Property | Value |
|----------|-------|
| **Location** | `.github/skills/<name>/SKILL.md` |
| **Personal** | `~/.copilot/skills/<name>/SKILL.md` |
| **Invocation** | Type `/skill-name` in chat, or auto-loaded by agent |

### Folder Structure

```
.github/skills/webapp-testing/
├── SKILL.md           # Instructions (required, name must match folder)
├── scripts/           # Executable code
├── references/        # Docs loaded as needed
└── assets/            # Templates, boilerplate
```

### Frontmatter

```yaml
---
name: webapp-testing
description: 'Test web applications using Playwright. Use for verifying frontend, debugging UI.'
argument-hint: 'Describe what to test'
---
```

### Progressive Loading (Efficient Context)

| Stage | Tokens | What Loads |
|-------|--------|------------|
| 1. Discovery | ~100 | `name` + `description` only |
| 2. Instructions | <5000 | `SKILL.md` body |
| 3. Resources | As needed | Referenced files (`./scripts/`, `./references/`) |

### Visibility Control

| Configuration | Slash command? | Auto-loaded? |
|---|---|---|
| Default (both omitted) | Yes | Yes |
| `user-invocable: false` | No | Yes |
| `disable-model-invocation: true` | Yes | No |
| Both set | No | No |

### Why Use Skills Over Instructions?

| Problem | Instructions | Skills |
|---------|-------------|--------|
| Always loaded? | Yes (wastes context if irrelevant) | No — on-demand only |
| Has scripts/templates? | No | Yes — bundled assets |
| Multi-step procedure? | Awkward | Natural — step-by-step |
| Slash command? | No | Yes — `/skill-name` |

---

## 6. Hooks (`.github/hooks/`)

**Deterministic** shell commands at agent lifecycle points. Unlike instructions (which *guide*), hooks *enforce*.

| Event | When | Use Case |
|-------|------|----------|
| `PreToolUse` | Before a tool runs | Block operations, require approval |
| `PostToolUse` | After a tool runs | Auto-format, validate output |

---

## Decision Flowchart

Use this to pick the right primitive:

```mermaid
flowchart TD
    START(["🤔 What do you need?"])
    START --> Q1{"Applies to EVERY\ntask in the project?"}
    
    Q1 -- Yes --> Q1a{"Monorepo with\ndifferent rules\nper folder?"}
    Q1a -- Yes --> AGENTS["📄 AGENTS.md\n(Root + subfolders)"]
    Q1a -- No --> COPILOT["📄 copilot-instructions.md\n(.github/)"]
    
    Q1 -- No --> Q2{"Applies to specific\nfiles or tasks?"}
    
    Q2 -- "Specific file types" --> INSTR_FILE["📋 .instructions.md\nwith applyTo glob\n(.github/instructions/)"]
    Q2 -- "Specific tasks" --> INSTR_TASK["📋 .instructions.md\nwith description keywords\n(.github/instructions/)"]
    
    Q2 -- No --> Q3{"Repeatable workflow\nwith scripts/templates?"}
    
    Q3 -- Yes --> SKILL["⚡ SKILL.md\n(.github/skills/name/)"]
    Q3 -- No --> Q4{"Single focused task\nwith inputs?"}
    
    Q4 -- Yes --> PROMPT["💬 .prompt.md\n(.github/prompts/)"]
    Q4 -- No --> Q5{"Needs tool restrictions\nor role isolation?"}
    
    Q5 -- Yes --> AGENT["🤖 .agent.md\n(.github/agents/)"]
    Q5 -- No --> Q6{"Must enforce behavior\ndeterministically?"}
    
    Q6 -- Yes --> HOOK["🔒 Hook .json\n(.github/hooks/)"]
    Q6 -- No --> START

    style START fill:#6366f1,color:#fff,stroke:#4f46e5
    style COPILOT fill:#3b82f6,color:#fff,stroke:#2563eb
    style AGENTS fill:#3b82f6,color:#fff,stroke:#2563eb
    style INSTR_FILE fill:#f59e0b,color:#000,stroke:#d97706
    style INSTR_TASK fill:#f59e0b,color:#000,stroke:#d97706
    style SKILL fill:#22c55e,color:#fff,stroke:#16a34a
    style PROMPT fill:#a78bfa,color:#fff,stroke:#8b5cf6
    style AGENT fill:#f472b6,color:#fff,stroke:#ec4899
    style HOOK fill:#ef4444,color:#fff,stroke:#dc2626
```

### Reference Table

| Question | Answer → Primitive |
|----------|--------------------|
| Applies to *every* task in the project? | **Workspace Instructions** (`copilot-instructions.md` / `AGENTS.md`) |
| Applies to specific file types? | **File Instructions** (`.instructions.md` with `applyTo`) |
| Applies to specific tasks on-demand? | **File Instructions** (`.instructions.md` with `description`) |
| Repeatable workflow with scripts/templates? | **Skill** (`SKILL.md`) |
| Single focused task with inputs? | **Prompt** (`.prompt.md`) |
| Needs tool restrictions or role isolation? | **Custom Agent** (`.agent.md`) |
| Must enforce behavior deterministically? | **Hook** (`.github/hooks/`) |

---

## Quick Summary

| File | Where | Purpose |
|------|-------|---------|
| `copilot-instructions.md` | `.github/` | Always-on project rules |
| `AGENTS.md` | Root/subfolders | Monorepo project rules |
| `*.instructions.md` | `.github/instructions/` | Per-file or per-task rules |
| `*.agent.md` | `.github/agents/` | Custom agent personas with tool restrictions |
| `*.prompt.md` | `.github/prompts/` | Single-task slash commands |
| `SKILL.md` | `.github/skills/<name>/` | On-demand workflows with bundled assets |
| `*.json` | `.github/hooks/` | Deterministic lifecycle enforcement |

---

## Agent Coding Workflow (Step-by-Step)

When you ask the agent to code, it follows this pipeline:

```mermaid
flowchart LR
    subgraph PIPELINE["🤖 Agent Coding Workflow"]
        direction LR
        A["1️⃣ UNDERSTAND\nParse request\nLoad instructions/skills"] --> B["2️⃣ GATHER\nSearch files\nRead code\nExplore structure"]
        B --> C["3️⃣ PLAN\nBreak into steps\nCreate todo list"]
        C --> D["4️⃣ IMPLEMENT\nRead - Edit - Create\nRun commands"]
        D --> E["5️⃣ VALIDATE\nCheck errors\nRun tests"]
        E --> F["6️⃣ REPORT\nConfirm changes\nSummarize"]
    end

    subgraph IMPL_DETAIL["Implementation Loop"]
        direction TB
        D1["📖 Read target files"] --> D2["✏️ Edit / Create files"]
        D2 --> D3["⚙️ Run terminal commands"]
        D3 --> D4["🔍 Check for errors"]
        D4 -- "Errors found" --> D2
        D4 -- "Clean" --> D5["✅ Mark step done"]
    end

    D --> IMPL_DETAIL

    style PIPELINE fill:#0f172a,color:#e2e8f0,stroke:#334155
    style IMPL_DETAIL fill:#1e293b,color:#e2e8f0,stroke:#475569
    style A fill:#6366f1,color:#fff,stroke:#4f46e5
    style B fill:#3b82f6,color:#fff,stroke:#2563eb
    style C fill:#f59e0b,color:#000,stroke:#d97706
    style D fill:#22c55e,color:#fff,stroke:#16a34a
    style E fill:#ef4444,color:#fff,stroke:#dc2626
    style F fill:#8b5cf6,color:#fff,stroke:#7c3aed
    style D1 fill:#3b82f6,color:#fff,stroke:#2563eb
    style D2 fill:#f59e0b,color:#000,stroke:#d97706
    style D3 fill:#ef4444,color:#fff,stroke:#dc2626
    style D4 fill:#f472b6,color:#fff,stroke:#ec4899
    style D5 fill:#22c55e,color:#fff,stroke:#16a34a
```

### Text Summary

```
1. UNDERSTAND    → Parse request, load relevant instructions/skills
2. GATHER        → Search files, read code, explore workspace
3. PLAN          → Break task into steps (todo list for complex tasks)
4. IMPLEMENT     → Read → Edit/Create → Run commands per step
5. VALIDATE      → Check for errors, run tests
6. REPORT        → Confirm what was done
```
