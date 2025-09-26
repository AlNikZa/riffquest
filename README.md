# RiffQuest 🎸

_Every song has its own riff._

Search for your favorite artists and explore their albums, top tracks, and detailed info via Spotify API.

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

Check out the deployed app here: [RiffQuest on Render](https://riffquest.onrender.com) 🔗

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

http://localhost:3000

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
├─ functions/
│  ├─ artistFunctions.js
│  └─ tokenFunctions.js
│
├─ public/
│  ├─ formModals.js
│  └─ logo.png
│
├─ views/
│  ├─ partials/
│  │  ├─ bootstrapModals.ejs
│  │  ├─ bootstrapScriptTag.ejs
│  │  ├─ footer.ejs
│  │  ├─ head.ejs
│  │  └─ navbar.ejs
│  ├─ artistAlbums.ejs
│  ├─ artistInfo.ejs
│  ├─ artistTopTracks.ejs
│  ├─ error.ejs
│  ├─ index.ejs
│  ├─ loading.ejs
│  └─ noResultsFound.ejs
│
├─ package.json
└─ server.js
```

## Error Handling

### Client errors

**noResultsFound.ejs** is rendered if no artist, album, or track is found.

### Server errors

**error.ejs** is rendered for server/API errors with details for debugging.

## License

MIT License
