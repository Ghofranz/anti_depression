import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/auth_store.dart';
import '../theme/app_colors.dart';
import '../widgets/app_card.dart';
import '../widgets/primary_button.dart';
import '../widgets/background_widget.dart';
import 'home_shell.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  static const routeName = '/signup';

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _username = TextEditingController();
  final _password = TextEditingController();
  String? _error;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _username.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    setState(() => _error = null);
    final auth = context.read<AuthStore>();
    try {
      await auth.signUp(
        name: _name.text.trim(),
        email: _email.text.trim(),
        username: _username.text.trim(),
        password: _password.text.trim(),
      );
      if (!mounted) {
        return;
      }
      Navigator.pushNamedAndRemoveUntil(
        context,
        HomeShell.routeName,
        (_) => false,
      );
    } catch (error) {
      setState(() => _error = error.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    final isBusy = context.watch<AuthStore>().isLoading;

    return Scaffold(
      appBar: AppBar(),
      body: BackgroundWidget(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            Text(
              'Create your space',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Step into a calmer community built around real emotions and study goals.',
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: AppColors.navy),
            ),
            const SizedBox(height: 24),
            AppCard(
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    TextFormField(
                      controller: _name,
                      decoration: const InputDecoration(labelText: 'Name'),
                      validator: (value) =>
                          value == null || value.isEmpty ? 'Enter name' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _email,
                      decoration: const InputDecoration(labelText: 'Email'),
                      validator: (value) =>
                          value == null || value.isEmpty ? 'Enter email' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _username,
                      decoration: const InputDecoration(labelText: 'Username'),
                      validator: (value) => value == null || value.isEmpty
                          ? 'Enter username'
                          : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _password,
                      decoration: const InputDecoration(labelText: 'Password'),
                      obscureText: true,
                      validator: (value) => value == null || value.length < 6
                          ? 'Min 6 chars'
                          : null,
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: 12),
                      Text(
                        _error!,
                        style: const TextStyle(color: AppColors.danger),
                      ),
                    ],
                    const SizedBox(height: 16),
                    PrimaryButton(
                      label: 'Create account',
                      onPressed: isBusy ? null : _submit,
                      isLoading: isBusy,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
