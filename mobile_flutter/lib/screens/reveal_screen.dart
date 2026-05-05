import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/auth_store.dart';
import '../theme/app_colors.dart';
import '../widgets/app_card.dart';
import '../widgets/primary_button.dart';

class RevealScreenArgs {
  RevealScreenArgs({required this.matchId, required this.confessionId});

  final int matchId;
  final int confessionId;
}

class RevealScreen extends StatefulWidget {
  const RevealScreen({super.key, required this.args});

  static const routeName = '/reveal';

  final RevealScreenArgs args;

  @override
  State<RevealScreen> createState() => _RevealScreenState();
}

class _RevealScreenState extends State<RevealScreen> {
  late Future<Map<String, dynamic>> _statusFuture;

  @override
  void initState() {
    super.initState();
    _statusFuture = context.read<AuthStore>().api().getContactExchangeStatus(
      widget.args.matchId,
    );
  }

  Future<void> _refresh() async {
    setState(() {
      _statusFuture = context.read<AuthStore>().api().getContactExchangeStatus(
        widget.args.matchId,
      );
    });
  }

  Future<void> _activateExchange() async {
    await context.read<AuthStore>().api().activateContactExchange(
      widget.args.matchId,
    );
    await _refresh();
  }

  Future<void> _requestReveal() async {
    await context.read<AuthStore>().api().requestReveal(
      matchId: widget.args.matchId,
      confessionId: widget.args.confessionId,
    );
    await _refresh();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reveal')),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _statusFuture,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final status = snapshot.data!;
          final bothActive = status['both_active'] == true;
          final myActive = status['my_contact_exchange_active'] == true;
          final peerActive = status['peer_contact_exchange_active'] == true;

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Contact exchange',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    _StatusRow(label: 'You', value: myActive),
                    _StatusRow(label: 'Peer', value: peerActive),
                    const SizedBox(height: 12),
                    PrimaryButton(
                      label: myActive ? 'Activated' : 'Activate exchange',
                      onPressed: myActive ? null : _activateExchange,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Reveal request',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      bothActive
                          ? 'Both sides agreed. You can reveal now.'
                          : 'Reveal is available once both sides agree.',
                      style: Theme.of(
                        context,
                      ).textTheme.bodyMedium?.copyWith(color: AppColors.navy),
                    ),
                    const SizedBox(height: 12),
                    PrimaryButton(
                      label: 'Request reveal',
                      onPressed: _requestReveal,
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _StatusRow extends StatelessWidget {
  const _StatusRow({required this.label, required this.value});

  final String label;
  final bool value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(label, style: Theme.of(context).textTheme.bodyLarge),
        const SizedBox(width: 12),
        Chip(
          label: Text(value ? 'Active' : 'Pending'),
          backgroundColor: value ? AppColors.success : AppColors.sand,
        ),
      ],
    );
  }
}
