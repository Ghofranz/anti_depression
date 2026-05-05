import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

class GradientScaffold extends StatelessWidget {
  const GradientScaffold({
    super.key,
    required this.child,
    this.appBar,
    this.gradient,
  });

  final Widget child;
  final PreferredSizeWidget? appBar;
  final Gradient? gradient;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: appBar,
      body: Container(
        decoration: BoxDecoration(gradient: gradient ?? AppColors.sunrise),
        child: SafeArea(child: child),
      ),
    );
  }
}
