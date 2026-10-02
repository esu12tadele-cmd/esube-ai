# Esube AI v1

Esube AI is a bilingual (English/Amharic) personal assistant prototype with:
- AI chat
- English/Amharic language toggle
- Female voice playback using the device/browser speech engine
- Personal assistant mode
- Nursing care-plan generator
- Mobile-first installable PWA UI

## Architecture
- `app/` = frontend PWA
- `server/` = Node.js/Express backend
- The OpenAI API key stays on the server, not in the Android/browser app.

OpenAI's current API direction is the Responses API; the older Assistants API was sunset on Aug. 26, 2026.

## Requirements
- Node.js 20+
- An OpenAI API key

## Run the backend
```bash
cd server
npm install
cp .env.example .env
# Put your key in .env
npm start
```

## Run the frontend
The easiest local test is:
```bash
cd app
python -m http.server 8080
```
Then open:
`http://localhost:8080`

By default the app calls `http://localhost:3000/api/chat`.
For production, set the API URL in `app/config.js`.

## Important
This is an educational/clinical-support assistant, not a substitute for clinical assessment, local protocols, or a licensed clinician. The care-plan generator should be reviewed before use with a patient.


## Easiest phone deployment: GitHub + Render

1. Create a GitHub repository named `esube-ai`.
2. Upload the contents of this folder to the repository (do NOT upload `.env`).
3. In Render, create a **New > Web Service** and connect the repository.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variables:
   - `OPENAI_API_KEY` = your OpenAI API key
   - `OPENAI_MODEL` = a model available to your API project
7. Deploy.
8. Open the resulting `https://...onrender.com` address on your Android phone.
9. In Chrome, use More (⋮) > **Install and create shortcut** > **Install** when offered.

The app and API are now served from one HTTPS address, so no separate frontend URL is needed.
