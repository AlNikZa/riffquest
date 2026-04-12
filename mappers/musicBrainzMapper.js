// mappers/musicBrainzMapper.js

const mapMembers = (relations) => {
	if (!relations) return [];

	const memberMap = relations
		.filter((rel) => rel.type === 'member of band' && rel.artist)
		.reduce((acc, rel) => {
			const artistId = rel.artist.id;
			if (!acc[artistId]) {
				acc[artistId] = {
					id: artistId,
					name: rel.artist.name,
					active: false,
					_roleSet: new Set(),
					periods: [],
				};
			}

			const attrs = rel.attributes || [];
			attrs.forEach((attr) => {
				if (attr !== 'original' && attr !== 'Member') {
					acc[artistId]._roleSet.add(attr);
				}
			});

			const begin = rel.begin || 'Unknown';
			const end = rel.end || (rel.ended ? 'Unknown' : 'Present');

			acc[artistId].periods.push({ begin, end });
			if (!rel.ended) acc[artistId].active = true;

			return acc;
		}, {});

	return Object.values(memberMap)
		.map((member) => {
			const { _roleSet, periods, ...rest } = member;

			const sortedPeriods = periods.sort((a, b) =>
				a.begin.localeCompare(b.begin),
			);
			const mergedPeriods = [];

			if (sortedPeriods.length > 0) {
				let current = sortedPeriods[0];
				for (let i = 1; i < sortedPeriods.length; i++) {
					let next = sortedPeriods[i];

					if (
						current.end === 'Present' ||
						next.begin <= current.end
					) {
						if (next.end === 'Present') current.end = 'Present';
						else if (
							current.end !== 'Present' &&
							next.end > current.end
						) {
							current.end = next.end;
						}
					} else {
						mergedPeriods.push(current);
						current = next;
					}
				}
				mergedPeriods.push(current);
			}

			let role = Array.from(_roleSet).join(', ');
			if (!role) role = 'Member';

			return {
				...rest,
				role,
				periods: mergedPeriods,
			};
		})

		.sort((a, b) => {
			if (a.active !== b.active) return b.active - a.active;
			return a.periods[0].begin.localeCompare(b.periods[0].begin);
		});
};

const mapBandActivity = (artistData, mappedMembers = []) => {
	const lifespan = artistData['life-span'] || {};
	const isPerson = artistData.type === 'Person';
	const albums = artistData['release-groups'] || [];

	let lastAlbumYear = 'Unknown';
	if (albums.length > 0) {
		const releaseDates = albums
			.map((g) => g['first-release-date'])
			.filter((d) => d && d.length >= 4)
			.sort();
		if (releaseDates.length > 0) {
			lastAlbumYear = releaseDates[releaseDates.length - 1].substring(
				0,
				4,
			);
		}
	}

	let established = 'Unknown';
	if (isPerson) {
		const releaseDates = albums
			.map((g) => g['first-release-date'])
			.filter((d) => d && d.length >= 4)
			.sort();
		established =
			releaseDates.length > 0
				? releaseDates[0].substring(0, 4)
				: lifespan.begin?.substring(0, 4) || 'Unknown';
	} else {
		established = lifespan.begin
			? lifespan.begin.substring(0, 4)
			: 'Unknown';
	}

	let active = !lifespan.ended;

	let merged = [];
	if (mappedMembers.length > 0) {
		const allPeriods = mappedMembers.flatMap((m) => m.periods);
		const sorted = allPeriods.sort((a, b) =>
			a.begin.localeCompare(b.begin),
		);

		if (sorted.length > 0) {
			let current = { ...sorted[0] };
			for (let i = 1; i < sorted.length; i++) {
				let next = sorted[i];
				if (current.end === 'Present' || next.begin <= current.end) {
					if (
						next.end === 'Present' ||
						(current.end !== 'Present' && next.end > current.end)
					) {
						current.end = next.end;
					}
				} else {
					merged.push(current);
					current = { ...next };
				}
			}
			merged.push(current);
		}
	}

	if (!active) {
		const ended = lifespan.end
			? lifespan.end.substring(0, 4)
			: lastAlbumYear !== 'Unknown'
				? lastAlbumYear
				: 'Unknown';

		merged = merged.map((p) => {
			let finalEnd = p.end;

			if (p.end === 'Present' || p.end === 'Unknown') {
				finalEnd = ended;
			}

			return {
				...p,
				end: finalEnd,
			};
		});

		return {
			active: false,
			established,
			activeYears:
				merged.length > 0
					? merged
							.map((p) => {
								const start =
									p.begin !== 'Unknown'
										? p.begin.substring(0, 4)
										: 'Unknown';

								const end =
									p.end !== 'Unknown'
										? p.end.substring(0, 4)
										: 'Unknown';

								return start === end
									? start
									: `${start}–${end}`;
							})
							.join(', ')
					: `${established}–${ended}`,
			periods: merged,
			ended: ended,
		};
	}

	const activeYearsString =
		merged.length > 0
			? merged
					.map((p) => {
						const start =
							p.begin !== 'Unknown'
								? p.begin.substring(0, 4)
								: 'Unknown';

						const end =
							p.end === 'Present'
								? 'Present'
								: p.end !== 'Unknown'
									? p.end.substring(0, 4)
									: 'Unknown';

						return start === end ? start : `${start}–${end}`;
					})
					.join(', ')
			: `${established}–Present`;

	return {
		active: true,
		established,
		activeYears: activeYearsString,
		periods: merged,
		ended: false,
	};
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

	const isPerson = data.type === 'Person';
	const members = mapMembers(data.relations || []);

	const activity = isPerson
		? mapBandActivity(data, [])
		: mapBandActivity(data, members);

	return {
		mbid: data.id,
		name: data.name,
		type: data.type || 'Person',
		country: data.country || 'Unknown',
		disambiguation: data.disambiguation || '',
		activity,
		members: isPerson ? [] : members,
		albums: mapReleaseGroups(data['release-groups'] || []),

		links: mapRelations(data.relations || []),

		aliases: (data.aliases || []).map((a) => a.name),
	};
};
