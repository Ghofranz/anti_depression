import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/news_item.dart';
import '../state/auth_store.dart';
import '../theme/app_colors.dart';
import '../widgets/app_card.dart';

class NewsScreen extends StatelessWidget {
  const NewsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('News')),
      body: FutureBuilder<List<NewsItem>>(
        future: context.read<AuthStore>().api().getNews(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final news = snapshot.data!;
          if (news.isEmpty) {
            return Center(
              child: Text(
                'No news yet. Check back soon.',
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(color: AppColors.navy),
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: news.length,
            itemBuilder: (context, index) {
              final item = news[index];
              return AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.title,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      item.authorName,
                      style: Theme.of(
                        context,
                      ).textTheme.bodyMedium?.copyWith(color: AppColors.teal),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      item.body,
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}
