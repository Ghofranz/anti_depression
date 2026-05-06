import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/study_message.dart';
import '../state/auth_store.dart';
import '../theme/app_colors.dart';
import '../widgets/background_widget.dart';

class StudyRoomDetailArgs {
  StudyRoomDetailArgs({required this.roomId, required this.roomTitle});

  final int roomId;
  final String roomTitle;
}

class StudyRoomDetailScreen extends StatefulWidget {
  const StudyRoomDetailScreen({super.key, required this.args});

  static const routeName = '/study-room';

  final StudyRoomDetailArgs args;

  @override
  State<StudyRoomDetailScreen> createState() => _StudyRoomDetailScreenState();
}

class _StudyRoomDetailScreenState extends State<StudyRoomDetailScreen> {
  final _controller = TextEditingController();
  final List<StudyMessage> _messages = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    await context.read<AuthStore>().api().joinStudyRoom(
      roomId: widget.args.roomId,
    );
    final messages = await context.read<AuthStore>().api().getStudyRoomMessages(
      widget.args.roomId,
    );
    setState(() {
      _messages
        ..clear()
        ..addAll(messages);
      _isLoading = false;
    });
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty) {
      return;
    }
    _controller.clear();
    final message = await context.read<AuthStore>().api().sendStudyRoomMessage(
      roomId: widget.args.roomId,
      message: text,
    );
    setState(() {
      _messages.add(message);
    });
  }

  Future<void> _leave() async {
    await context.read<AuthStore>().api().leaveStudyRoom(widget.args.roomId);
    if (!mounted) {
      return;
    }
    Navigator.pop(context);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.args.roomTitle),
        actions: [TextButton(onPressed: _leave, child: const Text('Leave'))],
      ),
      body: BackgroundWidget(
        child: Column(
          children: [
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _messages.length,
                      itemBuilder: (context, index) {
                        final message = _messages[index];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                message.name.isNotEmpty
                                    ? message.name
                                    : message.username,
                                style: Theme.of(context).textTheme.bodyMedium
                                    ?.copyWith(color: AppColors.teal),
                              ),
                              const SizedBox(height: 6),
                              Text(message.message),
                            ],
                          ),
                        );
                      },
                    ),
            ),
            Container(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              decoration: const BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Color(0x11000000),
                    blurRadius: 12,
                    offset: Offset(0, -4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      decoration: const InputDecoration(
                        hintText: 'Share your focus...',
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.send, color: AppColors.teal),
                    onPressed: _send,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
