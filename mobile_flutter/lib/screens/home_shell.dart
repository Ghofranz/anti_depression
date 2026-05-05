import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import 'confess_screen.dart';
import 'dashboard_screen.dart';
import 'news_screen.dart';
import 'matches_screen.dart';
import 'study_rooms_screen.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  static const routeName = '/home';

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 0;

  final _pages = const [
    DashboardScreen(),
    ConfessScreen(),
    MatchesScreen(),
    NewsScreen(),
    StudyRoomsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _index, children: _pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        indicatorColor: AppColors.sand,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.edit_note_outlined),
            label: 'Confess',
          ),
          NavigationDestination(
            icon: Icon(Icons.forum_outlined),
            label: 'Matches',
          ),
          NavigationDestination(
            icon: Icon(Icons.campaign_outlined),
            label: 'News',
          ),
          NavigationDestination(
            icon: Icon(Icons.auto_awesome_outlined),
            label: 'Study',
          ),
        ],
      ),
    );
  }
}
