from django.core.management.base import BaseCommand, CommandError

from core.firebase_store import _db, ensure_firebase_initialized
from core.test_seed import DEMO_CHAT_MESSAGES, DEMO_CONFESSIONS, DEMO_EVENTS, DEMO_MATCH, DEMO_PROFILE, DEMO_USERS


class Command(BaseCommand):
    help = 'Seed demo Firebase test data for easy testing.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Print the demo data instead of writing it to Firestore.',
        )

    def handle(self, *args, **options):
        if options['dry_run']:
            self.stdout.write('Demo users:')
            for key, user in DEMO_USERS.items():
                self.stdout.write(f'- {key}: {user}')

            self.stdout.write('\nDemo confession data:')
            for key, confession in DEMO_CONFESSIONS.items():
                self.stdout.write(f'- {key}: {confession}')

            self.stdout.write('\nDemo match:')
            self.stdout.write(str(DEMO_MATCH))

            self.stdout.write('\nDemo profile:')
            self.stdout.write(str(DEMO_PROFILE))

            self.stdout.write('\nDemo events:')
            self.stdout.write(str(DEMO_EVENTS))
            self.stdout.write('\nDemo chat messages:')
            self.stdout.write(str(DEMO_CHAT_MESSAGES))
            return

        try:
            ensure_firebase_initialized()
        except Exception as exc:
            raise CommandError(f'Firebase is not configured correctly: {exc}') from exc

        db = _db()

        for user in DEMO_USERS.values():
            db.collection('users').document(user['uid']).set(
                {
                    'uid': user['uid'],
                    'username': user['username'],
                    'email': user['email'],
                    'name': user['name'],
                },
                merge=True,
            )

        for confession in DEMO_CONFESSIONS.values():
            db.collection('confessions').document(str(confession['id'])).set(confession, merge=True)

        db.collection('matches').document(str(DEMO_MATCH['id'])).set(DEMO_MATCH, merge=True)
        db.collection('reveal_requests').document(str(DEMO_MATCH['id'])).set(
            {
                'match_id': DEMO_MATCH['id'],
                'confession_a_accepted': True,
                'confession_b_accepted': False,
                'revealed': False,
            },
            merge=True,
        )
        db.collection('academic_profiles').document(DEMO_USERS['alice']['uid']).set(DEMO_PROFILE, merge=True)

        for event in DEMO_EVENTS['events']:
            db.collection('events').document(str(event['event_id'])).set(event, merge=True)

        for message in DEMO_CHAT_MESSAGES:
            db.collection('messages').document(str(message['id'])).set(message, merge=True)

        self.stdout.write(self.style.SUCCESS('Demo Firebase test data seeded successfully.'))
