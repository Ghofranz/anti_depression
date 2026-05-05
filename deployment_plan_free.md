# Free Deployment Plan (Easy)

This plan keeps everything on free tiers and uses the simplest setup with minimal ops.

## 1) Backend (Django) — Render Free Web Service

1. Create a Render account.
2. New Web Service -> Connect repo -> select `whisperwall/`.
3. Build command:
   - `pip install -r requirements.txt`
4. Start command:
   - `gunicorn whisperwall.wsgi:application --chdir whisperwall --bind 0.0.0.0:$PORT`
5. Add environment variables:
   - `DJANGO_SECRET_KEY` (new secure value)
   - `DJANGO_DEBUG=false`
   - `DJANGO_ALLOWED_HOSTS=your-render-url.onrender.com`
   - `DATABASE_URL` (Render provides this if you add a free Postgres)
6. Update [whisperwall/whisperwall/settings.py](whisperwall/whisperwall/settings.py) to read env vars for `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, and database.
7. Run migrations from Render shell:
   - `python manage.py migrate`

## 2) Web Frontend (Angular) — Netlify Free

1. Build locally:
   - `cd whisper-wall`
   - `npm install`
   - `npm run build`
2. Drag and drop the `dist/` folder to Netlify.
3. Update API base URL in Angular to the Render URL.

## 3) Mobile App (Flutter) — Android APK (Free)

1. Build release APK:
   - `cd mobile_flutter`
   - `flutter build apk --release`
2. Upload the APK to Firebase App Distribution (free).
3. Set the production API base URL at build time:
   - `flutter build apk --release --dart-define=API_BASE_URL=https://your-render-url.onrender.com/api`

## 4) Quick Test Checklist

- Login/signup works on mobile.
- Confessions, matches, events, study rooms load.
- Chat send/receive works.

## Notes

- SQLite is not recommended for production. Use Render Postgres free tier.
- iOS production requires a paid Apple Developer account.
