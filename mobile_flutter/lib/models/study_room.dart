class StudyRoom {
  final int id;
  final String title;
  final String topic;
  final String description;
  final int durationMinutes;
  final String createdByUsername;
  final int activeParticipantCount;

  StudyRoom({
    required this.id,
    required this.title,
    required this.topic,
    required this.description,
    required this.durationMinutes,
    required this.createdByUsername,
    required this.activeParticipantCount,
  });

  factory StudyRoom.fromJson(Map<String, dynamic> json) {
    return StudyRoom(
      id: json['id'] as int,
      title: json['title'] as String? ?? '',
      topic: json['topic'] as String? ?? '',
      description: json['description'] as String? ?? '',
      durationMinutes: json['duration_minutes'] as int? ?? 25,
      createdByUsername: json['created_by_username'] as String? ?? '',
      activeParticipantCount: json['active_participant_count'] as int? ?? 0,
    );
  }
}
