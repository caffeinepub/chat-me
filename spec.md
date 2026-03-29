# Chat Me

## Current State
- Login system uses phone number + OTP (SMS via Fast2SMS)
- Demo mode creates fake users with `demo-token-XXX` tokens that are not valid backend sessions
- Username change fails because demo-mode tokens have no backend session → `setUsername` returns `#err("Not logged in")`
- Users stored in `usersByPhone` HashMap keyed by phone number
- Auto-generated username on registration (e.g. `@Arun1`)
- Sessions are stored in transient HashMap restored via pre/postupgrade hooks

## Requested Changes (Diff)

### Add
- `registerWithPassword(username, password, name)` backend function — stores password in User, keys user by username
- `loginWithPassword(username, password)` backend function — finds user by username, checks password, creates session
- New LoginScreen UI: two tabs (Login / Register) with username+password fields
- Username availability check on Register screen
- `password` field in User struct

### Modify
- User struct: add `password` field
- User storage: add secondary lookup by username for login (iterate to find by username)
- ProfileView: username change still works (changes login credential but does not invalidate current session)
- App.tsx: no demo-mode fallback that creates fake tokens; if backend unreachable on startup, go to login screen
- LoginScreen: completely replaced — no phone/OTP flow

### Remove
- Phone OTP login flow from frontend (LoginScreen)
- Demo mode local token generation
- Phone number input from registration flow

## Implementation Plan
1. Backend: Add `password` to User struct, add `registerWithPassword` and `loginWithPassword` functions. Migrate existing users (set empty password for backward compat — they must re-register). Keep all other functions.
2. Frontend LoginScreen: Replace 3-step OTP UI with simple Login/Register toggle. Register: pick username (with real-time availability check) + name + password + confirm password. Login: username + password.
3. App.tsx: Remove demo-mode fallback that creates fake tokens. If backend unreachable at startup, redirect to login.
4. ProfileView: No changes needed — username change already works correctly if session is valid.
