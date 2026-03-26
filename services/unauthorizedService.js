// services/unauthorizedService.js

import { config } from '../config/env.js';

import { removeTokensForUser } from './userTokenService.js';
import { logError } from '../utils/errorHelpers.js';

import { createLogOnlyAuthError } from '../mappers/errorRegistry/authErrors.js';

export const handleUnauthorizedError = async ({
	req,
	res,
	cleanErrors,
	getViewContext,
}) => {
	try {
		const userId = req.session?.spotify_user_id;

		if (userId) await removeTokensForUser(userId);

		if (req.session) {
			await new Promise((resolve) => {
				req.session.destroy(() => {
					res.clearCookie('riffQuestSessionId', {
						path: '/',
						secure: config.isProd,
						sameSite: config.isProd ? 'none' : 'lax',
						httpOnly: true,
					});
					resolve();
				});
			});
		}

		return res.status(401).render('error', {
			title: 'Session Expired',
			message:
				'Your Spotify session has expired. Please log in again to continue.',
			statusCode: 401,
			...getViewContext(req, res, cleanErrors),
		});
	} catch (error) {
		logError(
			createLogOnlyAuthError('unauthorizedCleanupFailure', {
				cause: error,
				metadata: {
					spotifyUserId: req.session?.spotify_user_id,
					sessionId: req.sessionID,
					originalUrl: req.originalUrl,
					ip: req.ip,
					userAgent: req.get('User-Agent'),
					referer: req.get('Referer'),
					method: req.method,
				},
			}),
		);

		return res.status(500).render('error', {
			title: 'Error',
			message:
				'An error occurred while processing your request. Please refresh the page or try again later.',
			statusCode: 500,
			...getViewContext(req, res, cleanErrors),
		});
	}
};
