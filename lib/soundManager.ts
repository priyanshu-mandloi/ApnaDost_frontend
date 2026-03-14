// Central sound manager — call playSound("task-urgent") anywhere
const soundMap = {
  "task-reminder": "/sounds/task-reminder.mp3",
  "task-urgent": "/sounds/task-urgent.mp3",
  "task-overdue": "/sounds/task-overdue.mp3",
  "morning-motivation": "/sounds/morning-motivation.mp3",
  "night-summary": "/sounds/night-summary.mp3",
  success: "/sounds/success.mp3",
} as const;

export type SoundKey = keyof typeof soundMap;

// ✅ Fixed: const instead of let (object reference never reassigned)
const audioCache: Partial<Record<SoundKey, HTMLAudioElement>> = {};

export function playSound(key: SoundKey, volume = 0.7) {
  if (typeof window === "undefined") return;
  try {
    if (!audioCache[key]) {
      audioCache[key] = new Audio(soundMap[key]);
    }
    const audio = audioCache[key]!;
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Browser requires user interaction first — silently ignore
    });
  } catch {
    // ignore
  }
}

export function playSoundForNotification(type: string, priority?: number) {
  if (type === "TASK_REMINDER") {
    playSound(priority === 3 ? "task-urgent" : "task-reminder");
  } else if (type === "TASK_OVERDUE") {
    playSound("task-overdue");
  } else if (type === "MOTIVATIONAL") {
    playSound("morning-motivation", 0.5);
  }
}
