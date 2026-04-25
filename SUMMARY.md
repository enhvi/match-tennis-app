# Summary

This file captures the key decisions, features, and technical topics discussed for the Match app.

## Product Scope
- Multi‑sport match finding (Tennis, Padel, Golf, Basketball, etc.)
- Focus on social matchmaking with friends and time coordination
- Two-sided request flow: creator vs invited responders

## Auth & Profiles
- Firebase Auth with email/password
- Unique username per user, stored case‑insensitively
- Profile includes display name, bio, photo, and sports selection
- Profile photo upload via Firebase Storage
- Shared Instagram-style profile layout for self and friends
- Match stats show sports/friends/matches counts

## Friends
- Friends list shows avatar, name, username, bio
- Friend requests show sender’s profile data
- Friend requests: Accept at top; Decline and Delete only at bottom of each card; declined requests disappear immediately
- Sport filter chips for friends list
- Friend profile view with sports/friends lists and match counts
- Friend profile "Matches" stat links to that friend's match history
- Friends of friends: tappable friends list in profiles – tap to view friend-of-friend's profile
- Add friend from friend-of-friend's profile: "Add Friend" button when viewing someone who is not yet a friend

## Match Requests (Core Flow)
- Request includes date, time range, sport, optional location, comment (visible to all), and players needed
- Optional duration: responders must pick a start time that fits duration
- Invite all friends with sport or select specific friends
- Creator can cancel or edit open requests (long‑press on home card)
- Responders can propose precise time or decline
- Suggested time slots are shown and can be selected/highlighted
- Manual time selection in request details with start/end display
- Responder directly finalizes match when proposing a time (no creator confirmation)
- Creator is informed when match is confirmed
- Auto‑confirm when required acceptances are met (e.g. 1v1: one proposal = confirmed)
- Completed matches are marked as played and shown in history
- Confirmed matches show final accepted time instead of the requested window
- Confirmed matches can be cancelled with a required free-text reason
- Declined responses:
  - Declined requests disappear for the responder
  - Requests with any decline do not show under confirmed matches

## Home Screen Organization
- Tabbed categories:
  - My requests
  - Incoming requests
  - Confirmed matches
- Unified card layout: creator image top right, date/time/sport left
- Acceptance count (e.g. 0/1) below creator for pending requests
- Instagram-style overlapping avatars for accepted responders
- Sport-specific card backgrounds: Tennis (blue), Padel (blue), Golf (blue), Basketball (orange)
- Optional sport background images from `assets/sportBackgrounds/` (tennis.png, padel.png, etc.)
- Dark overlay and white text on image backgrounds for readability
- Optional location shown on cards when set
- Expired incoming requests filtered out; declined and withdrawn requests excluded from incoming
- Request dates include weekday and locale formatting
- Confirmed cards show final accepted time
- Requests in each tab are sorted by upcoming date/time

## Request Details View
- Compact layout: info grid with label/value rows (date, time, sport, location, comment, duration)
- Shows creator avatar (top right)
- Shows accepted and declined names (only for pending requests; "Akzeptiert von" hidden for confirmed)
- Invited friends list shows display names (enriched from Firestore, not IDs)
- Supports cancel/delete for creator
- Duration shown when set (hidden for confirmed matches)
- For confirmed matches: only final time shown, label "Time" (not "Time Range")
- Completed status badge and "mark as played" action for creator
- **Confirmed matches**: participants list shows only creator + accepted; invited users who didn't accept are hidden
- **Cancelled matches**: participants list shows only creator + accepted; cancel reason and "Storniert" shown only at the person who cancelled (`cancelledBy`), not globally

## Localization
- English and German translations
- 24‑hour time format for German locale
- All navigation headers translated (Language/Sprache, Friends/Freunde, Profile/Profil, etc.)
- No duplicate titles: screen content titles removed where header already shows same info (Settings, Friends, Account, Match History)
 
## Match History
- History view lists completed matches only
- Optional location shown when set
- Matches count in profiles is derived from completed matches
- Dynamic header when viewing a friend's history: "Match-Verlauf (Name)" / "Match History (Name)"

