# Tennis App

A cross-platform mobile application built with React Native and Expo that works on both iOS and Android.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Expo CLI** (will be installed globally)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install Expo CLI globally (if not already installed):
```bash
npm install -g expo-cli
```

## Running the App

### Development Server

Start the Expo development server:
```bash
npm start
```

This will open Expo DevTools in your browser. You can then:

- **Scan the QR code** with:
  - **iOS**: Use the Camera app (iOS 11+) or Expo Go app
  - **Android**: Use the Expo Go app from Google Play Store
  
- **Press specific keys** in the terminal:
  - `a` - Open on Android emulator
  - `i` - Open on iOS simulator (macOS only)
  - `w` - Open in web browser

### Running on Physical Devices

1. **iOS**:
   - Install the "Expo Go" app from the App Store
   - Scan the QR code from the terminal or browser

2. **Android**:
   - Install the "Expo Go" app from Google Play Store
   - Scan the QR code from the terminal or browser

### Running on Emulators/Simulators

- **Android Emulator**: Make sure you have Android Studio installed and an emulator running, then press `a` in the terminal
- **iOS Simulator**: Only available on macOS with Xcode installed, press `i` in the terminal

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

Or use EAS Build (recommended):
```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

## Project Structure

```
tennis-app/
├── App.js              # Main app component
├── app.json            # Expo configuration
├── package.json        # Dependencies and scripts
├── babel.config.js     # Babel configuration
└── assets/            # Images, fonts, etc.
```

## Next Steps

- Add navigation (React Navigation)
- Add state management (Redux, Context API, or Zustand)
- Add API integration
- Customize the UI for your tennis app features
- Add app icons and splash screens in the `assets/` folder

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
