class ChatMessage {
  final int id;
  final int matchId;
  final int senderConfessionId;
  final String message;
  final String timestamp;

  ChatMessage({
    required this.id,
    required this.matchId,
    required this.senderConfessionId,
    required this.message,
    required this.timestamp,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as int,
      matchId: json['match'] as int,
      senderConfessionId: json['sender'] as int,
      message: json['message'] as String? ?? '',
      timestamp: json['timestamp']?.toString() ?? '',
    );
  }
}
