# Coding Standards for iDecide

## Introduction
This document outlines the coding standards for the iDecide project. Adhering to these standards ensures consistency, readability, and maintainability of our codebase.

## Swift Style Guide
We follow the [Swift API Design Guidelines](https://swift.org/documentation/api-design-guidelines/) with some additional project-specific rules:

### Naming Conventions
- Use camelCase for variable and function names
- Use PascalCase for type names (classes, structs, enums, protocols)
- Prefix private properties with an underscore

### Formatting
- Use 4 spaces for indentation
- Limit line length to 120 characters
- Add a single blank line between methods

### Comments
- Use `///` for documentation comments
- Write comments in complete sentences
- Update comments when you change the code

### SwiftUI Specific
- Prefer `@State` and `@Binding` over `@ObservedObject` when possible
- Extract complex view logic into separate functions
- Use view modifiers instead of inline adjustments

## File Organization
- One primary class or struct per file
- Group related small structs or enums in a single file
- Use // MARK: - to separate sections within a file

## Dependencies
- Minimize external dependencies
- Document usage and reason for each dependency

## Error Handling
- Use `Result` type for complex error handling
- Provide meaningful error messages

## Testing
- Write unit tests for all non-UI code
- Aim for at least 80% code coverage

## Version Control
- Write clear, concise commit messages
- Create a new branch for each feature or bug fix

Remember, these standards are guidelines. Use your best judgment and prioritize readability and maintainability.
