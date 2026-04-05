# Chat Me - Aanya AI Friend Feature

## Current State
Chat Me is a WhatsApp-style messaging app on ICP with:
- Real user registration/login (username + password)
- Two-way real-time messaging with 1s polling
- Chat list with persistent contacts, admin pinned at top
- Friend system (addFriend, getMyFriends)
- Online status (heartbeat/isUserOnline)
- Admin analytics dashboard
- Dark mode, themes, wallpapers

## Requested Changes (Diff)

### Add
1. **Aanya bot user** -- A special user account `aanya_bot` (ID=0 or a reserved special user) pre-seeded in the backend. She appears as a real user in everyone's chat list from the moment they join. Her profile: name="Aanya", username="aanya", avatar=🌸 emoji styled DP, about="Heyyyy I'm Aanya! 22, Mumbai 🌸".

2. **Auto-message on new user registration** -- When any new user registers, Aanya immediately sends them a welcome message like "Heyyyy! 👋 Main Aanya hun~ Kya haal hai aapka? 😊"

3. **Auto-proactive messages** -- Aanya sends random friendly Hinglish messages to all users after a few minutes of their registration or after ~5 minutes of inactivity (frontend polls and triggers if user hasn't received a message in 5 min). This uses a list of prewritten friendly messages so no API key needed for proactive messages.

4. **AI-powered replies** -- When a user messages Aanya's chat, the frontend calls the Claude API (via HTTP outcalls in backend OR direct from frontend) to get a reply as Aanya. Aanya NEVER says she's AI. Responds in short casual Hinglish.

5. **Admin can reply as Aanya** -- Admin sees a special "Reply as Aanya" mode in Aanya's chat. When admin is in that chat, they see all incoming messages from any user to Aanya, and can type a reply that gets sent as Aanya. This is a frontend-only feature -- the admin just uses a special admin token to send messages with Aanya's sender ID.

6. **Backend: `sendMessageAsBot` function** -- Admin-only backend function that lets the admin token send a message on behalf of Aanya (bot) to any chat. Also used for auto-welcome messages.

7. **Backend: `ensureAanyaExists`** -- Called on startup to create Aanya's account if not already present.

8. **Backend: `getAanyaUserId`** -- Returns Aanya's user ID so frontend can construct chatId.

### Modify
- `registerWithPassword` -- After registration, call sendMessageAsBot to send Aanya's welcome message to the new user's DM.
- `ChatList` -- Aanya's contact always appears in the list (like admin), with her 🌸 avatar, right after admin.
- `ActiveChat` -- When the active chat is with Aanya, after user sends a message, trigger AI reply via frontend fetch to Claude API. Show typing indicator for 1-3 seconds before reply appears.
- `AdminView` -- Add "Aanya's Chats" section where admin can see all conversations involving Aanya and reply as her.

### Remove
- Nothing removed.

## Implementation Plan
1. Backend: Add `aanyaId` stable var (= 0 as reserved bot ID). Add `ensureAanyaExists`, `sendMessageAsBot` (admin or system token), `getAanyaUserId` functions.
2. Backend: In `registerWithPassword`, after creating user, call internal function to queue/send Aanya's welcome message to the new user.
3. Frontend `backend.d.ts`: Add `sendMessageAsBot`, `getAanyaUserId` type signatures.
4. Frontend `AanyaBot.ts` utility: Contains Aanya's persona prompt, proactive message list, and `getAanyaReply(history)` function that calls Claude API.
5. Frontend `ActiveChat.tsx`: Detect if chatting with Aanya (by userId). After user sends message, call `getAanyaReply` and then `sendMessageAsBot` to post Aanya's reply.
6. Frontend `ChatList.tsx`: Always show Aanya in the list (fetch her userId on mount, add synthetic conversation entry if not present).
7. Frontend `AdminView.tsx`: Add "Aanya Inbox" panel. Show conversations from Aanya's perspective. Allow admin to type and send replies as Aanya via `sendMessageAsBot`.
8. Proactive messages: On ChatList mount, check if user's last message from Aanya was > 5 min ago, if so trigger a proactive message.
