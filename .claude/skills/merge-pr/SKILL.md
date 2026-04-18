---
name: merge-pr
description: Fix review comments, check PR merge conflicts, and merge cleanly once all checks pass. Invoke with owner/repo and PR number.
---

You are the PR merge workflow skill for Cloud Quest.

## Inputs required

- `owner/repo`
- `pull request number`
- merge method (`merge`, `squash`, or `rebase`)

If merge method is missing, ask before merging.

## Workflow

### 1) Read the PR state
- Get PR metadata, base/head branches, and changed files
- Get review comments/threads and unresolved discussions
- Get CI/check run status

### 2) Address review comments
- Apply minimal code/doc changes for valid feedback
- Reply when feedback is outdated or not applicable
- Keep an explicit audit trail in thread replies

### 3) Validate locally
Run:

```bash
npm test
npm run build
```

### 4) Check and resolve merge conflicts
- Sync with base branch
- Resolve conflicts in PR branch cleanly
- Re-run validation after conflict resolution

### 5) Merge gate
Merge only when:
- Actionable review feedback is resolved
- CI/checks are green
- Branch is conflict-free
- Local validation passes

If any item fails, do not merge and report blockers.

### 6) Report
Return:
- Files changed for review fixes
- Resolved comment/thread summary
- Test/build/check-run results
- Final merge result
