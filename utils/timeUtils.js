//utils/timeUtils.js

// Converts total milliseconds into: "H:MM:SS" if duration >= 1 hour
//"MM:SS" otherwise
export const formatAlbumDuration = (total_ms) => {
  const hours = Math.floor(total_ms / 3600000);
  const minutes = Math.floor((total_ms % 3600000) / 60000);
  const seconds = Math.floor((total_ms % 60000) / 1000);

  const minutesStr = minutes.toString().padStart(2, '0');
  const secondsStr = seconds.toString().padStart(2, '0');

  return hours >= 1
    ? `${hours}:${minutesStr}:${secondsStr}`
    : `${minutesStr}:${secondsStr}`;
};

// Sums up the duration_ms property of all tracks in an array
export const calculateTotalDuration = (tracks) => {
  return tracks.reduce((sum, track) => sum + (track?.duration_ms || 0), 0);
};
