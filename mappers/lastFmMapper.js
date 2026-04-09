// mappers/lastFmMapper.js

const cleanLastFmBio = (text) => {
	if (!text) return '';

	let cleaned = text.replace(/\r\n/g, '\n').replace(/\t/g, ' ').trim();

	const multiArtistPattern =
		/^\s*There\s+(are|is)\s+.*?using the name.*?:\s*\n?/is;

	if (multiArtistPattern.test(cleaned)) {
		cleaned = cleaned.replace(multiArtistPattern, '');
	} else if (/^There\s+(are|is)\s+/i.test(cleaned)) {
		const firstLineEnd = cleaned.indexOf('\n');
		if (firstLineEnd !== -1) {
			cleaned = cleaned.slice(firstLineEnd + 1);
		}
	}

	cleaned = cleaned.replace(/^\s*\d+[\.\)]\s*/gm, '');

	const cutMarkers = [
		'\nStudio albums',
		'\nAlbums',
		'\nDiscography',
		'\nSimilar Artists',
		'\nTop Tracks',
	];

	for (const marker of cutMarkers) {
		const idx = cleaned.indexOf(marker);
		if (idx !== -1) {
			cleaned = cleaned.substring(0, idx);
			break;
		}
	}

	const otherBandPatterns = [
		/\nAn? [A-Z].*?band named .*?\./i,
		/\n.*?is a .*?group\./i,
	];

	for (const pattern of otherBandPatterns) {
		const match = cleaned.search(pattern);
		if (match !== -1) {
			cleaned = cleaned.substring(0, match);
		}
	}

	cleaned = cleaned.split(/Read more on Last\.fm|<a href/i)[0];

	cleaned = cleaned.replace(/<[^>]*>?/gm, '');

	cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

	return cleaned;
};

export const mapLastFmArtist = (lfmData) => {
	if (!lfmData) return null;

	return {
		bio: {
			summary:
				cleanLastFmBio(lfmData.bio?.summary) ||
				cleanLastFmBio(lfmData.bio?.content)?.slice(0, 300) ||
				'',
			content: cleanLastFmBio(lfmData.bio?.content) || '',
		},
		stats: {
			listeners: parseInt(lfmData.stats?.listeners || 0, 10),
			playcount: parseInt(lfmData.stats?.playcount || 0, 10),
		},
	};
};
