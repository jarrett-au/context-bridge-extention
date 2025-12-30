import type { ClipItem } from '../../types';

export async function saveClip(clip: ClipItem): Promise<void> {
  const result = await chrome.storage.local.get(['clips']);
  const clips = (result.clips as ClipItem[]) || [];
  const newClips = [clip, ...clips];
  await chrome.storage.local.set({ clips: newClips });
}

export function getFavicon(): string {
    const link = document.querySelector("link[rel~='icon']");
    if (!link) return '/vite.svg';
    return (link as HTMLLinkElement).href;
}
