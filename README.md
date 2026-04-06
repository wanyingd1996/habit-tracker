# 🗓️ Habit Tracker

A personal habit tracking web app with Pomodoro timer, cross-device sync, and cloud storage — accessible from any browser, including mobile.

**Live site:** https://wanyingd1996.github.io/habit-tracker/

---

## Features

- **Daily habit logging** — tap to mark a habit done for today, or toggle any past day on the calendar
- **Pomodoro timer** — 15 / 25 / 50 min focus sessions with automatic break suggestions (5 min short, 15 min long every 4 sessions)
- **Session notes & tags** — annotate each Pomodoro with a note and a tag (e.g. `#deep-work`)
- **Daily session target** — set a target number of sessions per day with a progress indicator
- **Weekly digest** — at-a-glance view of all habits for the current week on the home screen
- **Calendar view** — monthly calendar per habit, tap any past day to toggle
- **Quarter heatmap** — GitHub-style activity grid for the current quarter
- **Sessions log** — full history of Pomodoros with timestamps, duration, tags, and notes
- **Browser notifications** — desktop alerts when a session or break ends
- **Google Sign-In** — secure login, works on desktop and mobile (popup + redirect fallback)
- **Real-time sync** — data syncs instantly across all your devices via Firestore `onSnapshot`
- **Mobile-friendly** — responsive layout with top bar, bottom nav, and compact cards on small screens

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (UMD) + Babel standalone (no build step) |
| Styling | Tailwind CSS CDN + custom color classes |
| Database | Firebase Firestore (real-time, cloud) |
| Auth | Firebase Authentication (Google Sign-In) |
| Hosting | GitHub Pages |

---

## Firestore Data Structure

```
users/{uid}/meta/app               → { nextId, habitIds, lastCleanupQuarter }
users/{uid}/habits/{id}            → habit object (name, emoji, color, logs, totals…)
users/{uid}/habits/{id}/sessions/{YYYY-MM}  → { records: [...] }
```

Habit logs (`h.logs`) are pruned to the current quarter on first load each quarter to stay within Firebase's free tier. `totalDays` and `totalSessions` counters are never deleted.

---

## Firebase Setup (for your own deployment)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. **Build → Authentication → Sign-in method → Google → Enable**
3. **Build → Firestore Database → Create database** (production mode)
4. **Firestore → Rules** → paste and publish:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```
5. **Authentication → Settings → Authorized domains** → add your GitHub Pages domain (e.g. `username.github.io`)
6. **Project Settings → Your apps → Web app (`</>`)** → copy the `firebaseConfig` object
7. Open `habit-tracker.html`, find `FIREBASE_CONFIG` near the top, replace the values, save and redeploy

---

## Local Development

Serve the file over HTTP (required for Firebase Auth — `file://` won't work):

```bash
python3 serve.py
# then open http://localhost:3456/habit-tracker.html
```

Or use any static file server, e.g. `npx serve .`

---

## Deployment

The site is hosted on GitHub Pages from the `main` branch root. `index.html` is a copy of `habit-tracker.html` and is the entry point served by GitHub Pages.

```bash
cp habit-tracker.html index.html
git add habit-tracker.html index.html
git commit -m "update"
git push origin main
```
