import 'package:flutter/material.dart';

import '../models/user_session.dart';
import '../services/api_service.dart';
import '../services/token_store.dart';

class AuthStore extends ChangeNotifier {
  AuthStore(this._tokenStore) {
    _session = _tokenStore.session;
    _isLoading = false;
  }

  final TokenStore _tokenStore;
  UserSession? _session;
  bool _isLoading = true;

  UserSession? get session => _session;
  bool get isAuthenticated => _session != null && _session!.token.isNotEmpty;
  bool get isLoading => _isLoading;

  ApiService api() => ApiService(token: _session?.token);

  Future<void> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();
    final session = await ApiService(token: null).login(username, password);
    await _tokenStore.save(session);
    _session = session;
    _isLoading = false;
    notifyListeners();
  }

  Future<void> signUp({
    required String name,
    required String email,
    required String username,
    required String password,
  }) async {
    _isLoading = true;
    notifyListeners();
    final session = await ApiService(
      token: null,
    ).signUp(name: name, email: email, username: username, password: password);
    await _tokenStore.save(session);
    _session = session;
    _isLoading = false;
    notifyListeners();
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();
    await _tokenStore.clear();
    _session = null;
    _isLoading = false;
    notifyListeners();
  }
}
