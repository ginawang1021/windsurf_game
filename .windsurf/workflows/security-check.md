---
description: Scans several different aspects of the project to determine security vulnerabilities, generates a final summary and proposes solutions.
---

# Security Scan Workflow Steps for This Project

*Do not propose to fix any vulnerabilities halfway through the scan. List and summarize all vulnerabilities in the final step and then propose solutions.*

## Step 1: Run Dependency Vulnerabiltiy Scan and Analyze Report
- run `npm audit --json > npm-vulnerability-report.json` to scan for vulnerabilities and generate a report
- analyze the generated report and see check for identified vulnerabilities

## Step 2: Scan for Hardcoded Secrets
- use the grep command to search for common patterns of hardcoded secrets like API keys in `static/js/`
- search for keywords like `key`, `secret`, `token`, and `password`

## Step 3: Static Code Analysis for Security Bugs
- install ESLint v8 and the compatible security plugin as development dependencies if not installed in the environment
- create `.eslintrc.json` with your suggested configurations for other aspects of the file
- run `npx eslint static/js/` to scan

## Step 4: Summarize your findings from the three steps above and report to the user in the conversation
