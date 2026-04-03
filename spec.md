# Chat Me

## Current State
App is a WhatsApp-inspired messaging app with pastel/cute aesthetic. Settings page has wallpaper, home theme (17 options), font size, and notification toggles. There is no global dark mode toggle. The app uses light pastel colors throughout all views (backgrounds, cards, navbars, chat bubbles, etc.).

## Requested Changes (Diff)

### Add
- Global Dark Mode toggle in Settings page (under Chats section)
- When dark mode is ON: entire app switches to black/dark background with proper readable text (white/light)
- Dark mode state saved in localStorage (`chatme_dark_mode`) so it persists across sessions
- All screens affected: home, chatList, activeChat, profile, settings, admin, login, splash

### Modify
- App.tsx: add `darkMode` state, read from localStorage, pass as prop down to all views
- SettingsView.tsx: add Dark Mode switch row in Chats section
- All view components: accept `darkMode` prop and apply dark backgrounds/text colors conditionally
- index.css: add `.dark` class with dark CSS variables

### Remove
- Nothing removed

## Implementation Plan
1. Add `darkMode: boolean` state to App.tsx, initialized from localStorage
2. Apply `dark` class to root `<div>` in App.tsx when darkMode is true
3. Update `index.css` with dark mode CSS variable overrides under `.dark` class
4. Pass `darkMode` + `onDarkModeChange` props to SettingsView
5. Add Dark Mode toggle switch in SettingsView Chats section
6. Update all major components (ChatList, ActiveChat, ProfileView, TopNav, BottomNav, LoginScreen, CentralDashboard, LeftSidebar, AdminView, ChatPanel, Footer) to use `darkMode` prop for conditional styling
7. Validate build
