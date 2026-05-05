import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'app.dart';
import 'services/token_store.dart';
import 'state/auth_store.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final tokenStore = TokenStore();
  await tokenStore.load();

  runApp(
    MultiProvider(
      providers: [ChangeNotifierProvider(create: (_) => AuthStore(tokenStore))],
      child: const WhisperWallApp(),
    ),
  );
}
