const VOICE_KEY = 'mariotrivia_voice_v1';
const RATE_KEY = 'mariotrivia_voice_rate_v1';
const PREFERRED = ['Google UK English Female', 'Karen', 'Samantha', 'Daniel', 'Microsoft Hazel', 'Microsoft Zira'];

export function speechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function availableVoices(): SpeechSynthesisVoice[] {
  return speechAvailable() ? window.speechSynthesis.getVoices().filter(voice => voice.lang.toLowerCase().startsWith('en')) : [];
}

export function getVoiceName(): string {
  try { return localStorage.getItem(VOICE_KEY) || ''; } catch { return ''; }
}

export function setVoiceName(name: string): void {
  localStorage.setItem(VOICE_KEY, name);
}

export function getSpeechRate(): number {
  try {
    const value = Number(localStorage.getItem(RATE_KEY));
    return value >= 0.5 && value <= 2 ? value : 1.05;
  } catch { return 1.05; }
}

export function setSpeechRate(rate: number): void {
  localStorage.setItem(RATE_KEY, String(Math.min(2, Math.max(0.5, rate))));
}

export function stopSpeaking(): void {
  if (speechAvailable()) window.speechSynthesis.cancel();
}

export function speakText(text: string): void {
  if (!speechAvailable()) return;
  stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = availableVoices();
  const chosen = voices.find(voice => voice.name === getVoiceName())
    ?? PREFERRED.map(name => voices.find(voice => voice.name.includes(name))).find(Boolean)
    ?? voices[0];
  if (chosen) utterance.voice = chosen;
  utterance.rate = getSpeechRate();
  utterance.pitch = 1.15;
  window.speechSynthesis.speak(utterance);
}
