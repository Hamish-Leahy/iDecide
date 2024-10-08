# Testing Guide for iDecide

## Introduction
This guide outlines our testing strategy and practices for the iDecide project.

## Types of Tests

### Unit Tests
- Test individual components in isolation
- Located in the iDecideTests target
- Use XCTest framework

### UI Tests
- Test user interactions and UI flows
- Located in the iDecideUITests target
- Use XCUITest framework

### Integration Tests
- Test interactions between components
- Included in the iDecideTests target, marked with "Integration" in the name

## Writing Tests

### Best Practices
1. Follow the Arrange-Act-Assert pattern
2. Keep tests small and focused
3. Use descriptive test names
4. Avoid testing private methods directly

### Naming Convention
- Name tests with format: `test_[MethodName]_[Scenario]_[ExpectedResult]`
- Example: `test_signUp_withValidCredentials_shouldCreateUser`

### Mocking
- Use protocols for easier mocking
- Consider using a mocking framework like [Mockingbird](https://github.com/birdrides/mockingbird) for complex scenarios

## Test Coverage
- Aim for at least 80% code coverage
- Use Xcode's built-in code coverage tools
- Focus on critical paths and edge cases

## Continuous Integration
- All tests run on every pull request
- PRs cannot be merged if tests fail

## Performance Testing
- Use Xcode's Time Profiler for performance bottlenecks
- Write performance tests for critical operations

## Accessibility Testing
- Include accessibility tests in UI test suite
- Use Xcode's Accessibility Inspector

## Test Data
- Use factories or fixtures for generating test data
- Avoid using production data in tests

## Running Tests
- Run tests locally before pushing changes
- Use `CMD + U` in Xcode to run all tests

Remember, testing is a crucial part of our development process. If you're unsure about how to test a particular component, don't hesitate to ask for help.
