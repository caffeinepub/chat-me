# Chat Me

## Current State
OTP is generated in backend and returned directly to frontend (displayed on screen). No real SMS is sent.

## Requested Changes (Diff)

### Add
- HTTP outcall to Fast2SMS API to send real OTP SMS to user's phone number
- Admin can set Fast2SMS API key via `setApiKey(token, key)` function
- Default placeholder API key in backend

### Modify
- `requestOtp` backend function: now makes HTTP outcall to Fast2SMS and returns `#ok("")` (empty string, not the OTP)
- LoginScreen frontend: remove OTP display box, show "OTP sent to your phone" message instead
- `handleRegister` in LoginScreen: use the already-verified OTP instead of re-requesting a new one

### Remove
- OTP display box from frontend (the big pink box showing the code)

## Implementation Plan
1. Update `main.mo` to add Fast2SMS HTTP outcall using ICP's management canister HTTP feature, store API key as stable var
2. Update `backend.d.ts` to add `setApiKey` function
3. Update `LoginScreen.tsx` to remove OTP display and update register flow to not re-request OTP
