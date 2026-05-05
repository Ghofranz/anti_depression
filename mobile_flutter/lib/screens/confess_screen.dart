import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/confession.dart';
import '../state/auth_store.dart';
import '../theme/app_colors.dart';
import '../widgets/app_card.dart';
import '../widgets/primary_button.dart';

class ConfessScreen extends StatefulWidget {
  const ConfessScreen({super.key});

  @override
  State<ConfessScreen> createState() => _ConfessScreenState();
}

class _ConfessScreenState extends State<ConfessScreen> {
  late Future<List<Confession>> _confessionsFuture;

  @override
  void initState() {
    super.initState();
    _confessionsFuture = context.read<AuthStore>().api().getConfessions();
  }

  void _refresh() {
    setState(() {
      _confessionsFuture = context.read<AuthStore>().api().getConfessions();
    });
  }

  Future<void> _openComposer() async {
    final created = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const _ConfessionComposer(),
    );
    if (created == true) {
      _refresh();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Confessions'),
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: _openComposer),
        ],
      ),
      body: FutureBuilder<List<Confession>>(
        future: _confessionsFuture,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final confessions = snapshot.data!;
          if (confessions.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Share your first whisper',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Post a confession to unlock matches and news.',
                      style: Theme.of(
                        context,
                      ).textTheme.bodyMedium?.copyWith(color: AppColors.navy),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    PrimaryButton(
                      label: 'Create confession',
                      onPressed: _openComposer,
                    ),
                  ],
                ),
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: confessions.length,
            itemBuilder: (context, index) {
              final confession = confessions[index];
              return AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      confession.text,
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          confession.emotion,
                          style: Theme.of(context).textTheme.bodyMedium
                              ?.copyWith(color: AppColors.teal),
                        ),
                        Text(
                          confession.locationHint,
                          style: Theme.of(context).textTheme.bodyMedium
                              ?.copyWith(color: AppColors.navy),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _openComposer,
        backgroundColor: AppColors.coral,
        child: const Icon(Icons.edit),
      ),
    );
  }
}

class _ConfessionComposer extends StatefulWidget {
  const _ConfessionComposer();

  @override
  State<_ConfessionComposer> createState() => _ConfessionComposerState();
}

class _ConfessionComposerState extends State<_ConfessionComposer> {
  final _formKey = GlobalKey<FormState>();
  final _text = TextEditingController();
  final _location = TextEditingController();
  String _emotion = _emotions.first;
  bool _isSaving = false;
  String? _error;

  @override
  void dispose() {
    _text.dispose();
    _location.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    setState(() {
      _isSaving = true;
      _error = null;
    });
    try {
      await context.read<AuthStore>().api().postConfession(
        text: _text.text.trim(),
        emotion: _emotion,
        locationHint: _location.text.trim(),
      );
      if (!mounted) {
        return;
      }
      Navigator.pop(context, true);
    } catch (error) {
      setState(() {
        _error = error.toString();
        _isSaving = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'New confession',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _emotion,
              items: _emotions
                  .map(
                    (emotion) =>
                        DropdownMenuItem(value: emotion, child: Text(emotion)),
                  )
                  .toList(),
              onChanged: (value) =>
                  setState(() => _emotion = value ?? _emotion),
              decoration: const InputDecoration(labelText: 'Emotion'),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _location,
              decoration: const InputDecoration(labelText: 'Location hint'),
              validator: (value) =>
                  value == null || value.isEmpty ? 'Add location hint' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _text,
              maxLines: 4,
              decoration: const InputDecoration(labelText: 'Your whisper'),
              validator: (value) =>
                  value == null || value.isEmpty ? 'Write something' : null,
            ),
            if (_error != null) ...[
              const SizedBox(height: 8),
              Text(_error!, style: const TextStyle(color: AppColors.danger)),
            ],
            const SizedBox(height: 16),
            PrimaryButton(
              label: 'Post confession',
              onPressed: _isSaving ? null : _submit,
              isLoading: _isSaving,
            ),
          ],
        ),
      ),
    );
  }
}

const List<String> _emotions = [
  'course_help',
  'project_team',
  'exam_preparation',
  'study_group',
  'internship_advice',
  'administrative_request',
  'lost_found',
  'love',
  'crush',
  'heartbreak',
  'regret',
  'fight',
  'miss',
  'apology',
];
