---
name: verification-loop
description: A comprehensive verification system for code quality. Run after completing features, before PRs, or when you want to ensure quality gates pass.
metadata:
  origin: ECC
---

# Verification Loop Skill

A comprehensive verification system for code quality.

## When to Use

- After completing a feature or significant code change
- Before creating a PR
- After refactoring
- When you want to ensure quality gates pass

## Verification Phases

### Phase 1: Build Verification
```bash
npm run build 2>&1 | tail -20
```

If build fails, STOP and fix before continuing.

### Phase 2: Type Check
```bash
npx tsc --noEmit 2>&1 | head -30
```

### Phase 3: Lint Check
```bash
npm run lint 2>&1 | head -30
```

### Phase 4: Test Suite
```bash
npm test -- --coverage 2>&1 | tail -50
```

Report:
- Total tests: X
- Passed: X
- Failed: X
- Coverage: X%

### Phase 5: Security Scan
```bash
# Check for hardcoded secrets
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "sk-\|api_key\|secret\|password" 2>/dev/null | head -10

# Check for console.log in production code
grep -rn "console.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10
```

### Phase 6: Diff Review
```bash
git diff --stat
```

Review each changed file for:
- Unintended changes
- Missing error handling
- Potential edge cases

## Output Format

```
VERIFICATION REPORT
==================

Build:     [PASS/FAIL]
Types:     [PASS/FAIL] (X errors)
Lint:      [PASS/FAIL] (X warnings)
Tests:     [PASS/FAIL] (X/Y passed, Z% coverage)
Security:  [PASS/FAIL] (X issues)
Diff:      [X files changed]

Overall:   [READY/NOT READY] for PR

Issues to Fix:
1. ...
```

---

**Remember**: Verification is the gatekeeper of production quality.
