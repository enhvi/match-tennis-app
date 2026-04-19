# Changelog

All notable changes to Find A Match will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.2] - 2026-04-19

### Fixed
- Messages: conversations appear under Nachrichten after sending (query no longer requires a missing Firestore composite index; client-side sort by `lastMessageAt`)

### Changed
- Messages: show a clear error banner if the conversation list fails to load (with translations)

---

## [0.3.1] - 2026-02-22

### Added
- Options screen: language selection and dark mode toggle (renamed from "Sprache")
- ThemeContext with light/dark colors and AsyncStorage persistence
- Graduated dark backgrounds (card, card2, card3) for match screens
- Matte blue headings (headingBlue) for section titles in dark mode

### Changed
- Menu item "Sprache" renamed to "Optionen"
- Match screens (Request, Requests): full dark mode theming with white text
- Home screen cards use theme colors in dark mode

### Fixed
- React Navigation theme: spread DefaultTheme to fix "cannot read property regular of undefined"

---

## [0.3.0] - 2026-02-17

### Added
- Sport-specific card backgrounds (colors + optional images: tennis.png, padel.png, golf.png, basketball.png)
- Friends of friends: tappable friends list – tap to view friend-of-friend's profile
- "Add Friend" button when viewing a non-friend's profile (e.g. friend of friend)

### Changed
- Home: dark overlay and white text on image backgrounds for readability
- Request details: compact info grid layout, removed "Akzeptiert von" for confirmed matches
- Version display: now dynamic from package.json (was hardcoded)

---

## [0.2.7] - 2026-02-17

### Changed
- Home: compact layout for own requests – date/time left, avatar right in same row
- All navigation headers now translated (Language/Sprache, Friends/Freunde, Profile/Profil, Account/Konto, etc.)
- Removed duplicate content titles from Settings, Friends, Account, Match History screens
- Match History: dynamic header when viewing a friend's history (e.g. "Match-Verlauf (Max)")
- Auth screens: Login and Signup headers translated

---

## [0.2.6] - 2026-01-24

### Added
- Match history screen for completed matches
- Match completion flow ("mark as played") with completed badge
- Shared profile UI for self and friends (Instagram-style)
- Friend profile browsing with sports/friends/match stats
- Home screen tabs for my/incoming/confirmed/cancelled sections

### Changed
- Logout moved from Profile to Account settings
- Home request dates include weekday with locale formatting
- Confirmed requests show final accepted time
- Only creators can confirm matches
- Removed "(You)" suffix from request details friend list

---

## [0.2.5] - 2026-01-24

### Added
- Request detail: creator avatar and start/end time picker for responders
- Suggested time chips highlight and update the proposed start time
- Home cards show creator photo/name and action-required grouping
- Invited requests hide declined responses; confirmed matches exclude declines

---

## [0.2.4] - 2026-01-24

### Added
- Split pending requests into my vs incoming
- Show accepted/declined responders on pending cards
- Duration constraints and suggested time slots
- Request edit, cancel, and delete flow

---

## [0.2.3] - 2026-01-22

### Added
- Request sport selection, player count, and invite-all option
- Request cancel flow, accept/decline proposals, and acceptance counter
- Friends sport filter chips
- Home section for cancelled requests + sport display
- Profile sports selection

---

## [0.2.2] - 2026-01-20

### Added
- Account screen with password reset and delete account
- Friend cards now show avatar, name, username, and bio
- Profile bio support
- Language dropdown in settings

### Changed
- Split menu items into Language and Account

---

## [0.2.1] - 2026-01-16

### Added
- Firebase email/password auth with unique usernames
- Profile screen with photo upload, email update, and logout
- Firestore-backed friends and match requests

### Removed
- Local server and IP update scripts

---

## [0.2.0] - 2025-01-12

### Changed
- Upgraded to Expo SDK 54 for compatibility with latest Expo Go
- Updated React to 19.1.0
- Updated React Native to 0.81.5
- Updated all dependencies to SDK 54 compatible versions
- Improved error handling for socket connections (app works offline)
- Fixed turbomodulregistry errors on mobile devices

### Fixed
- App now works properly on mobile devices with Expo Go SDK 54
- Resolved native module compatibility issues
- Improved offline mode support when backend server is not running

### Technical
- React Native with Expo SDK 54
- React 19.1.0
- React Native 0.81.5
- All native modules updated to SDK 54 compatible versions

## [0.1.0] - 2025-01-10

### Added
- Initial release of Find A Match
- Home screen with pending requests and confirmed matches display
- Create tennis match requests with date and time range selection
- Friend selection for match requests
- Request management screen to view and manage requests
- Friend acceptance flow - friends can accept time proposals
- Match confirmation system
- Settings screen accessible from menu button
- Multi-language support (German and English)
- Language selection with primary language setting
- Spinner-style time pickers (non-clock interface)
- Floating action button (+) to create new requests
- Menu button in top-right corner for settings access
- Backend server infrastructure for real-time communication (ready for future use)
- User identification system (ready for multi-user testing)

### Technical
- React Native with Expo SDK 52
- React Navigation for screen navigation
- Context API for state management
- AsyncStorage for language preferences
- Socket.io client for real-time features
- DateTimePicker for date/time selection
- Cross-platform support (iOS and Android)
- Web support for development/testing

### Known Limitations
- Friends list is currently empty (to be implemented)
- Backend server not required for single-user use
- Testing infrastructure ready but not actively used
