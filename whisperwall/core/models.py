from django.db import models
from django.contrib.auth.models import User
from difflib import SequenceMatcher


class Confession(models.Model):
    EMOTIONS = [
        ('course_help', 'Course Help'),
        ('project_team', 'Project Team'),
        ('exam_preparation', 'Exam Preparation'),
        ('study_group', 'Study Group'),
        ('internship_advice', 'Internship Advice'),
        ('administrative_request', 'Administrative Request'),
        ('lost_found', 'Lost / Found'),
        # Fallbacks for existing db records to not crash:
        ('love', 'Love'), ('crush', 'Crush'), ('heartbreak', 'Heartbreak'), ('regret', 'Regret'), ('fight', 'Fight'), ('miss', 'Missing You'), ('apology', 'Apology')
    ]

    text = models.TextField()
    emotion = models.CharField(max_length=30, choices=EMOTIONS)
    location_hint = models.CharField(max_length=100)  # e.g. "math class", "gym"
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default=0)
    is_revealed = models.BooleanField(default=False)
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='confessions',
        null=True,
        blank=True
    )

    def __str__(self):
        return self.text[:50]

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new:
            find_matches(self)


class Match(models.Model):
    confession_a = models.ForeignKey(Confession, on_delete=models.CASCADE, related_name="matches_a")
    confession_b = models.ForeignKey(Confession, on_delete=models.CASCADE, related_name="matches_b")
    score = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Match #{self.pk} (score: {self.score:.2f})"


class Event(models.Model):
    match = models.OneToOneField(Match, on_delete=models.CASCADE)
    type = models.CharField(max_length=20)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    location = models.CharField(max_length=255, blank=True)
    plan = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class News(models.Model):
    title = models.CharField(max_length=255)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='news_posts',
    )
    is_published = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class LofiTrack(models.Model):
    title = models.CharField(max_length=200)
    audio_file = models.FileField(upload_to='')
    created_at = models.DateTimeField(auto_now_add=True)
    is_published = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class ChatMessage(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE)
    sender = models.ForeignKey(Confession, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} — {self.message[:30]}"


class RevealRequest(models.Model):
    match = models.OneToOneField(Match, on_delete=models.CASCADE)
    confession_a_accepted = models.BooleanField(default=False)
    confession_b_accepted = models.BooleanField(default=False)
    revealed = models.BooleanField(default=False)

    def try_reveal(self):
        if self.confession_a_accepted and self.confession_b_accepted:
            self.revealed = True
            self.save()
            self.match.confession_a.is_revealed = True
            self.match.confession_b.is_revealed = True
            self.match.confession_a.save()
            self.match.confession_b.save()


class Reaction(models.Model):
    REACTION_TYPES = [
        ('like', 'Like'),
        ('comment', 'Comment'),
    ]
    type = models.CharField(max_length=10, choices=REACTION_TYPES, default='like')
    content = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reactions')
    confession = models.ForeignKey(Confession, on_delete=models.CASCADE, related_name='reactions')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} — {self.type}"


class Live(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    live_date = models.DateTimeField(auto_now_add=True)
    link = models.URLField(blank=True)
    reaction = models.ForeignKey(Reaction, on_delete=models.CASCADE, null=True, blank=True)
    result = models.TextField(blank=True)

    def __str__(self):
        return f"Live for {self.event.title}"


class AcademicProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='academic_profile')
    display_name = models.CharField(max_length=100)
    academic_email = models.CharField(max_length=255)
    programme = models.CharField(max_length=150)
    bio = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} — {self.display_name}"

# ─── Helpers ────────────────────────────────────────────────────────────────

class StudyRoom(models.Model):
    title = models.CharField(max_length=120)
    topic = models.CharField(max_length=120)
    description = models.TextField(blank=True, default='')
    duration_minutes = models.PositiveIntegerField(default=25)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_rooms')
    started_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} - {self.topic}"


