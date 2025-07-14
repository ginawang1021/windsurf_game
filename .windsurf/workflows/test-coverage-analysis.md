---
description: Workflow for checking unit test and e2e test coverage
---

# Information

- This repository uses Jest with a jsdom environment for unit test, and uses Selenium for E2E tests
- The test files are located in static/js/__tests__/

# Unit Test Coverage

## Step 1: Double check if the information above is correct and the requirements are installed

## Step 2: If information is correct, check for test coverage by running `npm test -- --coverage --verbose` and summarize the coverage result into a table and output that to the user. If the information has changed, inform the user and list out the most updated information.

## Step 3: Use the test coverage information, pick one file that has the lowest test coverage rate and analyze what functions or parts of the code are not covered yet.

## Step 4: Summarize your findings and output the summary along with a few recommendations

# E2E Test Coverage

Go through files in the static/js/__tests__/e2e directory and analyze what they are testing on. For each file, output the critical user path it covers and test coverage.

For example, for game_initialization_test.py:
Critical Path: Mouse movement -> Player cell follows cursor -> Smooth movement within world boundaries
Test Coverage: Mouse tracking, player cell position updates, boundary constraints

