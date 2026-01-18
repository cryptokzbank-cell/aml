import { SOUNDS } from '../constants';

class AudioService {
  private sounds: Record<string, HTMLAudioElement> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.sounds = {
        coin: new Audio(SOUNDS.COIN),
        buy: new Audio(SOUNDS.BUY),
        error: new Audio(SOUNDS.ERROR),
        deposit: new Audio(SOUNDS.DEPOSIT),
      };
      
      // Preload
      Object.values(this.sounds).forEach(audio => {
        audio.load();
        audio.volume = 0.5;
      });
    }
  }

  play(key: keyof typeof this.sounds) {
    const audio = this.sounds[key];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.warn("Audio play failed (interaction required):", e));
    }
  }
}

export const audioService = new AudioService();