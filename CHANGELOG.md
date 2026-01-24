# Changelog

All notable changes to Find A Match will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
