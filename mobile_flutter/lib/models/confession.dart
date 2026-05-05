class Confession {
  final int id;
  final String text;
  final String emotion;
  final String locationHint;
  final int? authorId;
  final String createdAt;

  Confession({
    required this.id,
    required this.text,
    required this.emotion,
    required this.locationHint,
    required this.createdAt,
    this.authorId,
  });

  factory Confession.fromJson(Map<String, dynamic> json) {
    return Confession(
      id: json['id'] as int,
      text: json['text'] as String? ?? '',
      emotion: json['emotion'] as String? ?? '',
      locationHint: json['location_hint'] as String? ?? '',
      createdAt: json['created_at']?.toString() ?? '',
      authorId: json['author'] as int?,
    );
  }
}
