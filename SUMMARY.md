# Summary

This file captures the key decisions, features, and technical topics discussed for the Find A Match app.

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
- Sport filter chips for friends list
- Friend profile view with sports/friends lists and match counts

## Match Requests (Core Flow)
- Request includes date, time range, sport, and players needed
- Optional duration: responders must pick a start time that fits duration
- Invite all friends with sport or select specific friends
- Creator can cancel or edit open requests (long‑press on home card)
- Responders can propose precise time or decline
- Suggested time slots are shown and can be selected/highlighted
- Manual time selection in request details with start/end display
- Creator accepts/declines proposed times
- Auto‑confirm match when required acceptances are met
- Only the creator can confirm matches
- Completed matches are marked as played and shown in history
- Confirmed matches show final accepted time instead of the requested window
- Declined responses:
  - Declined requests disappear for the responder
  - Requests with any decline do not show under confirmed matches

## Home Screen Organization
- Tabbed categories:
  - My requests
  - Incoming requests
  - Confirmed matches
  - Cancelled requests
- Creator info (name + photo) displayed on cards
- Accepted/declined responders shown on pending cards
- Request dates include weekday and locale formatting
- Confirmed cards show final accepted time

## Request Details View
- Shows creator avatar (top right)
- Shows accepted and declined names
- Supports cancel/delete for creator
- Duration shown when set
- Completed status badge and "mark as played" action for creator

## Localization
- English and German translations
- 24‑hour time format for German locale
 
## Match History
- History view lists completed matches only
- Matches count in profiles is derived from completed matches

## Technical Stack
- Expo (managed workflow)
- React Navigation (native stack)
- Context API for Auth/App/Language
- Firestore for realtime data (requests, friends, responses)
- Transactions used for atomic acceptance confirmation

## Versioning
- App versions tracked in `package.json`, `app.json`, `VERSION.md`, and `CHANGELOG.md`
- Latest saved version: 0.2.6 (tagged `v0.2.6`)
