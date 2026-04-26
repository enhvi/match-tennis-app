# Match Release Checklist

This checklist keeps Android releases reproducible and makes it clear which version is live.

## 1) Before Release

- [ ] Working tree is clean (`git status`)
- [ ] App name/branding is correct (`Match`)
- [ ] Smoke test on device (login, requests, notifications, chat)
- [ ] No blocking errors in console/logs
- [ ] Firebase rules/functions are deployed if required by the release
- [ ] Privacy policy is published at a public HTTPS URL
- [ ] `app.json` -> `expo.extra.privacyPolicyUrl` points to that public URL
- [ ] Play Console "Data safety" answers reviewed and up to date
- [ ] Account deletion flow tested end-to-end in production-like build

## 2) Versioning (single source of truth)

Update these files together:

- [ ] `package.json` -> `version` (e.g. `0.3.3`)
- [ ] `app.json` -> `expo.version` (same value)
- [ ] `CHANGELOG.md` -> new section for this version/date
- [ ] `VERSION.md` -> release note entry

Recommended versioning:

- Patch (`0.3.x`): bugfixes, small UI changes
- Minor (`0.x.0`): new features, behavior changes
- Major (`x.0.0`): breaking changes or large redesign

## 3) Commit + Tag

```bash
git add .
git commit -m "release: v0.3.3"
git tag -a v0.3.3 -m "Release v0.3.3"
```

If you use remote tags:

```bash
git push
git push origin v0.3.3
```

## 4) Build Android (EAS)

Internal test build (APK for friends):

```bash
npx eas-cli build -p android --profile preview
```

Store build (AAB for Google Play):

```bash
npx eas-cli build -p android --profile production
```

## 5) Publish Flow (Google Play)

- [ ] Upload AAB to Play Console
- [ ] Start with Internal testing
- [ ] Add testers and verify install/update
- [ ] Promote to production when stable

## 6) Track What Is Live

Keep this section updated after each release:

- **Latest released version:** `v0.3.3`
- **Release date:** `2026-04-24`
- **Git tag:** `v0.3.3`
- **Play track:** `internal` (or `production`)
- **EAS build URL:** `<paste build link>`

## 7) Ongoing Development After Release

- Continue normal development on your main branch
- Keep unreleased changes in commits until next version bump
- Create a new tag only when you actually publish
- If urgent fix needed, bump patch version (e.g. `0.3.3` -> `0.3.4`)

## 8) Optional Housekeeping

- Local folder name can stay `Tennis App` (does not block releases)
- Android package `com.tennisapp.app` should usually remain unchanged after publishing
- Keep `eas.json` profiles as-is (`preview` for APK, `production` for AAB)
