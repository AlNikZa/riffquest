// mappers/viewContextMapper.js

export const getViewContext = (req, res, cleanErrors = null) => {
	let csrf;
	try {
		csrf = typeof req.csrfToken === 'function' ? req.csrfToken() : null;
	} catch (e) {
		csrf = null;
	}
	return {
		isLoggedIn: !!req.session && req.session.spotify_user_id,
		username: req.session ? req.session.username : null,
		userImg: req.session ? req.session.userImg : null,
		artist: req.query.artist || null,
		album: req.query.album || null,
		track: req.query.track || null,
		csrfToken: csrf,
		nonce: res.locals.nonce || req.nonce || null,
		errors: cleanErrors || null,
	};
};