class StudyParticipant(models.Model):
    room = models.ForeignKey(StudyRoom, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_participations')
    focus = models.CharField(max_length=160, blank=True, default='')
    joined_at = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('room', 'user')

    def __str__(self):
        return f"{self.user.username} in {self.room.title}"


class StudyMessage(models.Model):
    room = models.ForeignKey(StudyRoom, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_messages')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}: {self.message[:30]}"


def similarity(a, b):
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


# def find_matches(new_confession):
#     matches = []

#     all_confessions = Confession.objects.exclude(id=new_confession.id)

#     for c in all_confessions:
#         if c.is_revealed:
#             continue
#         if c.emotion == new_confession.emotion:
#             location_score = similarity(c.location_hint, new_confession.location_hint)
#             text_score = similarity(c.text, new_confession.text)
#             score = (location_score * 0.6) + (text_score * 0.4)

#             if score > 0.6:
#                 match = Match.objects.create(
#                     confession_a=new_confession,
#                     confession_b=c,
#                     score=score
#                 )
#                 matches.append(match)
#                 event_suggestion = suggest_event(match.confession_a.emotion, match.confession_b.emotion)
#                 Event.objects.create(
#                     match=match,
#                     type=event_suggestion['type'],
#                     title=event_suggestion['title'],
#                     plan={'steps': event_suggestion['plan']}
#                 )

#     return matches
def find_matches(new_confession):
    matches = []

    # Exclude:
    # 1. the current confession itself
    # 2. all confessions created by the same user
    all_confessions = Confession.objects.exclude(
        id=new_confession.id
    ).exclude(
        author=new_confession.author
    )

    for c in all_confessions:
        if c.is_revealed:
            continue

        if c.emotion == new_confession.emotion:
            location_score = similarity(c.location_hint, new_confession.location_hint)
            text_score = similarity(c.text, new_confession.text)
            score = (location_score * 0.6) + (text_score * 0.4)

            if score > 0.6:
                # Avoid duplicate pair matches
                already_exists = Match.objects.filter(
                    models.Q(confession_a=new_confession, confession_b=c) |
                    models.Q(confession_a=c, confession_b=new_confession)
                ).exists()

                if already_exists:
                    continue

                match = Match.objects.create(
                    confession_a=new_confession,
                    confession_b=c,
                    score=score
                )
                matches.append(match)

                event_suggestion = suggest_event(
                    match.confession_a.emotion,
                    match.confession_b.emotion
                )

                Event.objects.create(
                    match=match,
                    type=event_suggestion['type'],
                    title=event_suggestion['title'],
                    plan={'steps': event_suggestion['plan']}
                )

    return matches

def suggest_event(feeling_a, feeling_b):
    if feeling_a == 'love' and feeling_b == 'love':
        return {
            'type': 'date',
            'title': 'Romantic Sunset Date',
            'plan': ['Meet at a café', 'Walk at sunset', 'Play 5 icebreaker questions']
        }
    if {feeling_a, feeling_b} == {'love', 'crush'}:
        return {
            'type': 'date',
            'title': 'Playful Cute Date',
            'plan': ['Guess each other game', 'Coffee', 'Share one secret']
        }
    if feeling_a == 'crush' and feeling_b == 'crush':
        return {
            'type': 'date',
            'title': 'Blind Icebreaker Date',
            'plan': ['Mystery game', 'Quick chat', "Guess each other's hobbies"]
        }
    if 'fight' in [feeling_a, feeling_b]:
        return {
            'type': 'battle',
            'title': 'Close Cage',
            'plan': [
                'No insults',
                'Number of rounds decided by the challenger',
                'The other decides the date of the match',
                'The loser walks with a prize and an apology',
                'No rematch'
            ]
        }
    if 'apology' in [feeling_a, feeling_b]:
        return {
            'type': 'date',
            'title': 'Trust Building Date',
            'plan': ['Apology chat', 'Small game', 'Mutual promise to communicate']
        }
    if 'miss' in [feeling_a, feeling_b]:
        return {
            'type': 'date',
            'title': 'Reconnect 💌',
            'plan': ['Send message', 'Plan mini date', 'Share memories']
        }
    return {
        'type': 'chat',
        'title': 'Start Talking 💬',
        'plan': ['Send first message', 'Icebreaker question']
    }
