export function getAudioUrlWithPodtracPrefix(audioUrl: string): string {
  const urlWithoutProtocol = audioUrl.replace(/^https?:\/\//, '');
  return `https://dts.podtrac.com/redirect.mp3/${urlWithoutProtocol}`;
}
