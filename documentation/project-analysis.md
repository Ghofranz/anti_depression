# WhisperWall Project Analysis

## Overview

WhisperWall is a campus-oriented social matching platform built as two separate applications:

- Angular 21 frontend in `whisper-wall/`
- Django 6 REST backend in `whisperwall/`

The product centers on anonymous or semi-anonymous "confessions" that are matched by similarity. Once a match is found, the app supports chat, reveal/contact exchange, event suggestions, and live-related content.

## Frontend

The Angular app uses standalone components and route-based pages. Main routes include:

- landing
- login
- dashboard
- confess
- matches
- chat/:matchId
- reveal/:matchId
- event
- live
- watch/:id

The frontend stores authentication state in `localStorage` and sends token auth headers to the backend through `src/app/services/api.ts`.

## Backend

The Django backend uses Django REST Framework with token authentication.

Key API areas:

- authentication: sign up, login, logout
- confessions: create and list the current user's confessions
- matches: retrieve matches for a confession
- chat: send and read messages for a match
- reveal/contact exchange: reveal request and mutual contact exchange activation
- academic profile: create, read, update profile data
- events: return suggested or generated events for the current user

## Core Domain Model

Important backend models:

- `Confession`: user submitted post with emotion and location hint
- `Match`: pair of similar confessions
- `Event`: suggested activity attached to a match
- `ChatMessage`: direct message within a match
- `RevealRequest`: tracks whether both sides agreed to reveal/contact exchange
- `Reaction`: user reaction on a confession
- `Live`: live session linked to an event
- `AcademicProfile`: structured user profile information

## Matching Logic

When a new confession is saved, the model triggers `find_matches()`. That logic compares the new confession against other unpublished or unrevealed confessions, checks for same emotion, computes text and location similarity, and creates a `Match` plus an `Event` when the score passes the threshold.

## Notable Observations

- The app is still development-oriented: SQLite, `DEBUG = True`, and a hardcoded secret key in settings.
- CORS is configured only for `http://localhost:4200`.
- The backend exposes token auth and expects the Angular client to keep the token in `localStorage`.
- There is some overlap between reveal and contact-exchange flows, but the distinction is explicit in the backend.
- `get_all_confessions` exists in the backend but is not routed in `core/urls.py`.
- `CommonMiddleware` appears twice in Django settings.
- `send_message()` currently trusts the posted payload and does not obviously enforce that the sender belongs to the match.

## Documentation Files

- `uml-class-diagram.puml`
- `uml-use-case-diagram.puml`
- `uml-component-diagram.puml`
- `uml-deployment-diagram.puml`
- `uml-activity-user-flow.puml`
- `uml-sequence-signup-login.puml`
- `uml-sequence-confession-match.puml`
- `uml-sequence-reveal-contact-exchange.puml`
- `uml-state-confession-lifecycle.puml`
