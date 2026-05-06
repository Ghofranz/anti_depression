import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/study_room.dart';
import '../state/auth_store.dart';
import '../theme/app_colors.dart';
import '../widgets/app_card.dart';
import '../widgets/background_widget.dart';
import '../widgets/primary_button.dart';
import 'study_room_detail_screen.dart';

class StudyRoomsScreen extends StatefulWidget {
  const StudyRoomsScreen({super.key});

  @override
  State<StudyRoomsScreen> createState() => _StudyRoomsScreenState();
}

class _StudyRoomsScreenState extends State<StudyRoomsScreen> {
  late Future<List<StudyRoom>> _roomsFuture;

  @override
  void initState() {
    super.initState();
    _roomsFuture = context.read<AuthStore>().api().getStudyRooms();
  }

  void _refresh() {
    setState(() {
      _roomsFuture = context.read<AuthStore>().api().getStudyRooms();
    });
  }

  Future<void> _openCreateRoom() async {
    final created = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const _CreateRoomSheet(),
    );
    if (created == true) {
      _refresh();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Study Rooms'),
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: _openCreateRoom),
        ],
      ),
      body: BackgroundWidget(
        child: FutureBuilder<List<StudyRoom>>(
          future: _roomsFuture,
          builder: (context, snapshot) {
            if (!snapshot.hasData) {
              return const Center(child: CircularProgressIndicator());
            }
            final rooms = snapshot.data!;
            if (rooms.isEmpty) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Start a room',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Create a focus room and invite your match to study with you.',
                        style: Theme.of(
                          context,
                        ).textTheme.bodyMedium?.copyWith(color: AppColors.navy),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      PrimaryButton(
                        label: 'Create room',
                        onPressed: _openCreateRoom,
                      ),
                    ],
                  ),
                ),
              );
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: rooms.length,
              itemBuilder: (context, index) {
                final room = rooms[index];
                return AppCard(
                  child: ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(room.title),
                    subtitle: Text(
                      '${room.topic} • ${room.durationMinutes} min',
                    ),
                    trailing: Chip(
                      label: Text('${room.activeParticipantCount} active'),
                      backgroundColor: AppColors.sand,
                    ),
                    onTap: () => Navigator.pushNamed(
                      context,
                      StudyRoomDetailScreen.routeName,
                      arguments: StudyRoomDetailArgs(
                        roomId: room.id,
                        roomTitle: room.title,
                      ),
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _openCreateRoom,
        backgroundColor: AppColors.teal,
        child: const Icon(Icons.auto_awesome),
      ),
    );
  }
}

class _CreateRoomSheet extends StatefulWidget {
  const _CreateRoomSheet();

  @override
  State<_CreateRoomSheet> createState() => _CreateRoomSheetState();
}

class _CreateRoomSheetState extends State<_CreateRoomSheet> {
  final _formKey = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _topic = TextEditingController();
  final _description = TextEditingController();
  final _focus = TextEditingController();
  bool _isSaving = false;
  String? _error;

  @override
  void dispose() {
    _title.dispose();
    _topic.dispose();
    _description.dispose();
    _focus.dispose();
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
      await context.read<AuthStore>().api().createStudyRoom(
        title: _title.text.trim(),
        topic: _topic.text.trim(),
        description: _description.text.trim(),
        focus: _focus.text.trim(),
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
              'Create study room',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _title,
              decoration: const InputDecoration(labelText: 'Title'),
              validator: (value) =>
                  value == null || value.isEmpty ? 'Enter title' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _topic,
              decoration: const InputDecoration(labelText: 'Topic'),
              validator: (value) =>
                  value == null || value.isEmpty ? 'Enter topic' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _description,
              decoration: const InputDecoration(
                labelText: 'Description (optional)',
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _focus,
              decoration: const InputDecoration(labelText: 'Focus (optional)'),
            ),
            if (_error != null) ...[
              const SizedBox(height: 8),
              Text(_error!, style: const TextStyle(color: AppColors.danger)),
            ],
            const SizedBox(height: 16),
            PrimaryButton(
              label: 'Create room',
              onPressed: _isSaving ? null : _submit,
              isLoading: _isSaving,
            ),
          ],
        ),
      ),
    );
  }
}
