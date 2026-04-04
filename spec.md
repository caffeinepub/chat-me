# Chat Me

## Current State
Login system uses `loginWithPassword(username, password)` in backend. Password comparison is exact string match. Frontend `handleLogin` trims username but does NOT trim password. `resetAdminPassword` only resets passwords using a hardcoded recovery key, and is only accessible via the "Forgot Password" flow -- regular users cannot reset their own password.

## Requested Changes (Diff)

### Add
- Backend: new `resetPassword(token, newPassword)` function so any logged-in user can change their password (not needed for this fix, but kept in mind)
- Backend: new `resetPasswordByUsername(username, newPassword, recoveryKey)` that works for ALL users (not just admin), keeping the same recovery key mechanism

### Modify
- Backend `loginWithPassword`: trim both username and password before comparison to avoid whitespace mismatch
- Backend `registerWithPassword`: trim username, password, name before storing
- Frontend `LoginScreen`: trim password in `handleLogin` and `handleRegister` before sending to backend
- Frontend `LoginScreen` reset tab: clearly label it works for ALL users (not just admin), improve error messages

### Remove
- Nothing removed

## Implementation Plan
1. Update backend `loginWithPassword` to trim password before comparison
2. Update backend `registerWithPassword` to trim and store trimmed password
3. Update `resetAdminPassword` to work for all users (rename effectively to resetPasswordByUsername, keeping same function name for compatibility)
4. Update frontend to trim password fields before all backend calls
5. Improve reset UI labels so users know it works for everyone