## Technical Stack
- Expo (managed workflow)
- React Navigation (native stack + bottom tabs)
- Context API for Auth/App/Language/Theme/Notifications
- Firestore for realtime data (requests, friends, responses, notifications)
- Transactions used for atomic acceptance confirmation
- Request enrichment: creator and invited-friend profiles fetched from Firestore for display names

## Options & Dark Mode (v0.3.1)
- Menu item "Sprache" renamed to "Optionen" (Options)
- Options screen: language selection and dark mode toggle
- Dark mode persisted in AsyncStorage
- ThemeContext provides light/dark colors for all screens
- Dark mode: graduated gray backgrounds (background → card → card2 → card3)
- Match screens (Request, Requests): themed with white text and matte blue headings
- React Navigation theme: DefaultTheme spread to fix "fonts.regular" error

## Theme (Blue)
- Primary theme color changed from green to blue (#1976d2)
- Applied across buttons, headers, tabs, badges, sport borders
- Dark mode header: #1e3a5f

## Home Screen Cards (Unified Layout)
- Creator image always top right (consistent across all card types)
- Left: date, time, sport (and location for pending)
- Removed: friends invited count from short view
- Added: acceptance count (e.g. 0/1) below creator image for pending requests
- Instagram-style overlapping avatars for people who accepted
- Expired incoming requests (past date) no longer shown in "Anfragen von Freunden"

## Menu
- Header height aligned with home screen (useSafeAreaInsets + platform header height)
- Close (X) button positioned lower
- Notifications and Profile removed (now in bottom tab bar)

## Notifications (Instagram-style)
- Notifications tab in bottom bar with unread badge; menu item with badge
- NotificationsScreen: list of notifications with avatar, title, time-ago
- Notification types: friend request, match request, match confirmed, friend accepted, match cancelled, match declined, match withdrawn (participant withdrew after accepting)
- Firestore: users/{userId}/notifications
- NotificationContext: preferences (AsyncStorage) for toggling each type
- Notification settings in Options screen
- In-app notifications only (push would require expo-notifications + Cloud Functions)

## Options UI (Redesign)
- Card-based sections: Appearance, Language, Notifications
- Minimalist layout with light accents
- Section labels with blue left border (3px)
- Toggle rows with subtle dividers in notification section

## Bottom Tab Navigation (Pinterest/Instagram-style)
- Five tabs at bottom: Home, Notifications, Create, Messages, Profile
- Simple Ionicons in app colors (blue primary, gray inactive)
- Home: start screen with "Match" header and menu button
- Notifications: full notifications list with unread badge
- Create: opens request creation (replaces floating + button)
- Messages: placeholder screen ("Coming soon")
- Profile: user profile

## Request Creation (Layout)
- Compact layout: smaller title, content pushed up
- Duration and players side by side in one row (smaller)
- Comment field below location (visible to all participants, max 300 chars)

## Time Handling (Midnight)
- End time 0:00 (midnight) after start (e.g. 20:00) treated as next day
- Duration calculated correctly (e.g. 20:00–0:00 = 4 hours)
- Applies to request creation, suggested times, expiry check, match completion

## Match Decline & Withdraw
- Confirmation dialog before declining ("Are you sure? This cannot be undone")
- Declined matches do not appear in "Anfragen von Freunden" (incoming requests)
- Withdrawn matches (user had accepted, then withdrew) also excluded from incoming requests
- When a participant withdraws from a confirmed match: creator gets notification "Teilnehmer hat abgesagt" (matchWithdrawn); request returns to "Meine Anfragen" for creator; notification preference in Settings (default on)

## All Declined (Creator View)
- When everyone declines on creator's request: shown in "My Requests" with red left border
- "Alle haben abgelehnt" badge prominently displayed
- "Anfrage stornieren" button on card for direct cancel
- Request stays visible until creator cancels it

## Robustness (Malformed Data)
- Defensive null checks for `responses`, `accepted`, and `participantsList` to avoid crashes with invalid match data (e.g. 3 accepted for 2-player match)
- Optional chaining (`resp?.status`, `notificationPrefs?.matchExpired`) across AppContext, HomeScreen, RequestsScreen, MatchHistoryScreen

## Versioning
- App versions tracked in `package.json`, `app.json`, `VERSION.md`, and `CHANGELOG.md`
- Version displayed in app footer (Menu and Home screen)
- Latest saved version: 0.3.2 (tagged `v0.3.2`)
