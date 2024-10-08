# Debugging Guide for iDecide

## Introduction
This guide provides strategies and tools for effectively debugging the iDecide app.

## Xcode Debugging Tools

### Breakpoints
- Use breakpoints to pause execution at specific lines
- Utilize conditional breakpoints for complex scenarios
- Use exception breakpoints to catch runtime errors

### LLDB Console
- Use `po` to print object descriptions
- Use `expr` to evaluate expressions in the current context
- Use `bt` to print the stack trace

### View Debugging
- Use Xcode's View Debugger to inspect UI hierarchy
- Check for constraint issues and overlapping views

### Memory Graph Debugger
- Use to detect retain cycles and memory leaks
- Analyze object relationships

## Logging

### Swift's print()
- Use for quick, temporary debugging
- Remove before committing code

### OS_Log
- Use for persistent logging
- Configure log levels appropriately

### Third-party Logging
- Consider using [SwiftyBeaver](https://github.com/SwiftyBeaver/SwiftyBeaver) for advanced logging

## Common Issues and Solutions

### Core Data Issues
- Enable SQL debugging in scheme settings
- Use Core Data debug gauge in Xcode

### Network Issues
- Use Charles Proxy or Proxyman to inspect network traffic
- Implement proper error handling and display in UI

### UI Issues
- Use `Debug View Hierarchy` in Xcode
- Add colored backgrounds to views for layout debugging

### Performance Issues
- Use Instruments (especially Time Profiler and Allocations)
- Look for main thread blockages

## Testing in Different Environments
- Use configuration files for environment-specific settings
- Test on various iOS versions and device types

## Crash Reports
- Implement crash reporting (e.g., Firebase Crashlytics)
- Analyze crash reports promptly

## Debugging Production Issues
- Implement remote logging for production builds
- Use TestFlight for beta testing

## Best Practices
1. Reproduce the issue consistently
2. Isolate the problem
3. Check recent changes that might have introduced the bug
4. Use version control to compare with working versions
5. Document steps to reproduce and fix for future reference

Remember, effective debugging often requires patience and methodical investigation. Don't hesitate to ask for help if you're stuck on a particularly challenging issue.
