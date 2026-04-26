# How To Test And Try The Project

This project has two parts:

- Angular frontend in `whisper-wall/`
- Django backend in `whisperwall/`

The backend is Firebase-backed, so the frontend talks to Django, and Django talks to Firebase.

## Prerequisites

Make sure these tools are installed:

- Node.js and npm
- Python 3.11+ or the version used in your environment
- Firebase credentials for the backend

If you want real Firebase access, set these environment variables in the Django shell or a `.env` file for your local setup:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_WEB_API_KEY`
- `FIREBASE_CREDENTIALS_PATH`
- `FIRESTORE_DATABASE_ID`

The `FIREBASE_CREDENTIALS_PATH` value must point to a Firebase service account JSON file. If it is not set, commands that talk to Firestore, including `seed_test_data`, can fail with an Application Default Credentials error.

## Run The Backend

Open a terminal in the backend folder first:

```powershell
Set-Location whisperwall
```

Then install dependencies if needed:

```powershell
python -m pip install -r requirements.txt
```

Run Django checks:

```powershell
python manage.py check
```

Run the backend tests:

```powershell
python manage.py test core
```

Start the backend server:

```powershell
python manage.py runserver 8000
```

## Seed Demo Data

To create demo Firebase data for quick testing, run:

```powershell
python manage.py seed_test_data
```

Before running that command, make sure the backend can read a real service account JSON file that you downloaded from Firebase. The placeholder path below is only an example, and `seed_test_data` will fail until you replace it with an actual file path on your machine:

```powershell
$env:FIREBASE_PROJECT_ID="whisper-wall-campus"
$env:FIREBASE_WEB_API_KEY="AIzaSyCg5jwzJVauo_OATf9O9-QYM30UWKwoYEI"
$env:FIREBASE_CREDENTIALS_PATH="C:\Users\user\Desktop\University-project\Portail et outill colleborative\anti_depression\whisper-wall-campus-firebase-adminsdk-fbsvc-70be056438.json"
$env:FIRESTORE_DATABASE_ID="default"
```

If you only want to preview the demo records without writing to Firestore, use:

```powershell
python manage.py seed_test_data --dry-run
```

## Run The Frontend

Open a second terminal in the frontend folder:

```powershell
Set-Location whisper-wall
```

Then install npm dependencies if needed:

```powershell
npm install
```

Start the Angular app:

```powershell
npm start
```

Then open the app in the browser at:

```text
http://localhost:4200
```

## Frontend Checks

Run a production build:

```powershell
npm run build
```

Run the unit tests:

```powershell
npm test -- --watch=false
```

## Quick Smoke Test

After both servers are running, verify these flows:

1. Open the landing page.
2. Sign up or log in.
3. Submit a confession.
4. Check that a match can be created.
5. Open the Study With Me page.
6. Join a room and confirm you can see other people.
7. Switch the lo-fi track.
8. Confirm there is no chat or voice control in the room.

## Useful Notes

- If Angular build or tests fail with routing errors, make sure the app is opened from the `whisper-wall/` folder and that npm dependencies are installed.
- If Firebase auth fails, double-check the web API key and service account credentials.
- If you get `The database (default) does not exist` but `firebase firestore:databases:list` shows `.../databases/default`, set `FIRESTORE_DATABASE_ID=default` in the same shell before running Django commands.
- If demo data is missing, rerun the seed command before testing the study-room flow.
