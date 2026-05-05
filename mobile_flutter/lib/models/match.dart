import 'confession.dart';

class MatchPair {
  final int id;
  final Confession confessionA;
  final Confession confessionB;
  final double score;
  final String createdAt;

  MatchPair({
    required this.id,
    required this.confessionA,
    required this.confessionB,
    required this.score,
    required this.createdAt,
  });

  factory MatchPair.fromJson(Map<String, dynamic> json) {
    return MatchPair(
      id: json['id'] as int,
      confessionA: Confession.fromJson(
        json['confession_a'] as Map<String, dynamic>,
      ),
      confessionB: Confession.fromJson(
        json['confession_b'] as Map<String, dynamic>,
      ),
      score: (json['score'] as num?)?.toDouble() ?? 0,
      createdAt: json['created_at']?.toString() ?? '',
    );
  }
}
