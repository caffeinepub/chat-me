# Chat Me

## Current State

User search by @username works ("Find by ID" button). But when user A clicks "Chat" on user B's result:
- `onOpenChat("DM: @username")` is called — this string becomes BOTH the display name AND the backend `chatId`
- User B has NO WAY to open the same chat because they don't know user A's chatId string
- `ChatList.tsx` shows hardcoded fake chats (Art Buddies, Cute Pets Corner, etc.) — no real conversations
- No backend method to list all conversations for a user

## Requested Changes (Diff)

### Add
- Backend: `ConversationInfo` type with chatId, otherUser info, lastMessage, lastTimestamp
- Backend: `parseNat` helper for parsing UserId from text
- Backend: `getOtherUserIdFromChatId(chatId, myId)` helper — parses `dm_A_B` format
- Backend: `getUserConversations(token)` — returns all DM conversations for the logged-in user
- Frontend: `activeChatId` state in App.tsx separate from `activeChatName`
- Frontend: Real conversation list in ChatList loaded from backend (polled every 5s)

### Modify
- App.tsx: `openChat(chatId, displayName)` — now takes both chatId (for backend) and displayName (for UI)
- App.tsx: Pass `chatId` prop to `ActiveChat`
- ChatList.tsx: `handleStartChat(user)` — compute `dm_${min(myId, theirId)}_${max(myId, theirId)}` as chatId
- ChatList.tsx: `onOpenChat` interface accepts `(chatId, displayName)` tuple
- ActiveChat.tsx: Accept `chatId` prop and use it for all backend calls; `chatName` is display-only
- backend.d.ts: Add `ConversationInfo` interface and `getUserConversations` method
- backend.did.js: Add `ConversationInfo` IDL type and `getUserConversations` to service

### Remove
- Hardcoded `chats` array in ChatList.tsx

## Implementation Plan

1. Update `main.mo` with `ConversationInfo` type, helper functions, and `getUserConversations` method
2. Update `backend.d.ts` with `ConversationInfo` type and method signature
3. Update `backend.did.js` with IDL definition
4. Update `App.tsx` to separate chatId from displayName
5. Update `ChatList.tsx` to load real conversations and generate proper chatId
6. Update `ActiveChat.tsx` to accept `chatId` prop and use it for backend calls
