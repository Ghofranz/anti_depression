import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/app_config.dart';
import '../models/chat_message.dart';
import '../models/confession.dart';
import '../models/match.dart';
import '../models/news_item.dart';
import '../models/study_message.dart';
import '../models/study_room.dart';
import '../models/user_session.dart';

class ApiService {
  ApiService({required String? token}) : _token = token;

  final String? _token;

  Uri _uri(String path) => Uri.parse('${AppConfig.apiBaseUrl}$path');

  Map<String, String> _headers({bool auth = true}) {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (auth && (_token?.isNotEmpty ?? false)) {
      headers['Authorization'] = 'Token $_token';
    }
    return headers;
  }

  Future<UserSession> login(String username, String password) async {
    final response = await http.post(
      _uri('/login/'),
      headers: _headers(auth: false),
      body: json.encode({'username': username, 'password': password}),
    );
    final data = _decode(response) as Map<String, dynamic>;
    final token = data['token'] as String? ?? '';
    return UserSession.fromJson(data['user'] as Map<String, dynamic>, token);
  }

  Future<UserSession> signUp({
    required String name,
    required String email,
    required String username,
    required String password,
  }) async {
    final response = await http.post(
      _uri('/sign_up/'),
      headers: _headers(auth: false),
      body: json.encode({
        'name': name,
        'email': email,
        'username': username,
        'password': password,
      }),
    );
    final data = _decode(response) as Map<String, dynamic>;
    final token = data['token'] as String? ?? '';
    return UserSession.fromJson(data['user'] as Map<String, dynamic>, token);
  }

  Future<List<Confession>> getConfessions() async {
    final response = await http.get(_uri('/confess/'), headers: _headers());
    final data = _decode(response) as List<dynamic>;
    return data
        .map((row) => Confession.fromJson(row as Map<String, dynamic>))
        .toList();
  }

  Future<Confession> postConfession({
    required String text,
    required String emotion,
    required String locationHint,
  }) async {
    final response = await http.post(
      _uri('/confess/'),
      headers: _headers(),
      body: json.encode({
        'text': text,
        'emotion': emotion,
        'location_hint': locationHint,
      }),
    );
    final data = _decode(response) as Map<String, dynamic>;
    return Confession.fromJson(data);
  }

  Future<List<MatchPair>> getMatches(int confessionId) async {
    final response = await http.get(
      _uri('/matches/$confessionId/'),
      headers: _headers(),
    );
    final data = _decode(response) as List<dynamic>;
    return data
        .map((row) => MatchPair.fromJson(row as Map<String, dynamic>))
        .toList();
  }

  Future<List<ChatMessage>> getChat(int matchId) async {
    final response = await http.get(
      _uri('/chat/$matchId/'),
      headers: _headers(),
    );
    final data = _decode(response) as List<dynamic>;
    return data
        .map((row) => ChatMessage.fromJson(row as Map<String, dynamic>))
        .toList();
  }

  Future<ChatMessage> sendMessage({
    required int matchId,
    required int senderConfessionId,
    required String message,
  }) async {
    final response = await http.post(
      _uri('/chat/send/'),
      headers: _headers(),
      body: json.encode({
        'match': matchId,
        'sender': senderConfessionId,
        'message': message,
      }),
    );
    final data = _decode(response) as Map<String, dynamic>;
    return ChatMessage.fromJson(data);
  }

  Future<Map<String, dynamic>> requestReveal({
    required int matchId,
    required int confessionId,
  }) async {
    final response = await http.post(
      _uri('/reveal/'),
      headers: _headers(),
      body: json.encode({'match': matchId, 'confession': confessionId}),
    );
    return _decode(response) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getContactExchangeStatus(int matchId) async {
    final response = await http.get(
      _uri('/contact-exchange/status/$matchId/'),
      headers: _headers(),
    );
    return _decode(response) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> activateContactExchange(int matchId) async {
    final response = await http.post(
      _uri('/contact-exchange/activate/$matchId/'),
      headers: _headers(),
      body: json.encode({}),
    );
    return _decode(response) as Map<String, dynamic>;
  }

  Future<List<NewsItem>> getNews() async {
    final response = await http.get(
      _uri('/news/'),
      headers: _headers(auth: false),
    );
    final data = _decode(response) as Map<String, dynamic>;
    final news = data['news'] as List<dynamic>? ?? [];
    return news
        .map((row) => NewsItem.fromJson(row as Map<String, dynamic>))
        .toList();
  }

  Future<List<StudyRoom>> getStudyRooms() async {
    final response = await http.get(_uri('/study/rooms/'), headers: _headers());
    final data = _decode(response) as Map<String, dynamic>;
    final rooms = data['rooms'] as List<dynamic>? ?? [];
    return rooms
        .map((row) => StudyRoom.fromJson(row as Map<String, dynamic>))
        .toList();
  }

  Future<StudyRoom> createStudyRoom({
    required String title,
    required String topic,
    String description = '',
    int durationMinutes = 25,
    String focus = '',
  }) async {
    final response = await http.post(
      _uri('/study/rooms/'),
      headers: _headers(),
      body: json.encode({
        'title': title,
        'topic': topic,
        'description': description,
        'duration_minutes': durationMinutes,
        'focus': focus,
      }),
    );
    final data = _decode(response) as Map<String, dynamic>;
    return StudyRoom.fromJson(data);
  }

  Future<StudyRoom> joinStudyRoom({
    required int roomId,
    String focus = '',
  }) async {
    final response = await http.post(
      _uri('/study/rooms/$roomId/join/'),
      headers: _headers(),
      body: json.encode({'focus': focus}),
    );
    final data = _decode(response) as Map<String, dynamic>;
    return StudyRoom.fromJson(data);
  }

  Future<void> leaveStudyRoom(int roomId) async {
    final response = await http.post(
      _uri('/study/rooms/$roomId/leave/'),
      headers: _headers(),
      body: json.encode({}),
    );
    _decode(response);
  }

  Future<List<StudyMessage>> getStudyRoomMessages(int roomId) async {
    final response = await http.get(
      _uri('/study/rooms/$roomId/messages/'),
      headers: _headers(),
    );
    final data = _decode(response) as Map<String, dynamic>;
    final messages = data['messages'] as List<dynamic>? ?? [];
    return messages
        .map((row) => StudyMessage.fromJson(row as Map<String, dynamic>))
        .toList();
  }

  Future<StudyMessage> sendStudyRoomMessage({
    required int roomId,
    required String message,
  }) async {
    final response = await http.post(
      _uri('/study/rooms/$roomId/messages/'),
      headers: _headers(),
      body: json.encode({'message': message}),
    );
    final data = _decode(response) as Map<String, dynamic>;
    return StudyMessage.fromJson(data);
  }

  Future<List<Map<String, dynamic>>> getEvents() async {
    final response = await http.get(_uri('/events/'), headers: _headers());
    final data = _decode(response) as Map<String, dynamic>;
    final events = data['events'] as List<dynamic>? ?? [];
    return events.cast<Map<String, dynamic>>();
  }

  dynamic _decode(http.Response response) {
    final decoded = json.decode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded;
    }
    if (decoded is Map<String, dynamic>) {
      final message = decoded['error']?.toString() ?? 'Request failed';
      throw ApiException(message, response.statusCode);
    }
    throw ApiException('Request failed', response.statusCode);
  }
}

class ApiException implements Exception {
  ApiException(this.message, this.statusCode);

  final String message;
  final int statusCode;

  @override
  String toString() => 'ApiException($statusCode): $message';
}
