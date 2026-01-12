# Changelog

All notable changes to Find A Match will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
