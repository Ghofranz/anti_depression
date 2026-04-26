from datetime import datetime, timezone
from difflib import SequenceMatcher
from typing import Any, Dict, List, Optional

import firebase_admin
from django.conf import settings
from firebase_admin import credentials, firestore


_firestore_client = None


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def ensure_firebase_initialized():
    global _firestore_client

    if _firestore_client is not None:
        return

    if not firebase_admin._apps:
        cred_path = settings.FIREBASE_CREDENTIALS_PATH
        if cred_path:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {'projectId': settings.FIREBASE_PROJECT_ID})
        else:
            firebase_admin.initialize_app(options={'projectId': settings.FIREBASE_PROJECT_ID})

    _firestore_client = firestore.client(database_id=settings.FIRESTORE_DATABASE_ID)


def _db():
    ensure_firebase_initialized()
    return _firestore_client


def _next_id(counter_name: str) -> int:
    db = _db()
    ref = db.collection('_counters').document(counter_name)
    snap = ref.get()
    if not snap.exists:
        ref.set({'value': 1})
        return 1

    current = int(snap.to_dict().get('value', 0))
    nxt = current + 1
    ref.update({'value': nxt})
    return nxt


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, (a or '').lower(), (b or '').lower()).ratio()


def list_confessions_by_author_uid(author_uid: str) -> List[Dict[str, Any]]:
    docs = _db().collection('confessions').where('author_uid', '==', author_uid).stream()
    rows = [d.to_dict() for d in docs]
    return sorted(rows, key=lambda x: x.get('id', 0), reverse=False)


def get_confession(confession_id: int) -> Optional[Dict[str, Any]]:
    docs = _db().collection('confessions').where('id', '==', confession_id).limit(1).stream()
    for d in docs:
        return d.to_dict()
    return None


def get_all_confessions() -> List[Dict[str, Any]]:
    docs = _db().collection('confessions').stream()
    rows = [d.to_dict() for d in docs]
    return sorted(rows, key=lambda x: x.get('id', 0), reverse=False)


def create_confession(data: Dict[str, Any], user: Any) -> Dict[str, Any]:
    confession_id = _next_id('confessions')
    row = {
        'id': confession_id,
        'text': data['text'],
        'emotion': data['emotion'],
        'location_hint': data['location_hint'],
        'created_at': utc_now_iso(),
        'likes': 0,
        'is_revealed': False,
        'author_uid': user.uid,
        'author_username': getattr(user, 'username', ''),
    }
    _db().collection('confessions').document(str(confession_id)).set(row)
    find_matches(row)
    return row


def _match_exists(a_id: int, b_id: int) -> bool:
    for d in _db().collection('matches').stream():
        row = d.to_dict()
        if {row.get('confession_a_id'), row.get('confession_b_id')} == {a_id, b_id}:
            return True
    return False


def suggest_event(feeling_a: str, feeling_b: str) -> Dict[str, Any]:
    if feeling_a == 'love' and feeling_b == 'love':
        return {
            'type': 'date',
            'title': 'Romantic Sunset Date',
            'plan': ['Meet at a cafe', 'Walk at sunset', 'Play 5 icebreaker questions'],
        }
    if {feeling_a, feeling_b} == {'love', 'crush'}:
        return {
            'type': 'date',
            'title': 'Playful Cute Date',
            'plan': ['Guess each other game', 'Coffee', 'Share one secret'],
        }
    if feeling_a == 'crush' and feeling_b == 'crush':
        return {
            'type': 'date',
            'title': 'Blind Icebreaker Date',
            'plan': ['Mystery game', 'Quick chat', "Guess each other's hobbies"],
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
                'No rematch',
            ],
        }
    if 'apology' in [feeling_a, feeling_b]:
        return {
            'type': 'date',
            'title': 'Trust Building Date',
            'plan': ['Apology chat', 'Small game', 'Mutual promise to communicate'],
        }
    if 'miss' in [feeling_a, feeling_b]:
        return {
            'type': 'date',
            'title': 'Reconnect',
            'plan': ['Send message', 'Plan mini date', 'Share memories'],
        }
    return {
        'type': 'chat',
        'title': 'Start Talking',
        'plan': ['Send first message', 'Icebreaker question'],
    }


