import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'screens/chat_screen.dart';
import 'screens/home_shell.dart';
import 'screens/landing_screen.dart';
import 'screens/login_screen.dart';
import 'screens/reveal_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/study_room_detail_screen.dart';
import 'state/auth_store.dart';
import 'theme/app_theme.dart';

class WhisperWallApp extends StatelessWidget {
  const WhisperWallApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CampusConnect',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      onGenerateRoute: _routes,
      home: const AuthGate(),
    );
  }
}

Route<dynamic> _routes(RouteSettings settings) {
  switch (settings.name) {
    case LoginScreen.routeName:
      return MaterialPageRoute(builder: (_) => const LoginScreen());
    case SignupScreen.routeName:
      return MaterialPageRoute(builder: (_) => const SignupScreen());
    case HomeShell.routeName:
      return MaterialPageRoute(builder: (_) => const HomeShell());
    case ChatScreen.routeName:
      final args = settings.arguments as ChatScreenArgs;
      return MaterialPageRoute(builder: (_) => ChatScreen(args: args));
    case RevealScreen.routeName:
      final args = settings.arguments as RevealScreenArgs;
      return MaterialPageRoute(builder: (_) => RevealScreen(args: args));
    case StudyRoomDetailScreen.routeName:
      final args = settings.arguments as StudyRoomDetailArgs;
      return MaterialPageRoute(
        builder: (_) => StudyRoomDetailScreen(args: args),
      );
    default:
      return MaterialPageRoute(builder: (_) => const LandingScreen());
  }
}

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthStore>();

    if (auth.isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (auth.isAuthenticated) {
      return const HomeShell();
    }

    return const LandingScreen();
  }
}
