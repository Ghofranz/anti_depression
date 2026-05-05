import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../widgets/gradient_scaffold.dart';
import '../widgets/primary_button.dart';
import 'login_screen.dart';
import 'signup_screen.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GradientScaffold(
      child: Stack(
        children: [
          Positioned(
            right: -40,
            top: 40,
            child: _CircleBubble(
              color: AppColors.gold.withOpacity(0.4),
              size: 180,
            ),
          ),
          Positioned(
            left: -30,
            bottom: 120,
            child: _CircleBubble(
              color: Colors.white.withOpacity(0.25),
              size: 140,
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 24),
                Text(
                  'WhisperWall',
                  style: Theme.of(
                    context,
                  ).textTheme.headlineLarge?.copyWith(color: AppColors.ink),
                ),
                const SizedBox(height: 12),
                Text(
                  'A gentle, anonymous space to connect, study, and reveal what matters.',
                  style: Theme.of(
                    context,
                  ).textTheme.bodyLarge?.copyWith(color: AppColors.navy),
                ),
                const SizedBox(height: 28),
                _HighlightRow(
                  title: 'Confess safely',
                  subtitle: 'Share thoughts with guided emotions.',
                ),
                _HighlightRow(
                  title: 'Match softly',
                  subtitle: 'Find peers who feel the same.',
                ),
                _HighlightRow(
                  title: 'Study together',
                  subtitle: 'Focus rooms with gentle accountability.',
                ),
                const Spacer(),
                PrimaryButton(
                  label: 'Login',
                  onPressed: () =>
                      Navigator.pushNamed(context, LoginScreen.routeName),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () =>
                      Navigator.pushNamed(context, SignupScreen.routeName),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.ink,
                    side: const BorderSide(color: AppColors.ink),
                    padding: const EdgeInsets.symmetric(
                      vertical: 16,
                      horizontal: 20,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                    ),
                  ),
                  child: const Text('Create account'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _HighlightRow extends StatelessWidget {
  const _HighlightRow({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        children: [
          Container(
            width: 12,
            height: 12,
            margin: const EdgeInsets.only(right: 12),
            decoration: const BoxDecoration(
              color: AppColors.ink,
              shape: BoxShape.circle,
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.titleLarge),
                Text(
                  subtitle,
                  style: Theme.of(
                    context,
                  ).textTheme.bodyMedium?.copyWith(color: AppColors.navy),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CircleBubble extends StatelessWidget {
  const _CircleBubble({required this.color, required this.size});

  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
    );
  }
}
