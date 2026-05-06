import 'dart:math';

class BackgroundService {
  static const List<String> _backgrounds = [
    'assets/bg/1.png',
    'assets/bg/7.png',
    'assets/bg/8.png',
    'assets/bg/home-bg.png',
    'assets/bg/home-bg0.png',
    'assets/bg/home-bg1.png',
    'assets/bg/live.png',
    'assets/bg/oldlive.png',
  ];

  static String getRandomBackground() {
    final random = Random();
    return _backgrounds[random.nextInt(_backgrounds.length)];
  }
}
