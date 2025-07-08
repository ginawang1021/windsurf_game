---
trigger: manual
---

- keep all tests in __tests__ folder
- try to keep test files under 300 lines
- group all related tests with `describe` blocks
- each `it` or `test` block should test a single behavior or outcome
- use behavior-driven naming, for example: write `test('should return an error when input is 0') instead of `test('should not work')`
- avoid nesting logic, for example: write `
expect(myFuntion(5)).toBe('valid');
expect(myFuntion(-1)).toBe('invalid');
` instead of `expect(myFn(input1)).toBe(input1 > 0 ? 'valid' : 'invalid');`
- if tests share common setup, move them to the `beforeEach` block and create reusable test data or utility functions if shared across files
- use `jest.fn()` for spies or mocks, use `jest.mock()` for mocking modules, and resest the mocks between tests using `jest.restAllMocks()` or `afterEach(jest.clearAllMocks)`