// utils/spotifyMapper.js

export const mapSpotifyTrack = (song = {}) => ({
	artist: song.artists?.[0]?.name || 'Unknown Artist',
	album: song.album?.name || 'Unknown Album',
	name: song.name || 'Unknown Track',
	year: song.album?.release_date?.slice(0, 4) || null,
	image: song.album?.images?.[2]?.url || song.album?.images?.[0]?.url || null,
	url: song.external_urls?.spotify || '',
	href: song.href || '',
	id: song.id || '',
	popularity: song.popularity ?? 0,
});

export const mapSpotifyAlbum = (fullAlbum, duration) => ({
	artist: fullAlbum.artists?.[0]?.name || 'Unknown Artist',
	album: fullAlbum.name || 'Unknown Album',
	year: fullAlbum.release_date?.slice(0, 4) || null,
	image: fullAlbum.images?.[1]?.url || fullAlbum.images?.[0]?.url || null,
	id: fullAlbum.id || '',
	popularity: fullAlbum.popularity ?? 0,
	url: fullAlbum.external_urls.spotify || '',
	duration: duration,
});
