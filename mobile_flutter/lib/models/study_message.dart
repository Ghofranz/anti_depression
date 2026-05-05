class StudyMessage {
  final int id;
  final int roomId;
  final String username;
  final String name;
  final String message;
  final String timestamp;

  StudyMessage({
    required this.id,
    required this.roomId,
    required this.username,
    required this.name,
    required this.message,
    required this.timestamp,
  });

  factory StudyMessage.fromJson(Map<String, dynamic> json) {
    return StudyMessage(
      id: json['id'] as int,
      roomId: json['room'] as int,
      username: json['username'] as String? ?? '',
      name: json['name'] as String? ?? '',
      message: json['message'] as String? ?? '',
      timestamp: json['timestamp']?.toString() ?? '',
    );
  }
}
