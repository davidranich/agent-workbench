# Security Policy

## Supported Versions

We are currently supporting the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Agent Workbench seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisories** (Preferred)
   - Go to the [Security tab](https://github.com/davidranich/agent-workbench/security) of this repository
   - Click "Report a vulnerability"
   - Fill out the form with details about the vulnerability

2. **Email**
   - Send an email to the repository maintainer through GitHub
   - Include "SECURITY" in the subject line
   - Provide as much information as possible about the vulnerability

### What to Include in Your Report

Please include the following information:

- Type of vulnerability (e.g., XSS, remote code execution, etc.)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
- **Investigation**: We will investigate and validate the issue within 7 days
- **Updates**: We will keep you informed of our progress
- **Resolution**: Once fixed, we will notify you and may request your assistance in verifying the fix
- **Disclosure**: We will coordinate with you regarding public disclosure timing

## Security Considerations

### Electron Security

This application is built with Electron and implements the following security best practices:

- Context isolation is enabled
- Node integration is disabled in renderer processes
- Remote module is disabled
- Sandbox mode is enabled
- Content Security Policy (CSP) is configured
- All IPC handlers are validated

### File System Access

This application has access to your local file system for managing agent files. Please be aware:

- The application only accesses directories you explicitly select
- File operations are limited to the selected directory
- No files are uploaded or transmitted to external servers
- All data remains local on your machine

### Data Privacy

- Agent Workbench does not collect or transmit any personal data
- All your agent files and configurations remain on your local machine
- No telemetry or analytics are collected
- No third-party services are used

### Dependencies

We regularly monitor our dependencies for known vulnerabilities using:

- `npm audit` for dependency scanning
- GitHub Dependabot alerts
- Manual security reviews

If you notice any dependency vulnerabilities, please report them following the process above.

## Security Updates

Security updates will be released as patch versions (e.g., 1.0.1, 1.0.2) and announced via:

- GitHub Releases
- Security Advisories (for critical issues)

We recommend keeping your installation up to date to receive the latest security patches.

## Attribution

We appreciate the security research community and will acknowledge your contribution if you wish (or you may remain anonymous).

## Questions

If you have questions about this security policy, please open a GitHub issue with the "question" label (for non-security-sensitive questions only).

Thank you for helping keep Agent Workbench and our users safe!
