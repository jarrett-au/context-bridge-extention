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

  const addClip = async (clip: ClipItem) => {
    // 获取最新的 clips 数据以避免竞态
    const result = await chrome.storage.local.get(['clips']);
    const currentClips = (result.clips as ClipItem[]) || [];
    const newClips = [clip, ...currentClips];
    setClips(newClips);
    await chrome.storage.local.set({ clips: newClips });
  };

  const synthesizeAndArchive = async (newClip: ClipItem, sourceIds: string[]) => {
    // 原子操作：添加新条目 + 归档旧条目
    // 1. 获取最新数据
    const result = await chrome.storage.local.get(['clips']);
    const currentClips = (result.clips as ClipItem[]) || [];

    // 2. 计算新状态
    const newClips = [newClip, ...currentClips].map(c => 
        sourceIds.includes(c.id) ? { ...c, status: 'archived' as const } : c
    );

    // 3. 更新
    setClips(newClips);
    await chrome.storage.local.set({ clips: newClips });
  };

  return { clips, deleteClip, deleteClips, updateClipStatus, clearClips, reorderClips, addClip, synthesizeAndArchive };
}
