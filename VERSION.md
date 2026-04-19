# Find A Match - Version 0.3.2

## Release Date
April 19, 2026

## Changes from 0.3.1
- Messages: conversation list loads reliably (Firestore query without composite index; sort by last activity on the client)
- Messages: user-visible error when the conversation list cannot be loaded (`listLoadError` banner; EN/DE strings)

---

# Find A Match - Version 0.3.1

## Release Date
February 22, 2026

## Changes from 0.3.0
- Options menu: renamed "Sprache" to "Optionen" with language selection and dark mode toggle
- Dark mode: persisted in AsyncStorage, applied across all screens
- Match screens (Request, Requests): graduated gray backgrounds, white text, matte blue headings
- ThemeContext: card2, card3 for graduated backgrounds; headingBlue for section titles
- Fixed React Navigation theme error ("cannot read property regular of undefined") via DefaultTheme spread

---

# Find A Match - Version 0.3.0

## Release Date
February 17, 2026

## Changes from 0.2.7
- Home: sport-specific card backgrounds (colors + optional images from assets/sportBackgrounds/)
- Home: dark overlay and white text on image backgrounds for readability
- Home/Menu: version display fixed (dynamic from package.json)
- Request details: compact info grid layout, removed "Akzeptiert von" for confirmed matches
- Friends: tappable friends list in profiles – navigate to friend-of-friend profiles
- Friends: "Add Friend" button when viewing non-friend profile (e.g. friend of friend)

---

# Find A Match - Version 0.2.7

## Release Date
February 17, 2026

## Changes from 0.2.6
- Home: compact layout for own requests – date/time left, avatar right in same row
- Menu/Navigation: all screen headers translated (Language, Friends, Profile, Account, etc.)
- Removed duplicate content titles from Settings, Friends, Account, Match History screens
- Match History: dynamic header when viewing friend's history (e.g. "Match-Verlauf (Max)")
- Auth screens: Login/Signup headers translated

---

# Find A Match - Version 0.2.6

## Release Date
January 24, 2026

## Changes from 0.2.5
- Home: tabbed categories for my/incoming/confirmed/cancelled requests
- Home: request dates include weekday and locale formatting
- Home: confirmed cards show final accepted time
- Requests: only creator can confirm matches
- Requests: completed match state with "mark as played" action and badge
- Match History: new screen showing completed matches
- Profiles: shared Instagram-style layout for self and friends
- Friends: profile view with sports, friends list, and match counts
- Account: logout moved from profile to account settings
- Request details: removed "(You)" suffix from invited list

---

# Find A Match - Version 0.2.5

## Release Date
January 24, 2026

## Changes from 0.2.4
- Request detail: creator avatar shown and accept/decline visibility improved
- Requests: manual start time selection and highlight suggested slots
- Home: show creator photo + names and action-required grouping
- Invited: declined requests hidden; confirmed matches exclude declines

---

# Find A Match - Version 0.2.3

## Release Date
January 22, 2026

## Changes from 0.2.2
- Requests: added sport selection, players count, and invite-all option
- Requests: added cancel flow, accept/decline proposals, and acceptance counting
- Friends: sport filter chips
- Home: sport display and cancelled section
- Profile: sports selection saved to profile

---

# Find A Match - Version 0.2.2

## Release Date
January 20, 2026

## Changes from 0.2.1
- Profile layout refreshed with bio and photo tap to change
- Friends list shows name + username + bio with avatars
- Language settings moved into dropdown
- Account screen supports email/password updates and reset/delete actions

---

# Find A Match - Version 0.2.1

## Release Date
January 16, 2026

## Changes from 0.2.0
- Added Firebase auth with email/password and unique usernames
- Added profile screen with photo upload, email update, and logout
- Migrated friends and match requests to Firestore
- Removed local server and IP scripts

---

# Find A Match - Version 0.2.0

## Release Date
January 12, 2025

## Changes from 0.1.0
- Upgraded to Expo SDK 54
- Updated React to 19.1.0 and React Native to 0.81.5
- Fixed mobile compatibility issues
- Improved offline mode support

---

# Find A Match - Version 0.1.0

## Release Date
January 10, 2025

## Overview
Initial release of Find A Match - a mobile application for finding tennis partners and scheduling matches.

## Features
- ✅ Create tennis match requests
- ✅ Select date and time ranges
- ✅ Friend selection (ready for implementation)
- ✅ Request management
- ✅ Multi-language support (German/English)
- ✅ Settings screen
- ✅ Cross-platform (iOS/Android/Web)

## Installation
See README.md for setup instructions.

## Next Steps
- Add friends management
- Implement backend integration
- Add notifications
- Enhance UI/UX
