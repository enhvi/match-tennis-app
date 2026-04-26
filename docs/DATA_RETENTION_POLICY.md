# Data Retention Policy - Match

Last updated: 2026-04-26

This document defines default retention targets for user-related data.

## 1) Active account period

While an account is active, the app stores:

- user profile data,
- friend graph and friend requests,
- match requests and responses,
- messages between friends,
- notification history and notification preferences.

## 2) Account deletion target behavior

When a user deletes their account in-app, the following should be removed as part of deletion workflow:

- `users/{uid}` profile document,
- `users/{uid}/friends/*`,
- `users/{uid}/friendRequests/*`,
- `users/{uid}/notifications/*`,
- Storage profile image under `users/{uid}/...`,
- Auth account in Firebase Authentication.

Note: some references in other users' records (historic chat/match references) may need separate cleanup logic and should be reviewed before production launch.

## 3) Operational retention recommendations

Recommended defaults (configure via scheduled jobs/Cloud Functions):

- Notifications: auto-delete after 180 days.
- Completed/cancelled match requests: archive or delete after 24 months.
- Messages: keep while both accounts are active; consider optional per-thread deletion.
- Friend requests with stale status: delete after 90 days.

## 4) Backups and logs

Infrastructure backups and service logs may persist for limited periods under provider policy and are deleted automatically by provider lifecycle rules.

## 5) Review cadence

Review this policy every 6 months and whenever:

- new data categories are added,
- legal requirements change,
- new third-party processors are integrated.
