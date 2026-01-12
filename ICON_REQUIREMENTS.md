# App Icon Requirements for Find A Match

## Overview
You need to create app icons for iOS and Android. The base icon should be a square image that will be automatically resized for different platforms.

## Base Icon Requirements

### Main Icon (Required)
- **Size**: 1024 x 1024 pixels
- **Format**: PNG (with transparency support)
- **Background**: Can be transparent or solid color
- **Shape**: Square (will be automatically rounded on iOS/Android)
- **File name**: `icon.png`
- **Location**: `assets/icon.png`

### Design Guidelines
- **Keep important content in center**: Icons are automatically cropped/rounded
- **Use high contrast**: Should be visible on light and dark backgrounds
- **Simple and recognizable**: Should work at small sizes
- **No text**: Text becomes unreadable at small sizes
- **Use your brand colors**: Green (#4CAF50) matches your app theme

## Platform-Specific Icons

### iOS
- **App Icon**: 1024x1024 (automatically resized by Expo)
- **No rounded corners needed**: iOS adds them automatically
- **No transparency**: iOS requires opaque background

### Android
- **Adaptive Icon**: 1024x1024 (foreground)
  - **File**: `assets/adaptive-icon.png`
  - **Size**: 1024 x 1024 pixels
  - **Safe zone**: Keep important content within 768x768 center area
  - **Background color**: Set in `app.json` (currently white)
  
- **Legacy Icon**: Same as main icon (1024x1024)

## Additional Assets Needed

### Splash Screen
- **Size**: 1242 x 2436 pixels (iPhone X size, will be scaled)
- **Format**: PNG
- **File**: `assets/splash.png`
- **Background color**: White (as set in app.json)

### Favicon (Web)
- **Size**: 48 x 48 pixels (or 16x16, 32x32, 96x96)
- **Format**: PNG or ICO
- **File**: `assets/favicon.png`

## Quick Summary for Gemini

**Create these images:**

1. **Main Icon** (`icon.png`)
   - 1024 x 1024 pixels
   - PNG format
   - Square design
   - Tennis/racket theme with "Find A Match" branding
   - Green color scheme (#4CAF50)

2. **Adaptive Icon** (`adaptive-icon.png`) - Same as main icon
   - 1024 x 1024 pixels
   - Keep important elements in center 768x768 area

3. **Splash Screen** (`splash.png`)
   - 1242 x 2436 pixels
   - App logo centered on white background

4. **Favicon** (`favicon.png`)
   - 48 x 48 pixels (or multiple sizes: 16, 32, 48, 96)
   - Simplified version of your icon

## Example Prompt for Gemini

```
Create an app icon for a tennis match-finding app called "Find A Match":
- Size: 1024x1024 pixels, PNG format
- Design: Modern, minimalist tennis theme
- Colors: Green (#4CAF50) as primary color, white accents
- Elements: Tennis racket or ball, clean and simple
- Style: Flat design, high contrast, works at small sizes
- Background: Transparent or solid green
- No text in the icon itself
```

## After Creating Icons

1. Save your icons with the exact filenames:
   - `assets/icon.png` (1024x1024)
   - `assets/adaptive-icon.png` (1024x1024)
   - `assets/splash.png` (1242x2436)
   - `assets/favicon.png` (48x48)

2. Place them in the `assets/` folder

3. The app will automatically use them when you rebuild

## Testing Your Icons

After adding icons:
- Rebuild the app to see icons
- Icons appear on home screen after installation
- Test on both iOS and Android if possible
