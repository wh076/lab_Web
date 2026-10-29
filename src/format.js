export function formatTime(seconds) {
  return seconds.toFixed(1).replace('.', ',') + ' с';
}
