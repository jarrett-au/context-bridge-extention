import { useState, useEffect } from 'react';
import type { ClipItem } from '../../types';

export function useClips() {
  const [clips, setClips] = useState<ClipItem[]>([]);

  useEffect(() => {
    // 1. Initial load
    chrome.storage.local.get(['clips'], (result) => {
      if (result.clips) {
        setClips(result.clips as ClipItem[]);
      }
    });

    // 2. Listen for changes (from Content Script or other parts)
    // 监听 storage 变化可能比监听 message 更可靠，因为 storage 是 source of truth
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes.clips) {
        setClips((changes.clips.newValue as ClipItem[]) || []);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    // 也可以监听 message 以获得即时反馈 (如果 storage 异步有延迟)
    // 但 storage.onChanged 通常足够快。

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const deleteClip = async (id: string) => {
    const newClips = clips.filter(c => c.id !== id);
    setClips(newClips); // Optimistic update
    await chrome.storage.local.set({ clips: newClips });
  };

  const deleteClips = async (ids: string[]) => {
    const newClips = clips.filter(c => !ids.includes(c.id));
    setClips(newClips);
    await chrome.storage.local.set({ clips: newClips });
  };

  const updateClipStatus = async (ids: string[], status: 'staging' | 'archived' | 'synthesis') => {
    const newClips = clips.map(c => ids.includes(c.id) ? { ...c, status } : c);
    setClips(newClips);
    await chrome.storage.local.set({ clips: newClips });
  };

  const clearClips = async () => {
    setClips([]);
    await chrome.storage.local.set({ clips: [] });
  };

  const reorderClips = async (newClips: ClipItem[]) => {
    setClips(newClips);
    await chrome.storage.local.set({ clips: newClips });
  };

  return { clips, deleteClip, deleteClips, updateClipStatus, clearClips, reorderClips };
}