def find_matches(new_confession: Dict[str, Any]) -> List[Dict[str, Any]]:
    matches = []
    candidates = get_all_confessions()

    for c in candidates:
        if c['id'] == new_confession['id']:
            continue
        if c.get('author_uid') == new_confession.get('author_uid'):
            continue
        if c.get('is_revealed'):
            continue
        if c.get('emotion') != new_confession.get('emotion'):
            continue

        location_score = similarity(c.get('location_hint', ''), new_confession.get('location_hint', ''))
        text_score = similarity(c.get('text', ''), new_confession.get('text', ''))
        score = (location_score * 0.6) + (text_score * 0.4)

        if score <= 0.6:
            continue

        if _match_exists(new_confession['id'], c['id']):
            continue

        match_id = _next_id('matches')
        match_row = {
            'id': match_id,
            'confession_a_id': new_confession['id'],
            'confession_b_id': c['id'],
            'score': score,
            'created_at': utc_now_iso(),
            'is_active': True,
        }
        _db().collection('matches').document(str(match_id)).set(match_row)
        matches.append(match_row)

        event_suggestion = suggest_event(new_confession.get('emotion', ''), c.get('emotion', ''))
        event_id = _next_id('events')
        event_row = {
            'id': event_id,
            'event_id': event_id,
            'match_id': match_id,
            'type': event_suggestion['type'],
            'title': event_suggestion['title'],
            'description': '',
            'location': '',
            'plan': {'steps': event_suggestion['plan']},
            'created_at': utc_now_iso(),
        }
        _db().collection('events').document(str(event_id)).set(event_row)

    return matches


def get_matches_for_confession(confession_id: int) -> List[Dict[str, Any]]:
    all_matches = [d.to_dict() for d in _db().collection('matches').stream()]
    conf_map = {c['id']: c for c in get_all_confessions()}

    out = []
    for m in all_matches:
        if m.get('confession_a_id') != confession_id and m.get('confession_b_id') != confession_id:
            continue

        confession_a = conf_map.get(m.get('confession_a_id'))
        confession_b = conf_map.get(m.get('confession_b_id'))
        if not confession_a or not confession_b:
            continue

        out.append(
            {
                'id': m.get('id'),
                'confession_a': confession_a,
                'confession_b': confession_b,
                'score': m.get('score', 0),
                'created_at': m.get('created_at'),
                'is_active': m.get('is_active', True),
            }
        )

    out.sort(key=lambda x: x.get('id', 0))
    return out


def _get_match(match_id: int) -> Optional[Dict[str, Any]]:
    docs = _db().collection('matches').where('id', '==', match_id).limit(1).stream()
    for d in docs:
        return d.to_dict()
    return None


def send_chat_message(match_id: int, sender_confession_id: int, message: str) -> Dict[str, Any]:
    msg_id = _next_id('messages')
    row = {
        'id': msg_id,
        'match': match_id,
        'sender': sender_confession_id,
        'message': message,
        'timestamp': utc_now_iso(),
    }
    _db().collection('messages').document(str(msg_id)).set(row)
    return row


def get_chat_messages(match_id: int) -> List[Dict[str, Any]]:
    docs = _db().collection('messages').where('match', '==', match_id).stream()
    rows = [d.to_dict() for d in docs]
    return sorted(rows, key=lambda x: x.get('id', 0))


def _get_reveal(match_id: int) -> Dict[str, Any]:
    docs = _db().collection('reveal_requests').where('match_id', '==', match_id).limit(1).stream()
    for d in docs:
        return d.to_dict()

    row = {
        'match_id': match_id,
        'confession_a_accepted': False,
        'confession_b_accepted': False,
        'revealed': False,
    }
    _db().collection('reveal_requests').document(str(match_id)).set(row)
    return row


def _save_reveal(match_id: int, reveal: Dict[str, Any]):
    _db().collection('reveal_requests').document(str(match_id)).set(reveal)


def request_reveal(match_id: int, confession_id: int, user_uid: str):
    confession = get_confession(confession_id)
    if not confession:
        return None, 'Confession not found', 404

    if confession.get('author_uid') != user_uid:
        return None, 'You can only reveal your own confessions', 403

    match = _get_match(match_id)
    if not match:
        return None, 'Match not found', 404

    reveal = _get_reveal(match_id)

    if confession_id == match.get('confession_a_id'):
        reveal['confession_a_accepted'] = True
    elif confession_id == match.get('confession_b_id'):
        reveal['confession_b_accepted'] = True
    else:
        return None, 'This confession is not part of the match', 400

    if reveal['confession_a_accepted'] and reveal['confession_b_accepted']:
        reveal['revealed'] = True
        conf_a = get_confession(match.get('confession_a_id'))
        conf_b = get_confession(match.get('confession_b_id'))
        if conf_a:
            conf_a['is_revealed'] = True
            _db().collection('confessions').document(str(conf_a['id'])).set(conf_a)
        if conf_b:
            conf_b['is_revealed'] = True
            _db().collection('confessions').document(str(conf_b['id'])).set(conf_b)

    _save_reveal(match_id, reveal)
    return reveal, '', 200


def _get_profile(uid: str) -> Optional[Dict[str, Any]]:
    snap = _db().collection('academic_profiles').document(uid).get()
    if snap.exists:
        return snap.to_dict()
    return None


