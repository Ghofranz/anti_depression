import 'package:flutter/material.dart';

class AppColors {
  static const Color ink = Color(0xFFFFFFFF);
  static const Color surface = Color(0xFF0F172A);
  static const Color surfaceAlt = Color(0xFF1E293B);
  static const Color sand = Color(0xFF334155);
  static const Color coral = Color(0xFF22D3EE);
  static const Color teal = Color(0xFF22D3EE);
  static const Color navy = Color(0xFF312E81);
  static const Color gold = Color(0xFFFFC857);
  static const Color success = Color(0xFF2EBD85);
  static const Color danger = Color(0xFFE2574C);

  static const LinearGradient sunrise = LinearGradient(
    colors: [Color(0xFF312E81), Color(0xFF22D3EE)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient deepSea = LinearGradient(
    colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
