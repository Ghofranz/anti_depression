# Random Background Integration Guide

## How to Use Random Backgrounds in Your Screens

The `BackgroundWidget` provides a reusable wrapper that displays a random background image on each screen visit.

### Basic Usage

Wrap your Scaffold's body with `BackgroundWidget`:

```dart
import '../widgets/background_widget.dart';

@override
Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(title: const Text('My Screen')),
    body: BackgroundWidget(
      child: SingleChildScrollView(
        child: Column(
          children: [
            // Your screen content here
          ],
        ),
      ),
    ),
  );
}
```

### Features

- **Random Selection**: Each time you visit the screen, a random background from `assets/bg/` is displayed
- **Dark Overlay**: A 40% dark overlay is applied automatically for better text readability
- **Easy Integration**: Just wrap your existing body content

### Available Backgrounds

The following background images are available:

- 1.png
- 7.png
- 8.png
- home-bg.png
- home-bg0.png
- home-bg1.png
- live.png
- oldlive.png

### Example Screens to Update

You can apply this to any screen:

- `confess_screen.dart`
- `dashboard_screen.dart`
- `matches_screen.dart`
- `news_screen.dart`
- etc.

### Adding More Backgrounds

To add more background images:

1. Place them in `assets/bg/`
2. Add them to the `_backgrounds` list in `lib/services/background_service.dart`
3. Rebuild the app

---

**Files Created:**

- `lib/services/background_service.dart` - Service to manage random background selection
- `lib/widgets/background_widget.dart` - Widget to display backgrounds with overlay
