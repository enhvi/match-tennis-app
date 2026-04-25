# How to Build and Install Match on Your Phone

## Option 1: Using Expo Go (Current Method - Testing Only)

**What you're doing now:**
- App runs in Expo Go
- Good for development and testing
- Not a standalone app

**Limitations:**
- Requires Expo Go app installed
- Not distributable to others easily
- Shows "Expo Go" branding

---

## Option 2: Build Standalone App (Production)

### For Android (APK file)

#### Method A: Using EAS Build (Recommended - Free)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```
   (Create free account at https://expo.dev if needed)

3. **Configure the project:**
   ```bash
   eas build:configure
   ```

4. **Build Android APK:**
   ```bash
   eas build --platform android --profile preview
   ```
   This creates a downloadable APK file.

5. **Download and Install:**
   - EAS will provide a download link
   - Download the APK on your Android phone
   - Enable "Install from unknown sources" in Android settings
   - Install the APK file

#### Method B: Local Build (Requires Android Studio)

1. **Install Android Studio** from https://developer.android.com/studio

2. **Set up Android SDK** and environment variables

3. **Build locally:**
   ```bash
   npx expo run:android
   ```

### For iOS (IPA file)

**Requirements:**
- Mac computer
- Apple Developer account ($99/year)
- Xcode installed

**Steps:**
1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Build: `eas build --platform ios --profile preview`
4. Install via TestFlight or direct install

---

## Option 3: Publish to App Stores

### Google Play Store (Android)

1. Build release APK/AAB:
   ```bash
   eas build --platform android
   ```

2. Create Google Play Developer account ($25 one-time fee)

3. Upload to Google Play Console

4. Submit for review

### Apple App Store (iOS)

1. Build release IPA:
   ```bash
   eas build --platform ios
   ```

2. Apple Developer account required ($99/year)

3. Upload via App Store Connect

4. Submit for review

---

## Quick Start: Build Android APK Now

**Simplest method to get an installable APK:**

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login (create account if needed)
eas login

# 3. Configure
eas build:configure

# 4. Build APK
eas build --platform android --profile preview
```

**After build completes:**
- You'll get a download link
- Download APK on your phone
- Enable "Install from unknown sources"
- Install the APK

---

## Current Status

- ✅ App works in Expo Go (development)
- ⏳ Ready to build standalone app
- ⏳ Ready for app store submission

## Which Method Should You Use?

- **Just testing?** → Keep using Expo Go
- **Want to install on phone without Expo Go?** → Use EAS Build (Option 2, Method A)
- **Want to distribute to others?** → Build and publish to app stores

---

## Notes

- EAS Build free tier allows limited builds per month
- For unlimited builds, consider EAS Build paid plan
- Local builds are free but require more setup