def get_contact_exchange_status(match_id: int, user_uid: str):
    match = _get_match(match_id)
    if not match:
        return None, 'Match not found', 404

    conf_a = get_confession(match.get('confession_a_id'))
    conf_b = get_confession(match.get('confession_b_id'))

    if not conf_a or not conf_b:
        return None, 'Match confessions not found', 404

    if user_uid != conf_a.get('author_uid') and user_uid != conf_b.get('author_uid'):
        return None, 'Forbidden: You are not part of this match.', 403

    reveal = _get_reveal(match_id)

    if user_uid == conf_a.get('author_uid'):
        my_active = reveal.get('confession_a_accepted', False)
        peer_active = reveal.get('confession_b_accepted', False)
        peer_uid = conf_b.get('author_uid')
    else:
        my_active = reveal.get('confession_b_accepted', False)
        peer_active = reveal.get('confession_a_accepted', False)
        peer_uid = conf_a.get('author_uid')

    both_active = my_active and peer_active

    my_profile = _get_profile(user_uid)
    peer_profile = _get_profile(peer_uid) if both_active and peer_uid else None

    return {
        'match': match_id,
        'my_contact_exchange_active': my_active,
        'peer_contact_exchange_active': peer_active,
        'both_active': both_active,
        'my_profile': my_profile,
        'peer_profile': peer_profile,
    }, '', 200


def activate_contact_exchange(match_id: int, user_uid: str):
    match = _get_match(match_id)
    if not match:
        return None, 'Match not found', 404

    conf_a = get_confession(match.get('confession_a_id'))
    conf_b = get_confession(match.get('confession_b_id'))

    if not conf_a or not conf_b:
        return None, 'Match confessions not found', 404

    if user_uid != conf_a.get('author_uid') and user_uid != conf_b.get('author_uid'):
        return None, 'Forbidden', 403

    reveal = _get_reveal(match_id)

    if user_uid == conf_a.get('author_uid'):
        reveal['confession_a_accepted'] = True
        my_active = True
        peer_active = reveal.get('confession_b_accepted', False)
        peer_uid = conf_b.get('author_uid')
    else:
        reveal['confession_b_accepted'] = True
        my_active = True
        peer_active = reveal.get('confession_a_accepted', False)
        peer_uid = conf_a.get('author_uid')

    _save_reveal(match_id, reveal)

    both_active = my_active and peer_active

    return {
        'message': 'Contact exchange activated',
        'my_contact_exchange_active': my_active,
        'peer_contact_exchange_active': peer_active,
        'both_active': both_active,
        'my_profile': _get_profile(user_uid),
        'peer_profile': _get_profile(peer_uid) if both_active and peer_uid else None,
    }, '', 200


def get_or_update_profile(user_uid: str, data: Optional[Dict[str, Any]] = None):
    ref = _db().collection('academic_profiles').document(user_uid)
    snap = ref.get()

    if data is None:
        if not snap.exists:
            return None, 'Profile not found', 404
        return snap.to_dict(), '', 200

    if snap.exists:
        existing = snap.to_dict()
        existing['display_name'] = data.get('display_name', existing.get('display_name', ''))
        existing['academic_email'] = data.get('academic_email', existing.get('academic_email', ''))
        existing['programme'] = data.get('programme', existing.get('programme', ''))
        existing['bio'] = data.get('bio', existing.get('bio', ''))
        existing['updated_at'] = utc_now_iso()
        ref.set(existing)
        return existing, '', 200

    required = ['display_name', 'academic_email', 'programme']
    missing = [f for f in required if not data.get(f)]
    if missing:
        return None, f"Missing fields: {', '.join(missing)}", 400

    profile = {
        'user_uid': user_uid,
        'display_name': data['display_name'],
        'academic_email': data['academic_email'],
        'programme': data['programme'],
        'bio': data.get('bio', ''),
        'created_at': utc_now_iso(),
        'updated_at': utc_now_iso(),
    }
    ref.set(profile)
    return profile, '', 201


def get_events_for_user(user_uid: str):
    confessions = list_confessions_by_author_uid(user_uid)
    conf_ids = {c.get('id') for c in confessions}
    match_ids = set()

    for d in _db().collection('matches').stream():
        m = d.to_dict()
        if m.get('confession_a_id') in conf_ids or m.get('confession_b_id') in conf_ids:
            match_ids.add(m.get('id'))

    out = []
    for d in _db().collection('events').stream():
        e = d.to_dict()
        if e.get('match_id') in match_ids:
            out.append(
                {
                    'event_id': e.get('event_id', e.get('id')),
                    'match_id': e.get('match_id'),
                    'title': e.get('title'),
                    'type': e.get('type'),
                    'plan': e.get('plan'),
                    'created_at': e.get('created_at'),
                }
            )

    return {'events': sorted(out, key=lambda x: x.get('event_id', 0))}


def upsert_user_profile(uid: str, username: str, email: str, name: str):
    ref = _db().collection('users').document(uid)
    snap = ref.get()

    payload = {
        'uid': uid,
        'username': username,
        'email': email,
        'name': name,
        'updated_at': utc_now_iso(),
    }
    if not snap.exists:
        payload['created_at'] = utc_now_iso()

    ref.set(payload, merge=True)


def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    docs = _db().collection('users').where('username', '==', username).limit(1).stream()
    for d in docs:
        return d.to_dict()
    return None
