---
name: security-audit
description: Audit code, endpoints, dependencies, and architectures for security vulnerabilities, applying OWASP Top 10, access control (IDOR), authentication flaw detection, data sanitization, injection prevention, and security hardening. Use before committing critical features, releasing to production, or auditing existing codebases.
---

# Security Audit & Hardening

Proactively identify, report, and remediate security vulnerabilities in application code, APIs, and infrastructure configurations.

## Core Principle

**Never trust client input. Never assume internal calls are authorized.** Every endpoint, query, and data pipeline must be safe by default.

---

## The 6-Point Security Checklist

### 1. Broken Access Control & IDOR (Insecure Direct Object Reference)
* **The Risk**: A user can access, modify, or delete another user's resources simply by guessing or modifying an ID in the URL, payload, or route parameters (`/api/users/45/membership`).
* **Audit**:
  * Verify that every query for a user-owned resource enforces tenant/user ownership (`where('user_id', auth()->id())` or Laravel Policy `$this->authorize('update', $model)`).
  * Ensure roles and permissions are validated on the server, never solely in frontend state.

### 2. Injection Vulnerabilities (SQL, Command, Script)
* **The Risk**: Untrusted input concatenated directly into database queries, shell executions, or file operations.
* **Audit**:
  * **SQL**: Use Eloquent/Query Builder parameter binding exclusively. Flag raw queries (`whereRaw`, `selectRaw`) containing unsanitized string interpolations (`$var`).
  * **Shell**: Avoid `exec`, `shell_exec`, `system` with variable input. If necessary, escape with `escapeshellarg` / `escapeshellcmd`.

### 3. Cross-Site Scripting (XSS) & Content Security
* **The Risk**: Malicious JavaScript executed in another user's browser via unescaped output.
* **Audit**:
  * React escapes by default; strictly audit any use of `dangerouslySetInnerHTML`.
  * In Blade/templates, ensure double curly braces `{{ $val }}` are used instead of `{!! $val !!}` for user-supplied data.
  * Sanitize rich text inputs using an HTML purifier before storing or rendering.

### 4. Authentication, Session & Password Security
* **The Risk**: Weak hashing, credential stuffing, session hijacking, or unthrottled endpoints.
* **Audit**:
  * Enforce strong password policies (min 8-12 characters, mixed character types).
  * Rate-limit all authentication endpoints (login, register, forgot-password, 2FA verification).
  * Invalidate sessions on logout and regenerate session IDs on login.
  * Use constant-time comparison (`hash_equals`) for tokens and HMACs.

### 5. Sensitive Data Exposure & Leaks
* **The Risk**: API responses or logs exposing passwords, hashed tokens, credit card details, or internal stack traces.
* **Audit**:
  * Ensure Models use `$hidden = ['password', 'remember_token', 'secret']` or Eloquent API Resources to explicitly whitelist exposed attributes.
  * Verify that `.env`, private keys, and API secrets are never committed to version control.
  * Ensure production error handling returns generic error responses without stack traces.

### 6. CSRF & API Protection
* **The Risk**: Unauthorized actions submitted by an authenticated user via a third-party malicious site.
* **Audit**:
  * Verify CSRF tokens are enforced on all state-changing HTTP requests (POST, PUT, PATCH, DELETE).
  * For single-page apps (Inertia/SPA), ensure SameSite cookies (`SameSite=Lax` or `Strict`) and Secure flags are active.

---

## Audit Output Format

When auditing code, produce a structured vulnerability report:

1. **Vulnerability Title & Severity** (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`).
2. **Affected File & Line**: Direct link to the source code.
3. **Exploit Scenario**: How an attacker could exploit this issue.
4. **Remediation**: Exact, drop-in replacement code fix.
