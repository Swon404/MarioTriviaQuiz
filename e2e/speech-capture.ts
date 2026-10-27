import type { Page } from '@playwright/test';

// Headless WebKit on Windows has no speech engine. Capture the actual utterance
// passed by the app so both engines can verify that speech matches visible copy.
export async function captureSpeech(page: Page): Promise<void> {
  await page.addInitScript(() => {
    if (!('SpeechSynthesisUtterance' in window)) {
      Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: class {
        text: string;
        constructor(text: string) { this.text = text; }
      } });
    }
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      getVoices: () => [], cancel: () => {}, addEventListener: () => {}, removeEventListener: () => {},
      speak: (utterance: SpeechSynthesisUtterance) => { document.body.dataset.spoken = utterance.text; },
    } });
  });
}
