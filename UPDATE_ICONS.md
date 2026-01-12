# Updating App Icons

## Icons Added ✓
- ✅ `icon.png` (1024x1024) - Main app icon
- ✅ `adaptive-icon.png` (1024x1024) - Android adaptive icon

## Next Steps

### For Development (Expo Go)
The icons won't show in Expo Go - they only appear in standalone builds.

### To See Icons in Standalone App

1. **Build the app** (APK/IPA):
   ```bash
   eas build --platform android --profile preview
   ```

2. **Or use local build**:
   - Icons will be included automatically when you build

### Optional: Create Splash Screen

If you want a custom splash screen:
- Create `assets/splash.png` (1242x2436 pixels)
- Or the app will use a default splash screen

### Current Status
- ✅ Icons are in place
- ✅ Configuration is correct
- ⏳ Icons will appear when you build the standalone app

## Testing Icons

After building:
- Install the APK on your phone
- The icon will appear on your home screen
- Check both light and dark backgrounds (if applicable)
