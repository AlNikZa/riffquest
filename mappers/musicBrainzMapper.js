// mappers/musicBrainzMapper.js

const mapMembers = (relations) => {
	if (!relations) return [];

	return relations
		.filter((rel) => rel.type === 'member of band' && rel.artist)
		.map((rel) => ({
			id: rel.artist.id,
			name: rel.artist.name,
			active: !rel.ended,
			role: rel.attributes?.length ? rel.attributes.join(', ') : 'Member',
			begin: rel.begin || 'Unknown',
			end: rel.end || 'Present',
		}));
};

const mapReleaseGroups = (groups) => {
	return groups
		.filter((group) => group['primary-type'] === 'Album')
		.map((group) => ({
			id: group.id,
			title: group.title,
			releaseDate: group['first-release-date'],
			primaryType: group['primary-type'],
			coverArt: `https://coverartarchive.org/release-group/${group.id}/front-250.jpg`,
		}))
		.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
};

const mapRelations = (relations) => {
	const usefulTypes = [
		'wikidata',
		'discogs',
		'official homepage',
		'social network',
	];

	return relations
		.filter((rel) => usefulTypes.includes(rel.type))
		.map((rel) => ({
			type: rel.type,
			url: rel.url.resource,
		}));
};

export const mapMusicBrainzArtist = (data) => {
	if (!data) return null;

	return {
		mbid: data.id,
		name: data.name,
		type: data.type || 'Person',
		country: data.country || 'Unknown',
		disambiguation: data.disambiguation || '',
		members: mapMembers(data.relations || []),
		albums: mapReleaseGroups(data['release-groups'] || []),

		links: mapRelations(data.relations || []),

		aliases: (data.aliases || []).map((a) => a.name),
	};
};
