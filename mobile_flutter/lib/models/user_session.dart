class UserSession {
  final int id;
  final String username;
  final String name;
  final String email;
  final String token;

  const UserSession({
    required this.id,
    required this.username,
    required this.name,
    required this.email,
    required this.token,
  });

  factory UserSession.fromJson(Map<String, dynamic> json, String token) {
    return UserSession(
      id: json['id'] as int,
      username: json['username'] as String? ?? '',
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      token: token,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'name': name,
      'email': email,
      'token': token,
    };
  }

  static UserSession? fromStored(Map<String, dynamic>? json) {
    if (json == null) {
      return null;
    }
    return UserSession(
      id: json['id'] as int? ?? 0,
      username: json['username'] as String? ?? '',
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      token: json['token'] as String? ?? '',
    );
  }
}
