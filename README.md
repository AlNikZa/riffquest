# <img src="https://raw.githubusercontent.com/AlNikZa/riffquest/main/public/logo.png" alt="RiffQuest logo" height="24" display="inline"> RiffQuest

_Every song has its own riff._

Search for your favorite artists and explore their albums, top tracks, and detailed info via Spotify API.

> ⚠️ **Project status:** This app is still under active development.  
> Features and UI may change frequently.

---

## Features

- Search artists by name
- View all albums
- View top tracks
- View artist details
- Responsive design with Bootstrap 5
- Modals for action selection

---

## Tech

- Node.js & Express.js (using ES modules: import/export)
- EJS templates
- Bootstrap 5
- Spotify API
- Vanilla JS for interactivity

---

## Live Demo

Check out the deployed app here: [RiffQuest on Render](https://riffquestsandbox.onrender.com) 🔗

---

## Setup

### Clone the repo:

```bash
git clone https://github.com/AlNikZa/riffquest.git
cd riffquest
```

### Install dependencies:

```bash
npm install
```

### Create a `.env` file in the root with your Spotify credentials.

You can get your credentials from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/):

```env
CLIENT_ID=your_spotify_client_id
CLIENT_SECRET=your_spotify_client_secret
...
```

### Start the server:

```bash
npm start
```

or

```bash
node server.js
```

### Open in browser:

http://127.0.0.1:3000

## Usage

Type an artist's name in the search bar.

Choose an action via buttons, navbar dropdown or modal:

View all albums

View top tracks

View artist details

## Project Structure

```
RiffQuest/
│
├─ config/
│   ├─ db.js
│   ├─ env.js
│   ├─ helmet.js
│   ├─ rateLimit.js
│   └─ session.js
│
├─ controllers/
│   ├─ artistController.js
│   ├─ homeController.js
│   ├─ loginController.js
│   └─ logoutController.js
│
├─ middleware/
│   ├─ errorHandler.js
│   ├─ returnTo.js
│   └─ userSession.js
│
├─ models/
│   └─ User.js
│
├─ public/
│   ├─ authModals.js
│   ├─ autocomplete.js
│   ├─ favicon.ico
│   ├─ formModals.js
│   └─ logo.png
│
├─ routes/
│   ├─ artist.js
│   ├─ home.js
│   ├─ login.js
│   └─ logout.js
│
├─ services/
│   ├─ artistService.js
│   ├─ cryptoService.js
│   ├─ globalTokenService.js
│   ├─ loginService.js
│   ├─ userService.js
│   └─ userTokenService.js
│
├─ views/
│   ├─ partials/
│   │   ├─ bootstrapModals.ejs
│   │   ├─ bootstrapScriptTag.ejs
│   │   ├─ footer.ejs
│   │   ├─ head.ejs
│   │   └─ navbar.ejs
│   ├─ artistAlbums.ejs
│   ├─ artistInfo.ejs
│   ├─ artistTopTracks.ejs
│   ├─ cookiePolicy.ejs
│   ├─ error.ejs
│   ├─ index.ejs
│   ├─ loading.ejs
│   └─ noResultsFound.ejs
│
├─ package.json
├─ Procfile
└─ server.js
```

## Error Handling

### Client errors

**noResultsFound.ejs** is rendered if no artist, album, or track is found.

### Server errors

**error.ejs** is rendered for server/API errors with details for debugging.

## License

MIT License
