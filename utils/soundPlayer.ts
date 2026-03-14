let audio: HTMLAudioElement | null = null;

export function playNotificationSound(): void {
  try {
    if (typeof window === "undefined") return;
    if (!audio) {
      audio = new Audio("/sounds/alarm.mp3");
      audio.volume = 0.6;
    }
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Autoplay blocked until user interacts with page — safe to ignore
    });
  } catch {
    // Ignore audio errors silently
  }
}

export function stopNotificationSound(): void {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}
