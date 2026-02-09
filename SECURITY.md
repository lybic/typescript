# Security Best Practices

This document outlines security best practices for the Lybic TypeScript project.

## Handling Sensitive Information

### Environment Variables

**✅ DO:**
- Store all API keys, tokens, and secrets in environment variables
- Use `.env.local` for local development (this file is gitignored)
- Reference example: `packages/playground/.env.example`
- Use environment variables: `import.meta.env.VITE_*` for Vite projects

**❌ DON'T:**
- Never hardcode API keys, tokens, or passwords in source code
- Never commit `.env` files containing real secrets
- Never commit certificate files (.pem, .key, .p12, etc.)
- Never log sensitive information to console or files

### API Keys and Tokens

**✅ DO:**
- Pass secrets as function parameters or configuration objects
- Store session tokens only in memory (like sessionStore)
- Use proper authentication headers (Authorization, X-Api-Key, etc.)
- Rotate keys regularly
- Use different keys for development and production

**❌ DON'T:**
- Don't embed keys in URLs or query parameters
- Don't store keys in localStorage (use sessionStorage if needed)
- Don't share keys across different services
- Don't use the same key for multiple environments

### Git Hygiene

**✅ DO:**
- Review changes before committing (`git diff`)
- Use `.gitignore` to exclude sensitive files
- Keep git history clean
- Use git hooks to prevent accidental commits (optional)

**❌ DON'T:**
- Don't commit and then remove secrets (they remain in history)
- Don't commit debug code with temporary credentials
- Don't commit local configuration files

### Code Review

**✅ DO:**
- Review all code changes for potential security issues
- Check for accidentally committed secrets
- Verify environment variable usage
- Test with mock/example credentials

**❌ DON'T:**
- Don't approve PRs without reviewing security implications
- Don't skip security checks for "small" changes
- Don't assume previous reviews caught everything

## Tools and Automation

### GitHub Features

1. **Secret Scanning**
   - GitHub automatically scans for known secret patterns
   - Enable in repository settings: Settings → Security → Secret scanning

2. **Dependabot**
   - Already configured in `.github/dependabot.yml`
   - Automatically creates PRs for dependency updates
   - Includes security updates

### Pre-commit Hooks (Recommended)

Consider adding these tools:

1. **detect-secrets**
   ```bash
   pip install detect-secrets
   detect-secrets scan --baseline .secrets.baseline
   ```

2. **git-secrets**
   ```bash
   git secrets --install
   git secrets --register-aws
   ```

### Regular Audits

1. **NPM/Yarn Audit**
   ```bash
   yarn audit
   # or
   npm audit
   ```

2. **Manual Review**
   - Perform security audits periodically
   - Review access logs and API usage
   - Check for suspicious activities

## Common Patterns to Avoid

### ❌ Hardcoded Credentials
```typescript
// BAD - Never do this
const apiKey = "sk-1234567890abcdef"
const token = "github_pat_XXXXX"
```

### ✅ Environment Variables
```typescript
// GOOD - Use environment variables
const apiKey = import.meta.env.VITE_API_KEY
const token = process.env.GITHUB_TOKEN
```

### ❌ Committed .env File
```bash
# BAD - This exposes secrets
git add .env
git commit -m "add config"
```

### ✅ Template File
```bash
# GOOD - Commit template, not actual secrets
git add .env.example
git commit -m "add config template"
```

### ❌ Logging Secrets
```typescript
// BAD - Logs may be exposed
console.log("API Key:", apiKey)
logger.info({ token: authToken })
```

### ✅ Safe Logging
```typescript
// GOOD - Log safely
console.log("API Key:", apiKey ? "***" : "not set")
logger.info({ hasToken: !!authToken })
```

## Incident Response

If a secret is accidentally committed:

1. **Immediately Rotate the Secret**
   - Generate a new key/token
   - Update it in all environments
   - Revoke the old one

2. **Remove from Git History** (if recent)
   ```bash
   # For the last commit
   git reset HEAD~1
   # Make corrections
   git commit --amend
   ```

3. **If Pushed to Remote**
   - Assume the secret is compromised
   - Rotate immediately
   - Consider using tools like `git-filter-repo` to clean history
   - **Note:** Cleaning history requires force push and coordination with team

4. **Report and Document**
   - Notify security team
   - Document the incident
   - Update security practices

## Resources

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [12-Factor App: Config](https://12factor.net/config)
- [Git Secrets Repository](https://github.com/awslabs/git-secrets)

## Questions?

If you have questions about security practices or notice a security issue:
1. Do not create a public issue
2. Contact the security team directly
3. Follow responsible disclosure practices

---

Last updated: 2026-02-09
