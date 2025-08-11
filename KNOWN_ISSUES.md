# Known Issues

## Vitest CJS Deprecation Warning

**Issue**: When running tests, you may see this warning:
```
The CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.
```

**Impact**: This warning does not affect functionality. All tests run successfully and the package works correctly.

**Root Cause**: This is a known issue with Vitest 1.6.x when used in CommonJS projects. The warning comes from Vite's internal usage, not our code.

**Status**: This is cosmetic only. The package is fully functional and ready for production use.

**Workaround**: If the warning bothers you in your project, you can:
1. Ignore it (recommended - it doesn't affect functionality)
2. Use `npm run test 2>/dev/null` to hide stderr warnings
3. Wait for Vitest 2.x which resolves this issue

## Other Issues

None currently known. If you encounter issues, please report them at:
https://github.com/username/airtable-types-gen/issues