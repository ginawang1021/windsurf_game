# Windsurf Demo App

## Prerequisite

- Repository cloned
- Dependencies in requirements.txt installed

## Demo Flow created specific for Testing & Selenium

1. Rules Demo:

Pull up the repo and activate the jest-test-style.md rules to scan the formats and styles for exisitng tests.

2. Workflows Demo:

After scanning existing test styles, activate the test-coverage-analysis.md workflow to analyze the test coverage and summarize the coverage result into a table and output that to the user. The coverage result will provide information on what E2E tests are missing. Based on these E2E-related information, prompt Cascade to generate E2E tests with Selenium using this prompt: "generate a E2E test in @__tests__/e2e directory that uses Selenium. Test for mouse tracking, player cell position updates, and boundary constraints".

3. Tests generating Demo:

Cascade will start scanning and generating E2E tests with Selenium. While Cascade runs, point out this works with other types of tests too, such as unit tests and integration tests. Cascade will reduce the amount of grunt work needed and take care of coding out the tests instead of you manually coding them out one by one.

4. Selenium Demo:

After Cascade generates the tests, prompt Cascade to "run the @tests using Selenium". Cascade will ask for permission to run the terminal commands needed and execute the tests, the Selenium browser will pop out when the tests are being executed and users can see the browsers being executed automatically. After executing the tests, Cascade will analyze the test results and modify the code to pass all tests.