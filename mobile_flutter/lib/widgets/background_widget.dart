import 'package:flutter/material.dart';
import '../services/background_service.dart';

class BackgroundWidget extends StatefulWidget {
  final Widget child;
  final bool randomizeOnRebuild;

  const BackgroundWidget({
    super.key,
    required this.child,
    this.randomizeOnRebuild = false,
  });

  @override
  State<BackgroundWidget> createState() => _BackgroundWidgetState();
}

class _BackgroundWidgetState extends State<BackgroundWidget> {
  late String _currentBackground;

  @override
  void initState() {
    super.initState();
    _currentBackground = BackgroundService.getRandomBackground();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Background image
        Positioned.fill(
          child: Image.asset(_currentBackground, fit: BoxFit.cover),
        ),
        // Dark overlay for better text readability
        Positioned.fill(
          child: Container(
            color: Colors.black.withAlpha(102), // 40% opacity
          ),
        ),
        // Content on top
        widget.child,
      ],
    );
  }
}
