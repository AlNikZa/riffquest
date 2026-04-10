# <img src="https://raw.githubusercontent.com/AlNikZa/riffquest/main/public/logo.png" alt="RiffQuest logo" height="24" display="inline"> RiffQuest

_Every song has its own riff._

RiffQuest is a music data aggregator that combines information from multiple external sources (MusicBrainz, Last.fm) to provide a comprehensive overview of artist discographies, biographies, and metadata. The project focuses on clean architecture, security, and precise data mapping across diverse API ecosystems.

> ⚠️ **Project status:** This app is still under active development.  
> Features and UI may change frequently.

---

## Features

- Deep Artist Insights: Access comprehensive artist profiles including type (Group/Person), origin, and active status.

- Member Lineup History: View detailed band member records with specific roles (e.g., "electric guitar", "drums") and their active timeframes within the project.

- Visual Discography: Explore full album lists with release dates and direct links to cover art via the Cover Art Archive.

- Biography & Metadata: Read full artist summaries and detailed histories aggregated from Last.fm and MusicBrainz.

- Engagement Stats: Real-time data on listener counts and total playcounts to gauge artist popularity.

- High-Quality Artist Images: Artist backgrounds, logos, and thumbnails powered by Fanart.tv.

---

## Tech

- **Node.js & Express.js** (using ES modules: import/export)
- **EJS templates** for server-side rendering
- **Bootstrap 5** for responsive UI
- **MusicBrainz API** for artist metadata and relationships
- **Last.fm API** for biographies and listener statistics
- **Fanart.tv API** for high-quality artist images and artwork
- **Vanilla JS** for client-side interactivity

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

### Get API Keys

- **MusicBrainz**
  - No API key required
  - A custom `User-Agent` is mandatory
  - See: https://musicbrainz.org/doc/MusicBrainz_API

- **Last.fm**
  - You need to register your application to get an API key
  - Register here: https://www.last.fm/api/account/create

- **Fanart.tv**
  - Free API key required
  - Get your key here: https://fanart.tv/get-an-api-key/

### Create a `.env` file in the root with your credentials.

```env
MUSIC_BRAINZ_USER_AGENT=YourAppName/Version ( your-email@example.com )
LASTFM_API_KEY=your_last_fm_api_key_here
FANARTTV_API_KEY=your_fanarttv_api_key_here

BASE_URL_DEV=http://127.0.0.1:3000
BASE_URL_PROD=https://your-production-domain.com

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

Search: Type an artist's name in the search bar on the home page.

Select: Choose the correct artist from the search results (powered by MusicBrainz).

Explore: Access a unified dashboard that displays:

Artist Info: Full biography, origin, and active years.

Discography: A visual list of albums with release dates and cover art.

Band Lineup: Current and former members with their specific roles and timeframes.

Statistics: Real-time listener counts and playcounts.

## Project Structure

```
RiffQuest/
│
├── config/
│   ├── axios.js
│   ├── db.js
│   ├── env.js
│   ├── helmet.js
│   ├── rateLimit.js
│   └── session.js
│
├── controllers/
│   ├── artistController.js
│   ├── devController.js
│   ├── homeController.js
│   ├── loginController.js
│   └── logoutController.js
│
├── mappers/
│   ├── errorRegistry/
│   │   ├── artistErrors.js
│   │   ├── authErrors.js
│   │   ├── databaseErrors.js
│   │   ├── externalApiErrors.js
│   │   ├── routingErrors.js
│   │   ├── securityErrors.js
│   │   ├── systemErrors.js
│   │   ├── userErrors.js
│   │   └── validationErrors.js
│   │
│   ├── externalApiErrorMapper.js
│   ├── lastFmMapper.js
│   ├── musicBrainzMapper.js
│   └── viewContextMapper.js
│
├── middleware/
│   ├── artistMiddleware.js
│   ├── csrf.js
│   ├── devMiddleware.js
│   ├── errorHandler.js
│   ├── noCacheMiddleware.js
│   ├── returnTo.js
│   ├── userSession.js
│   ├── userTokenMiddleware.js
│   └── validationHandler.js
│
├── models/
│   └── User.js
│
├── public/
│   ├── authModals.js
│   ├── autocomplete.js
│   ├── custom.css
│   ├── fanartTvLogo.svg
│   ├── favicon.ico
│   ├── lastfmLogo.svg
│   ├── logo.png
│   └── MusicBrainzLogo.svg
│
├── routes/
│   ├── artist.js
│   ├── dev.js
│   ├── home.js
│   ├── login.js
│   └── logout.js
│
├── services/
│   ├── artistService.js
│   ├── cryptoService.js
│   ├── devService.js
│   ├── loginService.js
│   ├── unauthorizedService.js
│   ├── userService.js
│   └── userTokenService.js
│
├── utils/
│   ├── AppError.js
│   ├── arrayUtils.js
│   ├── catchAsync.js
│   ├── errorHelpers.js
│   ├── httpUtils.js
│   ├── plainObjectUtils.js
│   ├── stringUtils.js
│   └── timeUtils.js
│
├── validators/
│   ├── commonValidators.js
│   ├── loginValidator.js
│   └── searchValidator.js
│
├── views/
│   ├── partials/
│   │   ├── bootstrapModals.ejs
│   │   ├── bootstrapScriptTag.ejs
│   │   ├── displayErrors.ejs
│   │   ├── footer.ejs
│   │   ├── head.ejs
│   │   └── navbar.ejs
│   │
│   ├── artistAlbums.ejs
│   ├── artistInfo.ejs
│   ├── artistTopTracks.ejs
│   ├── cookiePolicy.ejs
│   ├── error.ejs
│   ├── index.ejs
│   └── noResultsFound.ejs
│
├── .env.example
├── app.js
├── lifecycle.js
├── package.json
├── Procfile
└── server.js

13 directories, 83 files
```

## Error Management

### Robust Error Registry

The application utilizes a Centralized Error Registry Pattern to categorize and handle issues across different layers:

Operational Errors: Handled gracefully with user-friendly feedback (e.g., validation, authentication, or "no results" scenarios).

System & API Errors: Mapped from external sources (MusicBrainz/Last.fm) and logged for debugging while maintaining a stable UI.

### User Feedback

**noResultsFound.ejs**: Rendered when a search or specific resource lookup returns no data.

**error.ejs**: A dedicated global error page that provides context-aware messages based on the error type (Validation, Database, or External API issues).

## License

MIT License
