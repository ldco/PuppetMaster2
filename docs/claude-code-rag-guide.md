# Claude Code RAG System - Complete User Guide

This comprehensive guide explains how to use the Claude Code RAG (Retrieval-Augmented Generation) system configured for PuppetMaster2.

## Overview

The RAG system consists of:

1. **CLAUDE.md** - Core rules and project knowledge (auto-loaded)
2. **Custom Slash Commands** - Reusable prompts for workflows
3. **Knowledge Base** - Deep documentation on all features
4. **Hooks & Permissions** - Automation and safety controls

---

## Quick Reference

### Slash Commands

| Command                         | Description                            |
| ------------------------------- | -------------------------------------- |
| `/project:review [file]`        | Senior-level code review               |
| `/project:component [desc]`     | Create component following PM patterns |
| `/project:debug [issue]`        | Debug with extended thinking           |
| `/project:test [feature]`       | Write tests for a feature              |
| `/project:prp [feature]`        | Create Product Requirements Prompt     |
| `/project:refactor [code]`      | Refactor with best practices           |
| `/project:ultrathink [problem]` | Maximum reasoning (32K tokens)         |

### Extended Thinking Triggers

| Trigger        | Depth   | Tokens |
| -------------- | ------- | ------ |
| `think`        | Light   | ~4K    |
| `think hard`   | Medium  | ~10K   |
| `think harder` | Heavy   | ~20K   |
| `ultrathink`   | Maximum | ~32K   |

---

## Knowledge Base Topics

The `.claude/knowledge/` directory contains deep documentation on:

| File                            | Topic                             |
| ------------------------------- | --------------------------------- |
| `01-global-rules-strategies.md` | CLAUDE.md best practices          |
| `02-prompting-strategies.md`    | Context engineering & prompting   |
| `03-permissions-autonomous.md`  | Permissions & YOLO mode           |
| `04-slash-commands.md`          | Custom command creation           |
| `05-mcp-servers.md`             | MCP server configuration          |
| `06-archon-framework.md`        | Archon multi-agent patterns       |
| `07-prp-framework.md`           | Product Requirements Prompts      |
| `08-subagents.md`               | Task tool & parallel work         |
| `09-hooks.md`                   | PreToolUse/PostToolUse automation |
| `10-github-automations.md`      | GitHub CLI integration            |
| `11-yolo-devcontainers.md`      | Safe sandboxed execution          |
| `12-parallel-coding-agents.md`  | Git worktrees for parallelism     |

---

## Key Concepts Summary

### 1. CLAUDE.md Strategy

- Start with guardrails, not a manual
- Add rules when Claude makes mistakes
- Keep concise, update iteratively

### 2. Permissions

```json
// .claude/settings.json
{
  "permissions": {
    "allow": ["Bash(npm run *)", "Write(*.test.ts)"],
    "deny": ["Bash(rm -rf *)", "Write(*.env*)"]
  }
}
```

### 3. MCP Servers

```json
// .mcp.json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"]
    }
  }
}
```

### 4. Hooks

```json
// .claude/settings.json
{
  "hooks": {
    "postToolUse": [
      {
        "tool": "Write",
        "pattern": "*.ts",
        "command": "npx prettier --write $FILE"
      }
    ]
  }
}
```

### 5. Subagents

Ask Claude: "Use the Task tool to analyze these files in parallel"

- Subagents can READ but not WRITE
- Good for parallel analysis and research

### 6. Parallel Coding (Git Worktrees)

```bash
git worktree add ../project-feature-a feature-a
code ../project-feature-a  # Open separate Claude session
```

---

## File Structure

```
app/
├── CLAUDE.md                         # Main rules (auto-loaded)
├── .claude/
│   ├── commands/                     # Slash commands
│   │   ├── review.md
│   │   ├── component.md
│   │   ├── debug.md
│   │   ├── test.md
│   │   ├── prp.md
│   │   ├── refactor.md
│   │   └── ultrathink.md
│   ├── knowledge/                    # Deep documentation
│   │   ├── 01-global-rules-strategies.md
│   │   ├── 02-prompting-strategies.md
│   │   ├── 03-permissions-autonomous.md
│   │   ├── 04-slash-commands.md
│   │   ├── 05-mcp-servers.md
│   │   ├── 06-archon-framework.md
│   │   ├── 07-prp-framework.md
│   │   ├── 08-subagents.md
│   │   ├── 09-hooks.md
│   │   ├── 10-github-automations.md
│   │   ├── 11-yolo-devcontainers.md
│   │   └── 12-parallel-coding-agents.md
│   └── settings.json                 # Hooks & permissions (optional)
└── docs/
    └── claude-code-rag-guide.md      # This guide
```

---

## Tips for Best Results

1. **Use slash commands** - They include optimal context
2. **Trigger thinking** - Use `think hard` for complex problems
3. **Read knowledge files** - Deep dive when needed
4. **Run tests** - Always verify changes
5. **Review diffs** - Check `git diff` before committing
6. **Use subagents** - For parallel analysis tasks
7. **Try worktrees** - For independent parallel features
