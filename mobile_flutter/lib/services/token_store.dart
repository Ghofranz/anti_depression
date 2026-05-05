import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/user_session.dart';

class TokenStore {
  static const _sessionKey = 'whisperwall.session';
  UserSession? _session;

  UserSession? get session => _session;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_sessionKey);
    if (jsonStr == null) {
      _session = null;
      return;
    }
    final data = json.decode(jsonStr) as Map<String, dynamic>;
    _session = UserSession.fromStored(data);
  }

  Future<void> save(UserSession session) async {
    _session = session;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_sessionKey, json.encode(session.toJson()));
  }

  Future<void> clear() async {
    _session = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_sessionKey);
  }
}
