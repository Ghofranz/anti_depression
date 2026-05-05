import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/confession.dart';
import '../models/news_item.dart';
import '../models/match.dart';
import '../state/auth_store.dart';
import '../theme/app_colors.dart';
import '../widgets/app_card.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  Future<_DashboardData> _loadData(AuthStore auth) async {
    final api = auth.api();
    final confessions = await api.getConfessions();
    final news = await api.getNews();
    List<MatchPair> matches = [];
    if (confessions.isNotEmpty) {
      matches = await api.getMatches(confessions.first.id);
    }
    return _DashboardData(
      confessions: confessions,
      news: news,
      matches: matches,
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthStore>();
    final session = auth.session;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () async {
              final api = auth.api();
              try {
                final events = await api.getEvents();
                if (!context.mounted) return;
                showModalBottomSheet(
                  context: context,
                  backgroundColor: AppColors.surface,
                  shape: const RoundedRectangleBorder(
                    borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                  ),
                  builder: (context) {
                    if (events.isEmpty) {
                      return const Padding(
                        padding: EdgeInsets.all(24),
                        child: Text('No new notifications.'),
                      );
                    }
                    return ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: events.length,
                      itemBuilder: (context, index) {
                        final event = events[index];
                        return ListTile(
                          title: Text(event['title'] ?? '', style: TextStyle(color: AppColors.ink)),
                          subtitle: Text(event['plan'] ?? '', style: TextStyle(color: AppColors.ink.withOpacity(0.7))),
                          trailing: Text(event['created_at'] ?? '', style: TextStyle(fontSize: 12, color: AppColors.teal)),
                        );
                      },
                    );
                  },
                );
              } catch (e) {
                // Ignore error
              }
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => auth.logout(),
          ),
        ],
      ),
      body: FutureBuilder<_DashboardData>(
        future: _loadData(auth),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final data = snapshot.data!;
          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Text(
                'Hello, ${session?.name.isNotEmpty == true ? session!.name : session?.username ?? 'friend'}',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 6),
              Text(
                'Your calm progress, one whisper at a time.',
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(color: AppColors.navy),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: _MetricCard(
                      label: 'Confessions',
                      value: data.confessions.length.toString(),
                      color: AppColors.coral,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _MetricCard(
                      label: 'Matches',
                      value: data.matches.length.toString(),
                      color: AppColors.teal,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _MetricCard(
                      label: 'News',
                      value: data.news.length.toString(),
                      color: AppColors.gold,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _MetricCard(
                      label: 'Momentum',
                      value: data.confessions.isEmpty ? '0%' : '72%',
                      color: AppColors.navy,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Text(
                'Recent confessions',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              if (data.confessions.isEmpty)
                const Text('No confessions yet. Start with a new whisper.')
              else
                ...data.confessions
                    .take(3)
                    .map(
                      (confession) => AppCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              confession.text,
                              style: Theme.of(context).textTheme.bodyLarge,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '${confession.emotion} • ${confession.locationHint}',
                              style: Theme.of(context).textTheme.bodyMedium
                                  ?.copyWith(color: AppColors.navy),
                            ),
                          ],
                        ),
                      ),
                    ),
            ],
          );
        },
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 8),
          Text(
            value,
            style: Theme.of(
              context,
            ).textTheme.headlineMedium?.copyWith(color: color),
          ),
        ],
      ),
    );
  }
}

class _DashboardData {
  const _DashboardData({
    required this.confessions,
    required this.news,
    required this.matches,
  });

  final List<Confession> confessions;
  final List<NewsItem> news;
  final List<MatchPair> matches;
}
