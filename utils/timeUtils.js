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

// Converts seconds into "x day(s), x hour(s), x minute(s) and x second(s)"
export const secondsToReadableTime = (input) => {
  const totalSeconds = parseInt(input, 10);

  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return null;
  }

  if (totalSeconds === 0) return '0 seconds';

  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const units = [
    { label: 'day', value: days },
    { label: 'hour', value: hours },
    { label: 'minute', value: minutes },
    { label: 'second', value: seconds },
  ];

  // Filtering units > 0
  const parts = units
    .filter((unit) => unit.value > 0)
    .map((unit) => `${unit.value} ${unit.label}${unit.value !== 1 ? 's' : ''}`);

  if (parts.length > 1) {
    const lastPart = parts.pop();
    return `${parts.join(', ')} and ${lastPart}`;
  }

  return parts[0];
};
