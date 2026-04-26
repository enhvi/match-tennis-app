# Play Store Data Safety - Match (Draft)

Use this as a filling template for Google Play Console > App content > Data safety.

## High-level answers

- Does your app collect or share user data? **Yes (collects), No (does not sell data).**
- Is all user data encrypted in transit? **Yes** (Firebase over TLS).
- Can users request account/data deletion? **Yes** (in-app account delete).
- Is data required to provide app functionality? **Yes** (account, social, match, chat).

## Data categories likely applicable

## Personal info

- **Email address**
  - Collected: Yes
  - Shared: No
  - Purpose: App functionality, account management, security/fraud prevention
  - Required for app functionality: Yes

## User content

- **Photos** (profile photo upload)
  - Collected: Yes
  - Shared: No
  - Purpose: App functionality (profile)
  - Required: Optional feature

- **Other user content** (bio, match comments, chat messages)
  - Collected: Yes
  - Shared: No
  - Purpose: App functionality
  - Required: Partly optional, partly required by feature usage

## App activity

- **In-app interactions** (friend requests, match responses, notifications state)
  - Collected: Yes
  - Shared: No
  - Purpose: App functionality, analytics/operations (if internally used for debugging only)

## App info and performance

- **Crash logs / diagnostics**
  - Verify before answering. If no crash SDK is integrated, mark as not collected.

## Not currently detected in codebase

- No ad SDK / no advertising ID use detected.
- No contacts access.
- No location access.
- No camera capture flow (only media-library picker).

## Pre-submit verification checklist

- Confirm every Firebase/Cloud Function data write path.
- Confirm production build does not add SDKs not present in source.
- Confirm privacy policy URL is public and reachable.
- Confirm account deletion behavior in app matches policy wording.
