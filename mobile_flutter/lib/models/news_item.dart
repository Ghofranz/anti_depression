class NewsItem {
  final int id;
  final String title;
  final String body;
  final String authorName;
  final String createdAt;

  NewsItem({
    required this.id,
    required this.title,
    required this.body,
    required this.authorName,
    required this.createdAt,
  });

  factory NewsItem.fromJson(Map<String, dynamic> json) {
    return NewsItem(
      id: json['id'] as int,
      title: json['title'] as String? ?? '',
      body: json['body'] as String? ?? '',
      authorName: json['author_name'] as String? ?? 'Admin',
      createdAt: json['created_at']?.toString() ?? '',
    );
  }
}
