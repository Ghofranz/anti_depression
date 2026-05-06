import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/confession.dart';
import '../models/match.dart';
import '../state/auth_store.dart';
import '../theme/app_colors.dart';
import '../widgets/app_card.dart';
import '../widgets/background_widget.dart';
import 'chat_screen.dart';
import 'reveal_screen.dart';

class MatchesScreen extends StatefulWidget {
  const MatchesScreen({super.key});

  @override
  State<MatchesScreen> createState() => _MatchesScreenState();
}

class _MatchesScreenState extends State<MatchesScreen> {
  List<Confession> _confessions = [];
  List<MatchPair> _matches = [];
  Confession? _selected;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    final api = context.read<AuthStore>().api();
    final confessions = await api.getConfessions();
    List<MatchPair> matches = [];
    Confession? selected;
    if (confessions.isNotEmpty) {
      selected = confessions.first;
      matches = await api.getMatches(selected.id);
    }
    setState(() {
      _confessions = confessions;
      _selected = selected;
      _matches = matches;
      _isLoading = false;
    });
  }

  Future<void> _selectConfession(Confession? confession) async {
    if (confession == null) {
      return;
    }
    setState(() {
      _selected = confession;
      _isLoading = true;
    });
    final matches = await context.read<AuthStore>().api().getMatches(
      confession.id,
    );
    setState(() {
      _matches = matches;
      _isLoading = false;
    });
  }

  int? _myConfessionId(MatchPair match) {
    final userId = context.read<AuthStore>().session?.id;
    if (userId == null) {
      return null;
    }
    if (match.confessionA.authorId == userId) {
      return match.confessionA.id;
    }
    if (match.confessionB.authorId == userId) {
      return match.confessionB.id;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Matches')),
      body: BackgroundWidget(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              DropdownButtonFormField<Confession>(
                value: _selected,
                isExpanded: true,
                items: _confessions
                    .map(
                      (confession) => DropdownMenuItem(
                        value: confession,
                        child: Text(
                          confession.text,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    )
                    .toList(),
                onChanged: _selectConfession,
                decoration: const InputDecoration(
                  labelText: 'Pick a confession',
                ),
              ),
              const SizedBox(height: 12),
              if (_isLoading)
                const Expanded(
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (_matches.isEmpty)
                Expanded(
                  child: Center(
                    child: Text(
                      'No matches yet. Keep whispering.',
                      style: Theme.of(
                        context,
                      ).textTheme.bodyMedium?.copyWith(color: AppColors.navy),
                    ),
                  ),
                )
              else
                Expanded(
                  child: ListView.builder(
                    itemCount: _matches.length,
                    itemBuilder: (context, index) {
                      final match = _matches[index];
                      final other = match.confessionA.id == _selected?.id
                          ? match.confessionB
                          : match.confessionA;
                      final myConfessionId = _myConfessionId(match);

                      return AppCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              other.text,
                              maxLines: 3,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.bodyLarge,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Match score ${(match.score * 100).toStringAsFixed(0)}%',
                              style: Theme.of(context).textTheme.bodyMedium
                                  ?.copyWith(color: AppColors.teal),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                TextButton.icon(
                                  onPressed: myConfessionId == null
                                      ? null
                                      : () => Navigator.pushNamed(
                                          context,
                                          ChatScreen.routeName,
                                          arguments: ChatScreenArgs(
                                            matchId: match.id,
                                            senderConfessionId: myConfessionId,
                                          ),
                                        ),
                                  icon: const Icon(Icons.chat_bubble_outline),
                                  label: const Text('Chat'),
                                ),
                                const SizedBox(width: 8),
                                TextButton.icon(
                                  onPressed: myConfessionId == null
                                      ? null
                                      : () => Navigator.pushNamed(
                                          context,
                                          RevealScreen.routeName,
                                          arguments: RevealScreenArgs(
                                            matchId: match.id,
                                            confessionId: myConfessionId,
                                          ),
                                        ),
                                  icon: const Icon(Icons.visibility_outlined),
                                  label: const Text('Reveal'),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
